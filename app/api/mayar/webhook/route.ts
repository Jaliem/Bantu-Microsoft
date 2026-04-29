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
  try {
    const webhookToken = process.env.MAYAR_WEBHOOK_TOKEN;

    // Verify webhook authenticity via token header if configured
    if (webhookToken && webhookToken !== "your_mayar_webhook_token_here") {
      const authHeader = request.headers.get("authorization") ?? "";
      const token = authHeader.replace("Bearer ", "");
      if (token !== webhookToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json();
    const event: string = payload?.event?.received ?? payload?.event;
    const status: string | undefined = payload?.data?.status ?? payload?.data?.transactionStatus;

    if (event !== "payment.received" && event !== "payment.reminder") {
      return NextResponse.json({ received: true });
    }

    if (event === "payment.reminder" && status && status.toUpperCase() !== "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    const customerEmail: string = payload?.data?.customerEmail;
    const paidAmount: number = payload?.data?.amount;
    // Mayar sends productId which maps to our payment request id
    const mayarPaymentId: string = payload?.data?.productId ?? payload?.data?.id;

    if (!customerEmail || !paidAmount) {
      return NextResponse.json({ error: "Missing payload fields" }, { status: 400 });
    }

    const db = getDb();

    // Strategy 1: match by mayarPaymentId stored on the pending transaction
    if (mayarPaymentId) {
      const q = query(
        collection(db, "transactions"),
        where("mayarPaymentId", "==", mayarPaymentId),
        where("status", "==", "pending"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const txDoc = snap.docs[0];
        await updateDoc(doc(db, "transactions", txDoc.id), { status: "completed" });
        return NextResponse.json({ received: true });
      }
    }

    // Strategy 2: match by userId embedded in description + amount
    // Description format: "Top Up BANTU Wallet - {userId}"
    const descPattern = payload?.data?.description ?? "";
    const userIdMatch = descPattern.match(/Top Up BANTU Wallet - (.+)/);
    if (userIdMatch) {
      const userId = userIdMatch[1].trim();
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
        await updateDoc(doc(db, "transactions", txDoc.id), { status: "completed" });
        return NextResponse.json({ received: true });
      }
    }

    // Strategy 3: find user by email, then match pending topup by amount
    const usersQ = query(
      collection(db, "users"),
      where("email", "==", customerEmail),
      limit(1)
    );
    const usersSnap = await getDocs(usersQ);
    if (!usersSnap.empty) {
      const userId = usersSnap.docs[0].id;
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
        await updateDoc(doc(db, "transactions", txSnap.docs[0].id), { status: "completed" });
        return NextResponse.json({ received: true });
      }
    }

    console.warn("Mayar webhook: no matching pending transaction found", { customerEmail, paidAmount, mayarPaymentId });
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
