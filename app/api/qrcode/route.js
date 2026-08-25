import QRCode from 'qrcode';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');
  if (!target) {
    return new Response('missing url', { status: 400 });
  }
  const buffer = await QRCode.toBuffer(target, {
    type: 'png',
    width: 800,
    margin: 2,
    color: { dark: '#146a34', light: '#ffffff' },
  });
  return new Response(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store',
    },
  });
}
