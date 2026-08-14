import { NextResponse } from 'next/server';

// NextAuth callback endpoint — required for OAuth flows. With the
// credentials provider this simply confirms the session is valid.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get('callbackUrl') ?? '/';
  return NextResponse.redirect(new URL(callbackUrl, request.url));
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get('callbackUrl') ?? '/';
  return NextResponse.redirect(new URL(callbackUrl, request.url));
}
