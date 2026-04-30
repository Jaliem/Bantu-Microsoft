import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  limit,
  serverTimestamp,
} from "firebase/firestore";

function getDb() {
  const app = !getApps().length
    ? initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      })
    : getApp();
  return getFirestore(app);
}

export async function POST(request: NextRequest) {
  console.log("[Mayar Webhook] Incoming request at", new Date().toISOString());

  // Validate callback token if configured
  const webhookToken = process.env.MAYAR_WEBHOOK_TOKEN;
  if (webhookToken) {
    const incomingToken =
      request.headers.get("x-callback-token") ??
      request.headers.get("authorization")?.replace("Bearer ", "");
    if (incomingToken !== webhookToken) {
      console.warn("[Mayar Webhook] Invalid callback token — rejecting request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("[Mayar Webhook] Callback token validated");
  } else {
    console.warn("[Mayar Webhook] MAYAR_WEBHOOK_TOKEN not set — skipping token validation");
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    console.error("[Mayar Webhook] Failed to parse request body as JSON");
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("[Mayar Webhook] Raw payload:", JSON.stringify(payload, null, 2));

  const event: string = (payload?.event as string) ?? "";
  const data = payload?.data as Record<string, unknown> | undefined;
  const status: string = ((data?.status ?? data?.transactionStatus) as string) ?? "";

  console.log(`[Mayar Webhook] event="${event}" status="${status}"`);

  if (event !== "payment.received" && event !== "payment.reminder") {
    console.log(`[Mayar Webhook] Ignoring unhandled event "${event}"`);
    return NextResponse.json({ received: true });
  }

  if (event === "payment.reminder" && status.toUpperCase() !== "SUCCESS") {
    console.log(`[Mayar Webhook] payment.reminder with non-SUCCESS status "${status}" — skipping`);
    return NextResponse.json({ received: true });
  }

  const customerEmail = (data?.customerEmail as string) ?? "";
  const paidAmount = (data?.amount as number) ?? 0;
  // Mayar webhook sends the payment link id as `id`
  const mayarPaymentId = (data?.id as string) ?? "";
  const description = (data?.description as string) ?? "";

  console.log("[Mayar Webhook] Parsed fields:", { customerEmail, paidAmount, mayarPaymentId, description });

  if (!customerEmail || !paidAmount) {
    console.error("[Mayar Webhook] Missing required fields — customerEmail or amount is empty");
    return NextResponse.json({ error: "Missing payload fields" }, { status: 400 });
  }

  const db = getDb();

  // Strategy 1: match by mayarPaymentId stored on the pending transaction
  if (mayarPaymentId) {
    console.log(`[Mayar Webhook] Strategy 1: querying transactions where mayarPaymentId="${mayarPaymentId}"`);
    const q = query(
      collection(db, "transactions"),
      where("mayarPaymentId", "==", mayarPaymentId),
      where("status", "==", "pending"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const txDoc = snap.docs[0];
      console.log(`[Mayar Webhook] Strategy 1 matched transaction id="${txDoc.id}" — marking completed`);
      await updateDoc(doc(db, "transactions", txDoc.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      console.log("[Mayar Webhook] Transaction updated successfully");
      return NextResponse.json({ received: true });
    }
    console.log("[Mayar Webhook] Strategy 1: no match found");
  }

  // Strategy 2: match by userId embedded in description + amount
  // Description format: "Top Up BANTU Wallet - {userId}"
  const userIdMatch = description.match(/Top Up BANTU Wallet - (.+)/);
  if (userIdMatch) {
    const userId = userIdMatch[1].trim();
    console.log(`[Mayar Webhook] Strategy 2: querying transactions where userId="${userId}" amount=${paidAmount}`);
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("amount", "==", paidAmount),
      where("status", "==", "pending"),
      where("type", "==", "credit"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const txDoc = snap.docs[0];
      console.log(`[Mayar Webhook] Strategy 2 matched transaction id="${txDoc.id}" — marking completed`);
      await updateDoc(doc(db, "transactions", txDoc.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      console.log("[Mayar Webhook] Transaction updated successfully");
      return NextResponse.json({ received: true });
    }
    console.log("[Mayar Webhook] Strategy 2: no match found");
  }

  // Strategy 3: find user by email, then match pending topup by amount
  console.log(`[Mayar Webhook] Strategy 3: looking up user with email="${customerEmail}"`);
  const usersQ = query(
    collection(db, "users"),
    where("email", "==", customerEmail),
    limit(1)
  );
  const usersSnap = await getDocs(usersQ);
  if (!usersSnap.empty) {
    const userId = usersSnap.docs[0].id;
    console.log(`[Mayar Webhook] Strategy 3: found userId="${userId}", querying pending transaction for amount=${paidAmount}`);
    const txQ = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("amount", "==", paidAmount),
      where("status", "==", "pending"),
      where("type", "==", "credit"),
      limit(1)
    );
    const txSnap = await getDocs(txQ);
    if (!txSnap.empty) {
      const txDoc = txSnap.docs[0];
      console.log(`[Mayar Webhook] Strategy 3 matched transaction id="${txDoc.id}" — marking completed`);
      await updateDoc(doc(db, "transactions", txDoc.id), {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      console.log("[Mayar Webhook] Transaction updated successfully");
      return NextResponse.json({ received: true });
    }
    console.log("[Mayar Webhook] Strategy 3: no matching pending transaction found for this user");
  } else {
    console.log(`[Mayar Webhook] Strategy 3: no user found with email="${customerEmail}"`);
  }

  console.warn("[Mayar Webhook] All strategies exhausted — no matching pending transaction found", {
    customerEmail,
    paidAmount,
    mayarPaymentId,
    description,
  });
  return NextResponse.json({ received: true });
}
