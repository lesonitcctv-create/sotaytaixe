import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Route: Sync to Google Sheets
  app.post('/api/sync-sheets', async (req, res) => {
    try {
      const { sessions, trips } = req.body;
      
      const credentialsStr = process.env.GOOGLE_SHEETS_CREDENTIALS;
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;

      if (!credentialsStr || !spreadsheetId) {
        return res.status(400).json({ 
          error: 'Chưa cấu hình Google Sheets. Vui lòng thêm GOOGLE_SHEETS_CREDENTIALS và GOOGLE_SHEET_ID vào biến môi trường.' 
        });
      }

      let credentials;
      try {
        credentials = JSON.parse(credentialsStr);
      } catch (e) {
        return res.status(400).json({ error: 'GOOGLE_SHEETS_CREDENTIALS không phải là chuỗi JSON hợp lệ.' });
      }
      
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // 1. Sync Sessions
      if (sessions && sessions.length > 0) {
        const sessionValues = sessions.map((s: any) => [
          s.id, s.startTime, s.endTime, s.startBattery, s.endBattery, s.energyAdded, s.cost, s.location
        ]);
        sessionValues.unshift(['ID', 'Start Time', 'End Time', 'Start Battery %', 'End Battery %', 'Energy (kWh)', 'Cost', 'Location']);
        
        try {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Sessions!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: sessionValues },
          });
        } catch (e: any) {
          console.error('Lỗi khi ghi sheet Sessions:', e.message);
          // Nếu lỗi do sheet không tồn tại, có thể bỏ qua hoặc báo lỗi
        }
      }

      // 2. Sync Trips
      if (trips && trips.length > 0) {
        const tripValues = trips.map((t: any) => [
          t.id, t.date, t.revenue, t.distance, t.tolls, t.platformFee, t.netIncome, t.notes
        ]);
        tripValues.unshift(['ID', 'Date', 'Revenue', 'Distance (km)', 'Tolls', 'Platform Fee', 'Net Income', 'Notes']);
        
        try {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Trips!A1',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: tripValues },
          });
        } catch (e: any) {
          console.error('Lỗi khi ghi sheet Trips:', e.message);
        }
      }

      res.json({ success: true, message: 'Đồng bộ dữ liệu lên Google Sheets thành công!' });
    } catch (error: any) {
      console.error('Lỗi sync sheets:', error);
      res.status(500).json({ error: error.message || 'Lỗi máy chủ khi đồng bộ.' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
