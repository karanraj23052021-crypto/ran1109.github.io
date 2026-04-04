// File: api/gemini.js

export default async function handler(req, res) {
  // 1. Cek Metode Request (Hanya terima POST)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Gunakan POST.' });
  }

  // 2. Ambil prompt dari frontend
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
  }

  // 3. Cek Kunci Rahasia
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY belum diset di Vercel!");
    return res.status(500).json({ error: 'Sistem belum siap. Kunci API Gemini tidak ditemukan.' });
  }

  try {
    // 4. Tembak ke Server Resmi Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // 5. Cek apakah Google menolak request (misal: kuota habis)
    if (!response.ok) {
      console.error("Gemini Error Detail:", data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Gagal mendapat balasan dari server Google.' 
      });
    }

    // 6. Ekstrak jawaban dan kirim ke Frontend
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, Gemini gagal memproses teks tersebut.";
    return res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Server Catch Error:", error);
    return res.status(500).json({ error: 'Terjadi masalah di server internal (Vercel).' });
  }
}
