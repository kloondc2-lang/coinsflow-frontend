export async function POST(request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return Response.json({ success: false, error: 'Not configured' }, { status: 503 });
  }

  let token;
  try {
    const body = await request.json();
    token = body?.token;
  } catch {
    return Response.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  if (!token || typeof token !== 'string') {
    return Response.json({ success: false, error: 'Token required' }, { status: 400 });
  }

  // Forward requester IP to Cloudflare for better accuracy
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || undefined;

  const params = new URLSearchParams({ secret, response: token });
  if (ip) params.append('remoteip', ip);

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();

    if (data.success) {
      return Response.json({ success: true });
    }
    return Response.json({ success: false }, { status: 403 });
  } catch {
    return Response.json({ success: false, error: 'Verification service unavailable' }, { status: 502 });
  }
}
