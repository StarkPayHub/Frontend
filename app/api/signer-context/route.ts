/**
 * POST /api/signer-context
 *
 * Receives a Privy access token, verifies it server-side, and returns
 * the signer context for Starkzap to derive the user's Starknet wallet.
 * Private key material never leaves the server.
 *
 * Requires:
 *   PRIVY_APP_ID     — from Privy dashboard (also set as NEXT_PUBLIC_PRIVY_APP_ID)
 *   PRIVY_APP_SECRET — from Privy dashboard (server-side only)
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  const accessToken = authHeader?.replace("Bearer ", "");

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token" }, { status: 401 });
  }

  const appId = process.env.PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    console.error("Missing PRIVY_APP_ID or PRIVY_APP_SECRET env vars");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  try {
    // Verify the Privy access token via their verification endpoint
    const verifyRes = await fetch("https://auth.privy.io/api/v1/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "privy-app-id": appId,
      },
    });

    if (!verifyRes.ok) {
      return NextResponse.json({ error: "Invalid access token" }, { status: 401 });
    }

    const user = await verifyRes.json();

    // Return the signer context. Starkzap uses this to derive the AA wallet.
    // Structure follows Starkzap's PrivySignerContext interface.
    return NextResponse.json({
      userId: user.id,
      appId,
      // Starkzap will use these to reconstruct the embedded signer on the client side
    });
  } catch (err) {
    console.error("Signer context error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
