// File: api/gpt.js

export default async function handler(req, res) {
  // 1. Cek Metode Request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Gunakan POST.' });
  }

  // 2. Ambil prompt dari frontend
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
  }

  // 3. Cek Kunci Rahasia
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY belum diset di Vercel!");
    return res.status(500).json({ error: 'Sistem belum siap. Kunci API OpenAI tidak ditemukan.' });
  }

  try {
    // 4. Tembak ke Server Resmi OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Bisa diganti 'gpt-4o-mini' kalau akunmu support
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    // 5. Cek apakah OpenAI menolak request
    if (!response.ok) {
      console.error("OpenAI Error Detail:", data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Gagal mendapat balasan dari server OpenAI.' 
      });
    }

    // 6. Ekstrak jawaban dan kirim ke Frontend
    const replyText = data.choices?.[0]?.message?.content || "Maaf, ChatGPT gagal memproses teks tersebut.";
    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Server Catch Error:", error);
    return res.status(500).json({ error: 'Terjadi masalah di server internal (Vercel).' });
  }
}
