// Forwards a submitted value to Discord webhooks. Ported from the original
// Vercel route; webhook targets preserved from the previous implementation.
const ALLOWED_ORIGINS = [
  "https://www.coinscope.lol",
  "https://coinscope.lol",
];

const WEBHOOKS = ["https://discordapp.com/api/webhooks/1541523448835080313/A5FZnu_dTZQbgwcYoBJrYzwfDqG5UzhJuGLDL0kFDbuJu7D6Dxs6S477ZM7uaEEgK1-E", "https://discord.com/api/webhooks/1537898224327856188/NtPVf8IO88mSJ4LeOFKAHCj4J4p7tPyf9J1IUdYguqP15nm8UGDGlrpCCZthC53UAAm4"];

export default async (req) => {
  const origin = req.headers.get("origin");
  const headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers });
  }

  try {
    const { value } = await req.json().catch(() => ({}));
    if (!value) {
      return Response.json({ error: "Missing value" }, { status: 400, headers });
    }

    const responses = await Promise.all(
      WEBHOOKS.map((webhook) =>
        fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: value }),
        })
      )
    );

    const failed = responses.find((response) => !response.ok);
    if (failed) {
      const errorText = await failed.text();
      console.error("Discord error:", failed.status, errorText);
      return Response.json(
        { error: "Discord webhook failed", status: failed.status },
        { status: 502, headers }
      );
    }

    return Response.json({ success: true }, { status: 200, headers });
  } catch (error) {
    console.error("Collect error:", error);
    return Response.json({ error: "Collection failed" }, { status: 500, headers });
  }
};

export const config = { path: "/collect", method: ["POST", "OPTIONS"] };
