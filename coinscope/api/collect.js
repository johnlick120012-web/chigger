module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { value } = req.body || {};

    if (!value) {
      return res.status(400).json({ error: 'Missing value' });
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhook) {
      return res.status(500).json({ error: 'Discord webhook not configured' });
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: value
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord error:', response.status, errorText);

      return res.status(502).json({
        error: 'Discord webhook failed',
        status: response.status
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Collect error:', error);

    return res.status(500).json({
      error: 'Collection failed'
    });
  }
};
