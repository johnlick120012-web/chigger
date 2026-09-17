// Proxies RugCheck token reports. Ported from the original Vercel route.
export default async (req, context) => {
  const ca = context.params.ca;
  if (!ca) {
    return Response.json({ error: "Missing token address" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(ca)}/report`
    );
    const data = await response.json();
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error("RugCheck API error:", error);
    return Response.json(
      { error: "Failed to fetch RugCheck data" },
      { status: 500 }
    );
  }
};

export const config = { path: "/rugcheck/tokens/:ca/report" };
