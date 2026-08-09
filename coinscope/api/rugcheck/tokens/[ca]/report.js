module.exports = async function handler(req, res) {
  const ca = req.query.ca;

  if (!ca) {
    return res.status(400).json({
      error: "Missing token address"
    });
  }

  try {
    const response = await fetch(
      `https://api.rugcheck.xyz/v1/tokens/${encodeURIComponent(ca)}/report`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error("RugCheck API error:", error);

    return res.status(500).json({
      error: "Failed to fetch RugCheck data"
    });
  }
};
