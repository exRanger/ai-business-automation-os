import { google } from 'googleapis';
import { env, hasGoogle } from '@/env';
import type { AutomationRecord } from './types';

function jwt() {
  if (!hasGoogle) return null;
  return new google.auth.JWT({
    email: env.googleClientEmail,
    key: env.googlePrivateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/calendar.events']
  });
}

export async function syncRecordBestEffort(record: AutomationRecord): Promise<void> {
  const auth = jwt();
  if (!auth) return;
  if (env.googleSheetId) {
    const sheets = google.sheets({ version: 'v4', auth });
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.googleSheetId,
      range: 'Automation!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[new Date().toISOString(), record.id, record.module, record.status, record.title, record.score, JSON.stringify(record.payload).slice(0, 1000)]] }
    });
  }
  if (env.googleCalendarId && record.module === 'bookings' && record.nextActionAt) {
    const calendar = google.calendar({ version: 'v3', auth });
    const start = new Date(record.nextActionAt);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    await calendar.events.insert({
      calendarId: env.googleCalendarId,
      requestBody: { summary: record.title, description: JSON.stringify(record.payload).slice(0, 1000), start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() } }
    });
  }
}
