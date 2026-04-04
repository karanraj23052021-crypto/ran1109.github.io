module.exports = async function(req, res) {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const prompt = req.body.prompt;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt kosong' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key OpenAI belum diset di Vercel!' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'OpenAI API Error' });
    }

    const replyText = data.choices?.[0]?.message?.content || "Gagal membaca balasan.";
    return res.status(200).json({ reply: replyText });

  } catch (error) {
    // Tangkap error agar tidak bikin server crash total
    return res.status(500).json({ error: error.message || 'Server Internal Error' });
  }
};
