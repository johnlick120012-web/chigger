export default async function handler(req, res) {
  const value = req.query.value ?? "";

  console.log("Received value:", value);

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: `Received value: ${value}`
      })
    });
  }

  res.status(200).json({
    received: value
  });
}