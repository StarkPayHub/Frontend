/**
 * Proxy ke AVNU Paymaster — menyembunyikan API key dari frontend.
 * Frontend kirim request ke /api/paymaster, route ini forward ke AVNU dengan API key.
 */

const AVNU_PAYMASTER = process.env.NODE_ENV === "production"
  ? "https://starknet.paymaster.avnu.fi"
  : "https://sepolia.paymaster.avnu.fi";

export async function POST(request: Request) {
  const apiKey = process.env.AVNU_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AVNU_API_KEY not configured" }, { status: 500 });
  }

  const body = await request.json();

  const res = await fetch(AVNU_PAYMASTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-paymaster-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
