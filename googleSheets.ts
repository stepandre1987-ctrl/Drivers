import { google, sheets_v4 } from "googleapis";
import { prisma } from "@/lib/prisma";

function getAuth() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (!b64) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
  const json = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
  const scopes = ["https://www.googleapis.com/auth/spreadsheets"];
  const auth = new google.auth.JWT(json.client_email, undefined, json.private_key, scopes);
  return auth;
}

export async function appendShiftToSheet(shiftId: string) {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: { user: true }
  });
  if (!shift || !shift.endedAt) return;

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  const driverName = shift.user.name ?? shift.user.email ?? "Unknown";
  const tabTitle = driverName;

  await ensureDriverTab(sheets, spreadsheetId, tabTitle);

  const date = new Date(shift.startedAt);
  const fmtDate = date.toLocaleDateString("cs-CZ", { timeZone: "Europe/Prague" });
  const fmtStart = new Date(shift.startedAt).toLocaleTimeString("cs-CZ", { timeZone: "Europe/Prague", hour: "2-digit", minute: "2-digit" });
  const fmtEnd = new Date(shift.endedAt).toLocaleTimeString("cs-CZ", { timeZone: "Europe/Prague", hour: "2-digit", minute: "2-digit" });

  const kms = typeof shift.kms === "number" ? shift.kms :
    (shift.odoStart != null && shift.odoEnd != null ? Math.max(0, shift.odoEnd - shift.odoStart) : null);

  const values = [[fmtDate, fmtStart, fmtEnd, shift.odoStart ?? "", shift.odoEnd ?? "", kms ?? "", shift.note ?? ""]];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tabTitle}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values }
  });
}

async function ensureDriverTab(sheets: sheets_v4.Sheets, spreadsheetId: string, tabTitle: string) {
  try {
    await sheets.spreadsheets.values.get({ spreadsheetId, range: `${tabTitle}!A1:A1` });
    return;
  } catch {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: tabTitle, gridProperties: { rowCount: 2000, columnCount: 12 } } } },
        ]
      }
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabTitle}!A1:G1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["Datum","Začátek","Konec","Odo start","Odo konec","KM","Poznámka"]] }
    });
  }
}
