import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not set' }, { status: 500 });
  }

  const res = await fetch('https://api.heygen.com/v1/streaming.create_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to get session token' }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ token: data.data.token });
} 