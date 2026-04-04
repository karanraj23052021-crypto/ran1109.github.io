// File: api/ai.js
export default async function handler(req, res) {
  // Hanya izinkan request POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt tidak boleh kosong' });
  }

  try {
    // 1. Panggil API ChatGPT (OpenAI)
    const gptFetch = fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // Kunci rahasia dari Environment Variable
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    // 2. Panggil API Gemini (Google)
    const geminiFetch = fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    // Jalankan kedua request secara bersamaan agar lebih cepat
    const [gptResponse, geminiResponse] = await Promise.all([gptFetch, geminiFetch]);

    const gptData = await gptResponse.json();
    const geminiData = await geminiResponse.json();

    // Ekstrak teks dari respons API
    const chatgptText = gptData.choices?.[0]?.message?.content || "ChatGPT gagal merespons.";
    const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Gemini gagal merespons.";

    // Kirim balasan ke frontend web kamu
    res.status(200).json({
      chatgpt: chatgptText,
      gemini: geminiText
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: 'Terjadi kesalahan saat menghubungi server AI.' });
  }
}
