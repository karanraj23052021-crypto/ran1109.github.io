module.exports = async function(req, res) {
  // Hanya izinkan POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const prompt = req.body.prompt;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt kosong' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key Gemini belum diset di Vercel!' });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Google API Error' });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Gagal membaca balasan.";
    return res.status(200).json({ reply: replyText });

  } catch (error) {
    // Tangkap error agar tidak bikin server crash total
    return res.status(500).json({ error: error.message || 'Server Internal Error' });
  }
};
