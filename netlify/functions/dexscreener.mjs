// Proxies DexScreener token data. Ported from the original Vercel route.
export default async (req, context) => {
  const ca = context.params.ca;
  if (!ca) {
    return Response.json({ error: "Missing token address" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.dexscreener.com/tokens/v1/solana/${encodeURIComponent(ca)}`
    );
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("DexScreener API error:", error);
    return Response.json(
      { error: "Failed to fetch DexScreener data" },
      { status: 500 }
    );
  }
};

export const config = { path: "/dexscreener/:ca" };
