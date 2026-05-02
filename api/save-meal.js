const { google } = require("googleapis");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const { date, meal, name, quantity, kcal, protein, carb, fat } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:I",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[
          new Date().toLocaleString("vi-VN"),
          date, meal, name, quantity,
          kcal, protein, carb, fat
        ]],
      },
    });

    // Tuỳ chọn: backup lên Vercel Blob Store
    // const { put } = require("@vercel/blob");
    // await put(`meals/${date}-${Date.now()}.json`, JSON.stringify(req.body), { access: "private" });

    return res.status(200).json({ status: "success" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
