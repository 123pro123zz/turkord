import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  const username = searchParams.get("username");

  if (!room || !username) {
    return NextResponse.json(
      { error: 'Missing "room" or "username"' },
      { status: 400 }
    );
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const uniqueId = `${username}-${Math.random().toString(36).substring(2, 9)}`;
  const at = new AccessToken(apiKey, apiSecret, { identity: uniqueId, name: username });
  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });

  return NextResponse.json({ token: await at.toJwt() });
}
