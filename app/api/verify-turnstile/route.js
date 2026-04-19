export async function POST(request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // If secret key isn't configured on this server, fail open (let user through)
  // This prevents the gate from blocking the entire site due to a missing env var
  if (!secret) {
    return Response.json({ success: true });
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
    // Network error reaching Cloudflare — fail open to avoid blocking users
    return Response.json({ success: true });
  }
}
