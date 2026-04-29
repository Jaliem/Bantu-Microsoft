import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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
    const { userId, userEmail, userName, userPhone, amount } = await request.json();

    if (!userId || !userEmail || !userName || !amount || amount < 10000) {
      return NextResponse.json({ error: "Minimum top up Rp 10.000" }, { status: 400 });
    }

    const apiKey = process.env.MAYAR_API_KEY;
    if (!apiKey || apiKey === "your_mayar_api_key_here") {
      return NextResponse.json({ error: "Mayar API key belum dikonfigurasi" }, { status: 500 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // const mayarRes = await fetch("https://api.mayar.id/hl/v1/payment/create", {
    const mayarRes = await fetch("https://api.mayar.club/hl/v1/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        mobile: userPhone ?? "08000000000",
        amount,
        description: `Top Up BANTU Wallet - ${userId}`,
        redirectURL: `${appUrl}/wallet?topup=success`,
        expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });

    if (!mayarRes.ok) {
      const errText = await mayarRes.text();
      console.error("Mayar API error:", errText);
      return NextResponse.json({ error: "Gagal membuat link pembayaran" }, { status: 502 });
    }

    const mayarData = await mayarRes.json();
    const mayarPaymentId: string = mayarData.data?.id;
    const paymentUrl: string = mayarData.data?.link;

    if (!paymentUrl) {
      return NextResponse.json({ error: "Tidak ada URL pembayaran dari Mayar" }, { status: 502 });
    }

    const db = getDb();
    const txRef = await addDoc(collection(db, "transactions"), {
      userId,
      amount,
      type: "credit",
      description: "Top Up BANTU Wallet",
      status: "pending",
      mayarPaymentId,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ paymentUrl, transactionId: txRef.id });
  } catch (err) {
    console.error("Topup route error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
