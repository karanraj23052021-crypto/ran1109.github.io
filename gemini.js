// File: api/gemini.js
export default async function handler(req, res) {
  // Pastikan hanya menerima request tipe POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Harap gunakan POST.' });
  }

  // Ambil pertanyaan (prompt) yang dikirim dari web
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
  }

  try {
    // Ambil kunci rahasia dari Environment Variable Vercel
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("API Key Gemini belum disetting di Vercel!");
      return res.status(500).json({ error: 'Sistem belum siap. Kunci API tidak ditemukan.' });
    }

    // Endpoint resmi Google Gemini 1.5 Flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Kirim request ke server Google
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

    // Cek jika Google menolak request-nya
    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Gagal mendapatkan balasan dari server Gemini.' 
      });
    }

    // Ekstrak teks balasan dari struktur JSON Google yang berlapis
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, aku bingung mau jawab apa.";

    // Kirim balasan kembali ke web (frontend) kamu
    res.status(200).json({ reply: replyText });

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: 'Waduh, terjadi masalah di server internal Vercel.' });
  }
}
