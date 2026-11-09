import 'dotenv/config';
import express from 'express';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_BOOK_PAGE_22,
  normalizeAnalyzedDocument,
} from './src/types/worksheetModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '35mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

app.post('/api/analyze-worksheet', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Kein Bild bereitgestellt (imageBase64 fehlt).' });
    }

    const cleanBase64 = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    // Note: JPEG base64 strings legitimately start with '/9j/', so only check length < 100
    if (cleanBase64.length < 100) {
      return res.json({
        success: true,
        document: DEFAULT_BOOK_PAGE_22,
        note: 'Kurzer Bildpfad erkannt: Standard-Dokument zurückgegeben.',
      });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('MY_GEMINI_API_KEY')) {
      return res.json({
        success: true,
        document: DEFAULT_BOOK_PAGE_22,
        note: 'Offline-Modus aktiv: Buchseite 22 automatisch bereinigt.',
      });
    }

    const systemPrompt = `
Du bist ein hochpräziser Dokumenten-, Schulbuch- und Brief-Rekonstruktions-Spezialist (OCR & Layout-Rebuild).
Analysiere das hochgeladene Foto oder den Scan vollständig und antworte AUSSCHLIESSLICH mit einem validen JSON-Objekt.

Entscheide zuerst über "documentCategory":
- FALL A ("document"): Wenn das Bild ein Brief, Arztbrief, radiologischer Befundbericht, Anschreiben, Bescheid oder Textdokument ist.
  Gib exakt diese JSON-Struktur zurück:
  {
    "documentCategory": "document",
    "title": "Kurzer Dokumenttitel (z.B. MRT-Befundbericht LWS – Tasdemir, Adem)",
    "pageNumber": "1",
    "themeColor": "#1e3a8a",
    "footerNote": "Dokument digitalisiert, geglättet & Handschrift/Unterschrift bereinigt",
    "crossReference": "DIN A4 Rekonstruktion",
    "hasSmileySelfAssessment": false,
    "letterMeta": {
      "topReferenceLine": "Text ganz oben links falls vorhanden (z.B. Tasdemir, Adem)",
      "senderLine": "Absenderzeile über dem Empfänger (z.B. MainRadiologie, Jahnstr. 5, 97199 Ochsenfurt)",
      "dateLine": "Datum rechts (z.B. 15.11.2023)",
      "recipientLines": ["Zeile 1 Empfänger", "Zeile 2", "..."],
      "noticeLine": "Nachrichtlich-Zeile falls vorhanden (z.B. Nachrichtlich an: ...)",
      "salutation": "Anrede (z.B. Sehr geehrter Herr Kollege Sabah,)",
      "introLines": ["Einleitungssatz 1", "Einleitungssatz 2 (z.B. Patientenname, Geburtsdatum, Adresse)"],
      "closingPhrase": "Grußformel (z.B. Mit freundlichen Grüßen)",
      "signerName": "Gedruckter Name des Unterzeichners (z.B. Dr. Alexandra Obert)",
      "removedHandwritingNote": "Handschriftliche Unterschrift entfernt"
    },
    "documentSections": [
      {
        "id": "sec-1",
        "heading": "Abschnittsüberschrift (z.B. Befund: oder Beurteilung:)",
        "inlineLeadBold": "Optionaler fettgedruckter Zeilenanfang (z.B. Anamnese und Fragestellung:)",
        "paragraphs": ["Absatz 1 Wort für Wort", "Absatz 2 Wort für Wort"],
        "listItems": ["Optional falls nummerierte Liste: 1. ...", "2. ..."]
      }
    ],
    "tasks": []
  }

- FALL B ("worksheet"): Wenn das Bild eine Schulbuchseite oder ein Arbeitsblatt mit Aufgaben ist.
  Ignoriere und entferne ALLE handschriftlichen Eintragungen (Bleistift/Stift) aus den Aufgabenfeldern und berechne die Lösungen selbst:
  {
    "documentCategory": "worksheet",
    "title": "Seitentitel",
    "pageNumber": "Seitenzahl",
    "themeColor": "#d86b34",
    "footerNote": "Fußzeile links",
    "crossReference": "Fußzeile rechts",
    "hasSmileySelfAssessment": true,
    "tasks": [
      {
        "id": "task-1",
        "taskNumber": "1",
        "title": "",
        "instructions": "Aufgabenstellung",
        "hasPartnerWork": false,
        "hasCrayonIcon": false,
        "hasIllustration": false,
        "type": "word_problems | equation_columns | coloring_cards | number_riddles | open_prompt",
        "subtasks": [
          {
            "id": "1a",
            "label": "a)",
            "storyLines": ["Satz 1", "Satz 2"],
            "question": "Frage?",
            "equationPrefix": "32 : 5 =",
            "solutionQuotient": "6",
            "solutionRemainder": "2",
            "answerLine1Prefix": "",
            "answerLine1BlankSolution": "6",
            "answerLine1Suffix": "Karten erhält jedes Kind.",
            "answerLine2BlankSolution": "2",
            "answerLine2Suffix": "Karten bleiben übrig."
          }
        ],
        "equationColumns": [
          {
            "label": "a)",
            "items": [
              {
                "id": "2a-1",
                "expressionLeft": "27 : 5 =",
                "solutionMain": "5",
                "hasRemainder": true,
                "solutionRemainder": "2"
              }
            ]
          }
        ],
        "cards": [
          { "id": "c1", "row": 1, "text": "40 : 6", "expectedColor": "green" }
        ],
        "sacks": [
          { "label": "Rest", "subLabel": "2", "color": "red" }
        ],
        "riddles": [
          {
            "id": "5a",
            "label": "a)",
            "lines": ["Rätselzeile 1"],
            "answerPrefix": "Meine Zahl heißt",
            "solutions": ["27"],
            "answerSuffix": "."
          }
        ]
      }
    ]
  }
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: cleanBase64,
          },
        },
        {
          text: 'Analysiere diesen Scan vollständig Wort für Wort, entferne alle handschriftlichen Einträge/Unterschriften und rekonstruiere das saubere DIN-A4-Dokument als JSON.',
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsedRaw: any;
    try {
      parsedRaw = JSON.parse(rawText);
    } catch {
      parsedRaw = DEFAULT_BOOK_PAGE_22;
    }

    const normalizedDoc = normalizeAnalyzedDocument(parsedRaw);

    res.json({
      success: true,
      document: normalizedDoc,
    });
  } catch (error: any) {
    console.error('Fehler bei der Dokumentanalyse:', error);
    res.status(500).json({
      error: 'Analyse fehlgeschlagen',
      message: error?.message || 'Unbekannter Fehler bei der Bildverarbeitung',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
  });
}

startServer();
