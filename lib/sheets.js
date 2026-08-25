import { google } from 'googleapis';

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEET_ID || '18e0DJ5W_ENBt4kQCIyDp0Zzk1hczN8_luM_oAGaI0H4';

const EVENTS_TAB = '이벤트_설정';
const SURVEYS_TAB = '설문_설정';
const APPLY_TAB = 'Sheet1';

let sheetsClient = null;

function getAuth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) {
    throw new Error(
      'GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY 환경변수가 설정되지 않았습니다.'
    );
  }
  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

async function getSheets() {
  if (sheetsClient) return sheetsClient;
  const auth = getAuth();
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

async function getSpreadsheetMeta() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  return res.data;
}

async function findSheetByTitle(title) {
  const meta = await getSpreadsheetMeta();
  return (meta.sheets || []).find((s) => s.properties.title === title);
}

async function createSheet(title, headers, { colWidths } = {}) {
  const sheets = await getSheets();
  const addRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title,
              gridProperties: { frozenRowCount: 1 },
            },
          },
        },
      ],
    },
  });
  const sheetId = addRes.data.replies[0].addSheet.properties.sheetId;

  if (headers && headers.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${title}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });

    const formatRequests = [
      {
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.12, green: 0.51, blue: 0.31 },
              textFormat: {
                bold: true,
                foregroundColor: { red: 1, green: 1, blue: 1 },
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
              wrapStrategy: 'WRAP',
            },
          },
          fields:
            'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,wrapStrategy)',
        },
      },
      {
        updateSheetProperties: {
          properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
          fields: 'gridProperties.frozenRowCount',
        },
      },
    ];

    headers.forEach((_, i) => {
      formatRequests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: (colWidths && colWidths[i]) || 160 },
          fields: 'pixelSize',
        },
      });
    });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests: formatRequests },
    });
  }

  return sheetId;
}

async function ensureSheet(title, headers, opts) {
  const existing = await findSheetByTitle(title);
  if (existing) return existing.properties.sheetId;
  return createSheet(title, headers, opts);
}

async function appendRow(title, rowValues) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${title}'!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [rowValues] },
  });
}

async function readAllValues(title) {
  const sheets = await getSheets();
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${title}'!A1:ZZ10000`,
    });
    return res.data.values || [];
  } catch (e) {
    return [];
  }
}

// ---------- config tabs (events / surveys) store one JSON blob per row ----------

async function ensureConfigTab(tabName) {
  await ensureSheet(tabName, ['id', 'json', 'updatedAt'], { colWidths: [280, 800, 180] });
}

async function listConfig(tabName) {
  await ensureConfigTab(tabName);
  const values = await readAllValues(tabName);
  const rows = values.slice(1);
  return rows
    .filter((r) => r[0])
    .map((r) => {
      try {
        return JSON.parse(r[1]);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

async function getConfigById(tabName, id) {
  const list = await listConfig(tabName);
  return list.find((item) => item.id === id) || null;
}

async function upsertConfig(tabName, item) {
  await ensureConfigTab(tabName);
  const sheets = await getSheets();
  const values = await readAllValues(tabName);
  const rowIndex = values.findIndex((r, i) => i > 0 && r[0] === item.id);
  const json = JSON.stringify(item);
  const now = new Date().toISOString();

  if (rowIndex === -1) {
    await appendRow(tabName, [item.id, json, now]);
  } else {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${tabName}'!A${rowIndex + 1}:C${rowIndex + 1}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[item.id, json, now]] },
    });
  }
  return item;
}

async function deleteConfig(tabName, id) {
  const sheets = await getSheets();
  const meta = await findSheetByTitle(tabName);
  if (!meta) return;
  const sheetId = meta.properties.sheetId;
  const values = await readAllValues(tabName);
  const rowIndex = values.findIndex((r, i) => i > 0 && r[0] === id);
  if (rowIndex === -1) return;
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}

// ---------- application (신청서) responses -> Sheet1, existing column layout ----------

const APPLY_HEADERS = [
  '타임스탬프',
  '신청인 이름',
  '연락처',
  '소속공동체, 단체',
  '교육과정 인지 경로',
  '거주 지역',
  '개인정보 수집·이용 동의',
  '사진·영상 촬영 동의',
  '행사ID',
  '행사명',
];

async function ensureApplyTab() {
  await ensureSheet(APPLY_TAB, APPLY_HEADERS, {
    colWidths: [160, 120, 140, 200, 200, 120, 260, 260, 260, 240],
  });
  await ensureValueHeaders(APPLY_TAB, APPLY_HEADERS);
}

async function ensureValueHeaders(title, headers) {
  const sheets = await getSheets();
  const values = await readAllValues(title);
  const current = values[0] || [];
  const next = [...current];
  headers.forEach((header) => {
    if (!next.includes(header)) next.push(header);
  });
  if (next.length !== current.length) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${title}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [next] },
    });
  }
}

async function appendApplyResponse(row) {
  await ensureApplyTab();
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  await appendRow(APPLY_TAB, [
    timestamp,
    row.name,
    row.phone,
    row.org,
    row.referral,
    row.region,
    row.consentInfo ? '동의합니다' : '',
    row.consentPhoto ? '동의합니다' : '',
    row.eventId,
    row.eventTitle,
  ]);
}

// ---------- survey (설문조사) responses -> one tab per survey ----------

function surveyResponseTabName(survey) {
  const safeTitle = (survey.title || '설문').replace(/[\[\]\*\/\\\?:]/g, '').slice(0, 60);
  return `설문응답_${safeTitle}_${survey.id.slice(0, 6)}`;
}

async function ensureSurveyResponseTab(survey) {
  const tabName = surveyResponseTabName(survey);
  const headers = ['타임스탬프', ...survey.questions.map((q) => q.text)];
  await ensureSheet(tabName, headers, { colWidths: [160, ...survey.questions.map(() => 220)] });
  return tabName;
}

async function appendSurveyResponse(survey, answers) {
  const tabName = await ensureSurveyResponseTab(survey);
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const row = [timestamp, ...survey.questions.map((q) => answers[q.id] ?? '')];
  await appendRow(tabName, row);
}

async function getSurveyResponses(survey) {
  const tabName = surveyResponseTabName(survey);
  const values = await readAllValues(tabName);
  if (!values.length) return { headers: ['타임스탬프', ...survey.questions.map((q) => q.text)], rows: [] };
  return { headers: values[0], rows: values.slice(1) };
}

export {
  EVENTS_TAB,
  SURVEYS_TAB,
  listConfig,
  getConfigById,
  upsertConfig,
  deleteConfig,
  appendApplyResponse,
  appendSurveyResponse,
  getSurveyResponses,
  surveyResponseTabName,
};
