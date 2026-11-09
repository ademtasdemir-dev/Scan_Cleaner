export type RemainderBagColor = 'red' | 'blue' | 'green' | null;

export interface IllustrationBoundingBox {
  ymin: number; // 0..1000
  xmin: number; // 0..1000
  ymax: number; // 0..1000
  xmax: number; // 0..1000
  description?: string;
}

export interface UniversalSubtask {
  id: string;
  label: string; // e.g. "a)", "b)", "c)"
  storyLines: string[];
  question?: string; // e.g. "F: Wie viele Karten erhält jedes Kind?"
  equationPrefix?: string; // e.g. "L: 32 : 5 ="
  solutionQuotient?: string;
  solutionRemainder?: string;
  answerLine1Prefix?: string; // e.g. "A:"
  answerLine1BlankSolution?: string; // e.g. "6"
  answerLine1Suffix?: string; // e.g. "Karten erhält jedes Kind."
  answerLine2BlankSolution?: string; // e.g. "2"
  answerLine2Suffix?: string; // e.g. "Karten bleiben übrig."
}

export interface UniversalEquationItem {
  id: string;
  expressionLeft: string; // e.g. "27 : 5 =" or "45 + 18 ="
  solutionMain: string; // e.g. "5" or "63"
  hasRemainder?: boolean;
  solutionRemainder?: string; // e.g. "2"
}

export interface UniversalEquationColumn {
  label: string; // e.g. "a)", "b)", "c)"
  items: UniversalEquationItem[];
}

export interface UniversalCardItem {
  id: string;
  row?: 1 | 2;
  text: string; // e.g. "40 : 6"
  expectedColor: 'red' | 'blue' | 'green';
  tiltDeg?: number;
}

export interface UniversalSackItem {
  label: string; // e.g. "Rest"
  subLabel: string; // e.g. "2"
  color: 'red' | 'blue' | 'green';
}

export interface UniversalRiddleItem {
  id: string;
  label: string; // e.g. "a)", "b)"
  lines: string[];
  answerPrefix: string; // e.g. "Meine Zahl heißt"
  solutions: string[]; // e.g. ["27"] or ["12", "36", "60"]
  answerSuffix?: string; // e.g. "."
}

export interface UniversalTaskItem {
  id: string;
  taskNumber: string;
  badgeVariant?: 'light' | 'dark';
  title: string;
  instructions?: string;
  hasPartnerWork?: boolean;
  hasCrayonIcon?: boolean;
  hasIllustration?: boolean;
  type: 'word-problem' | 'equation-grid' | 'cards' | 'riddle' | 'free-text';
  subtasks?: UniversalSubtask[];
  equationColumns?: UniversalEquationColumn[];
  cards?: UniversalCardItem[];
  sacks?: UniversalSackItem[];
  riddles?: UniversalRiddleItem[];
}

/**
 * Structured block for general A4 documents, letters, medical reports (Befundberichte),
 * forms, or official correspondence where handwriting/signatures and paper creases are removed.
 */
export interface UniversalDocumentSection {
  id: string;
  heading?: string;
  inlineLeadBold?: string;
  paragraphs: string[];
  listItems?: string[];
}

export interface UniversalLetterMetadata {
  topReferenceLine?: string; // e.g. "Tasdemir, Adem"
  senderLine?: string; // e.g. "MainRadiologie, Jahnstr. 5, 97199 Ochsenfurt"
  dateLine?: string; // e.g. "15.11.2023"
  recipientLines?: string[]; // e.g. ["Praxis", "Dr. med. Aqeel Sabah", ...]
  noticeLine?: string; // e.g. "Nachrichtlich an: Frau Dr. med. Petra Schlegel, Zellingen"
  salutation?: string; // e.g. "Sehr geehrter Herr Kollege Sabah,"
  introLines?: string[];
  closingPhrase?: string; // e.g. "Mit freundlichen Grüßen"
  signerName?: string; // e.g. "Dr. Alexandra Obert"
  removedHandwritingNote?: string; // e.g. "Handschriftliche Unterschrift entfernt"
}

export interface UniversalWorksheetDocument {
  documentCategory?: 'worksheet' | 'document';
  title: string;
  pageNumber: string;
  themeColor: string;
  footerNote: string;
  crossReference: string;
  hasSmileySelfAssessment: boolean;
  illustrationBox?: IllustrationBoundingBox | null;
  tasks: UniversalTaskItem[];
  // General document / letter fields (used when documentCategory === 'document')
  letterMeta?: UniversalLetterMetadata;
  documentSections?: UniversalDocumentSection[];
}

export interface UniversalStudentState {
  fields: Record<string, string>;
  cardColors: Record<string, RemainderBagColor>;
  freeText: Record<string, string>;
  selectedSmiley: number | null;
}

export const BEFUND_SABAH_MRT_2023_DOC: UniversalWorksheetDocument = {
  documentCategory: 'document',
  title: 'Radiologischer Befundbericht – MRT LWS nativ (Tasdemir, Adem)',
  pageNumber: '1',
  themeColor: '#1E3A8A',
  footerNote: 'MainRadiologie · Jahnstr. 5 · 97199 Ochsenfurt',
  crossReference: 'Datum: 15.11.2023',
  hasSmileySelfAssessment: false,
  illustrationBox: null,
  tasks: [],
  letterMeta: {
    topReferenceLine: 'Tasdemir, Adem',
    senderLine: 'MainRadiologie, Jahnstr. 5, 97199 Ochsenfurt',
    dateLine: '15.11.2023',
    recipientLines: [
      'Praxis',
      'Dr. med. Aqeel Sabah',
      'Facharzt für Orthopädie/Unfallchirurgie',
      'Gemündener Str. 15-17',
      '97753 Karlstadt',
    ],
    noticeLine: 'Nachrichtlich an: Frau Dr. med. Petra Schlegel, Zellingen',
    salutation: 'Sehr geehrter Herr Kollege Sabah,',
    introLines: [
      'besten Dank für die freundliche Überweisung Ihres Patienten:',
      'Herr Adem Tasdemir, geb. am 12.05.1989, wohnhaft Brückenstr. 37, 97225 Zellingen',
    ],
    closingPhrase: 'Mit freundlichen Grüßen',
    signerName: 'Dr. Alexandra Obert',
    removedHandwritingNote: 'Handschriftliche Unterschrift über „Dr. Alexandra Obert“ entfernt',
  },
  documentSections: [
    {
      id: 'sec-anamnese',
      inlineLeadBold: 'Anamnese und Fragestellung:',
      paragraphs: [
        'Lumboischialgie rechts. Lasegue links bei 60° positiv. Z.A. NPP bzw. SKS. Seit ca. 1 Jahr Rückenschmerzen mittlerweile mit Taubheit im re. Bein. Kein Trauma. Keine OP.',
      ],
    },
    {
      id: 'sec-mrt-technik',
      inlineLeadBold: 'MRT LWS nativ vom 14.11.2023',
      paragraphs: ['T2w FS cor, T2w sag, T1w sag, T2w tra'],
    },
    {
      id: 'sec-befund',
      heading: 'Befund:',
      paragraphs: [
        'Vorsicht Zählweise bei Lumbalisation von SWK 1 sechsgliedrige LWS!',
        'Flache, großbogig linkskonvexe Skoliose und Hyperlordose der LWS. Regelrechter Stand des Conus medullaris auf Höhe LWK 2. Regelhaftes Alignement der Wirbelkörperhinterkanten.',
        'In TH12/L1 Osteochondrose und flacher, subligamentärer, medianer BSV ohne Bedrängung nervaler Strukturen.',
        'In L2/3 flache Protrusion ohne Bedrängung nervaler Strukturen.',
        'In L5/6 links lateral gering aktivierte Osteochondrose und median betonte Protrusion ohne Bedrängung nervaler Strukturen.',
        'Die restlichen Bandscheibensegmente stellen sich unauffällig dar.',
        'Unauffällige paravertebrale Weichteile.',
        'Groborientierend kein Anhalt für entzündliche Veränderungen der ISG-Fugen.',
      ],
    },
    {
      id: 'sec-beurteilung',
      heading: 'Beurteilung:',
      paragraphs: ['Vorsicht Zählweise bei sechsgliedriger LWS!'],
      listItems: [
        '1. Flache, großbogig linkskonvexe Skoliose und Hyperlordose der LWS. Keine Listhese.',
        '2. In L5/6 links lateral gering aktivierte Osteochondrose.',
        '3. Kein raumfordernder BSV. Keine relevante foraminale oder spinale Enge. Keine Neurokompression.',
      ],
    },
  ],
};

export const DEFAULT_BOOK_PAGE_22: UniversalWorksheetDocument = {
  documentCategory: 'worksheet',
  title: 'Dividieren mit Rest',
  pageNumber: '22',
  themeColor: '#D66840',
  footerNote: '› 6 Zahlenrätsel in der Klasse sammeln und vergleichen.',
  crossReference: '› zu Schulbuch-Seite 30',
  hasSmileySelfAssessment: true,
  illustrationBox: {
    ymin: 82,
    xmin: 211,
    ymax: 210,
    xmax: 549,
    description: 'Fünf Kinder sitzen an einem runden Tisch und spielen Karten',
  },
  tasks: [
    {
      id: 'task-1',
      taskNumber: '1',
      badgeVariant: 'light',
      title: '',
      hasIllustration: true,
      type: 'word-problem',
      subtasks: [
        {
          id: '1a',
          label: 'a)',
          storyLines: ['32 Karten sollen gerecht', 'an fünf Kinder verteilt werden.'],
          question: 'F: Wie viele Karten erhält jedes Kind?',
          equationPrefix: 'L: 32 : 5 =',
          solutionQuotient: '6',
          solutionRemainder: '2',
          answerLine1Prefix: 'A:',
          answerLine1BlankSolution: '6',
          answerLine1Suffix: 'Karten erhält jedes Kind.',
          answerLine2BlankSolution: '2',
          answerLine2Suffix: 'Karten bleiben übrig.',
        },
        {
          id: '1b',
          label: 'b)',
          storyLines: ['32 Karten sollen gerecht', 'an sechs Kinder verteilt werden.'],
          question: 'F: Wie viele Karten erhält jedes Kind?',
          equationPrefix: 'L: 32 : 6 =',
          solutionQuotient: '5',
          solutionRemainder: '2',
          answerLine1Prefix: 'A:',
          answerLine1BlankSolution: '5',
          answerLine1Suffix: 'Karten erhält jedes Kind.',
          answerLine2BlankSolution: '2',
          answerLine2Suffix: 'Karten bleiben übrig.',
        },
        {
          id: '1c',
          label: 'c)',
          storyLines: ['32 Karten sollen gerecht', 'an sieben Kinder verteilt werden.'],
          question: 'F: Wie viele Karten erhält jedes Kind?',
          equationPrefix: 'L: 32 : 7 =',
          solutionQuotient: '4',
          solutionRemainder: '4',
          answerLine1Prefix: 'A:',
          answerLine1BlankSolution: '4',
          answerLine1Suffix: 'Karten erhält jedes Kind.',
          answerLine2BlankSolution: '4',
          answerLine2Suffix: 'Karten bleiben übrig.',
        },
      ],
    },
    {
      id: 'task-2',
      taskNumber: '2',
      badgeVariant: 'light',
      title: 'Rechnet. Seht euch jedes Päckchen genau an. Was stellt ihr fest?',
      hasPartnerWork: true,
      type: 'equation-grid',
      equationColumns: [
        {
          label: 'a)',
          items: [
            { id: '2a-1', expressionLeft: '27 : 5 =', solutionMain: '5', hasRemainder: true, solutionRemainder: '2' },
            { id: '2a-2', expressionLeft: '28 : 5 =', solutionMain: '5', hasRemainder: true, solutionRemainder: '3' },
            { id: '2a-3', expressionLeft: '29 : 5 =', solutionMain: '5', hasRemainder: true, solutionRemainder: '4' },
          ],
        },
        {
          label: 'b)',
          items: [
            { id: '2b-1', expressionLeft: '9 : 3 =', solutionMain: '3', hasRemainder: true, solutionRemainder: '0' },
            { id: '2b-2', expressionLeft: '10 : 3 =', solutionMain: '3', hasRemainder: true, solutionRemainder: '1' },
            { id: '2b-3', expressionLeft: '11 : 3 =', solutionMain: '3', hasRemainder: true, solutionRemainder: '2' },
          ],
        },
        {
          label: 'c)',
          items: [
            { id: '2c-1', expressionLeft: '14 : 6 =', solutionMain: '2', hasRemainder: true, solutionRemainder: '2' },
            { id: '2c-2', expressionLeft: '15 : 6 =', solutionMain: '2', hasRemainder: true, solutionRemainder: '3' },
            { id: '2c-3', expressionLeft: '16 : 6 =', solutionMain: '2', hasRemainder: true, solutionRemainder: '4' },
          ],
        },
      ],
    },
    {
      id: 'task-3',
      taskNumber: '3',
      badgeVariant: 'dark',
      title: '',
      type: 'equation-grid',
      equationColumns: [
        {
          label: 'a)',
          items: [
            { id: '3a-1', expressionLeft: '9 : 2 =', solutionMain: '4', hasRemainder: true, solutionRemainder: '1' },
            { id: '3a-2', expressionLeft: '15 : 2 =', solutionMain: '7', hasRemainder: true, solutionRemainder: '1' },
            { id: '3a-3', expressionLeft: '21 : 2 =', solutionMain: '10', hasRemainder: true, solutionRemainder: '1' },
          ],
        },
        {
          label: 'b)',
          items: [
            { id: '3b-1', expressionLeft: '18 : 4 =', solutionMain: '4', hasRemainder: true, solutionRemainder: '2' },
            { id: '3b-2', expressionLeft: '21 : 4 =', solutionMain: '5', hasRemainder: true, solutionRemainder: '1' },
            { id: '3b-3', expressionLeft: '39 : 4 =', solutionMain: '9', hasRemainder: true, solutionRemainder: '3' },
          ],
        },
        {
          label: 'c)',
          items: [
            { id: '3c-1', expressionLeft: '17 : 8 =', solutionMain: '2', hasRemainder: true, solutionRemainder: '1' },
            { id: '3c-2', expressionLeft: '59 : 8 =', solutionMain: '7', hasRemainder: true, solutionRemainder: '3' },
            { id: '3c-3', expressionLeft: '51 : 8 =', solutionMain: '6', hasRemainder: true, solutionRemainder: '3' },
          ],
        },
      ],
    },
    {
      id: 'task-4',
      taskNumber: '4',
      badgeVariant: 'dark',
      title: 'Bei welchen Aufgaben bleibt der Rest 2, 3 oder 4?',
      instructions: 'Male die Aufgabenkärtchen in der richtigen Farbe an.',
      hasCrayonIcon: true,
      type: 'cards',
      sacks: [
        { label: 'Rest', subLabel: '2', color: 'red' },
        { label: 'Rest', subLabel: '3', color: 'blue' },
        { label: 'Rest', subLabel: '4', color: 'green' },
      ],
      cards: [
        { id: '4-1', row: 1, text: '40 : 6', expectedColor: 'green', tiltDeg: -1.2 },
        { id: '4-2', row: 1, text: '51 : 7', expectedColor: 'red', tiltDeg: 0.8 },
        { id: '4-3', row: 1, text: '75 : 9', expectedColor: 'blue', tiltDeg: -0.7 },
        { id: '4-4', row: 1, text: '19 : 4', expectedColor: 'blue', tiltDeg: 1.1 },
        { id: '4-5', row: 2, text: '23 : 3', expectedColor: 'red', tiltDeg: -1.5 },
        { id: '4-6', row: 2, text: '54 : 10', expectedColor: 'green', tiltDeg: 1.3 },
        { id: '4-7', row: 2, text: '45 : 6', expectedColor: 'blue', tiltDeg: -0.9 },
        { id: '4-8', row: 2, text: '58 : 7', expectedColor: 'red', tiltDeg: 1.2 },
        { id: '4-9', row: 2, text: '50 : 8', expectedColor: 'red', tiltDeg: -0.8 },
        { id: '4-10', row: 2, text: '31 : 9', expectedColor: 'green', tiltDeg: -1.3 },
      ],
    },
    {
      id: 'task-5',
      taskNumber: '5',
      badgeVariant: 'dark',
      title: 'Zahlenrätsel. Wie heißen die Zahlen?',
      type: 'riddle',
      riddles: [
        {
          id: '5a',
          label: 'a)',
          lines: [
            'Meine Zahl gehört zur Neuner-Reihe. Wenn du sie durch 8 dividierst,',
            'bleibt als Rest 3.',
          ],
          answerPrefix: 'Meine Zahl heißt',
          solutions: ['27'],
          answerSuffix: '.',
        },
        {
          id: '5b',
          label: 'b)',
          lines: [
            'Meine Zahlen gehören zur Sechser-Reihe. Wenn du sie durch 8 dividierst,',
            'bleibt als Rest 4.',
          ],
          answerPrefix: 'Meine Zahlen heißen',
          solutions: ['12', '36', '60'],
          answerSuffix: '.',
        },
      ],
    },
    {
      id: 'task-6',
      taskNumber: '6',
      badgeVariant: 'dark',
      title: 'Schreibe ein eigenes Zahlenrätsel auf ein Blatt. Ein anderes Kind löst es.',
      instructions: 'Vergleicht.',
      hasPartnerWork: true,
      type: 'free-text',
    },
  ],
};

export function createEmptyUniversalState(doc: UniversalWorksheetDocument): UniversalStudentState {
  const fields: Record<string, string> = {};
  const cardColors: Record<string, RemainderBagColor> = {};
  const freeText: Record<string, string> = {};

  if (doc.documentCategory === 'document' && doc.documentSections) {
    doc.documentSections.forEach((sec) => {
      freeText[sec.id] = [
        ...(sec.paragraphs || []),
        ...(sec.listItems || []),
      ].join('\n');
    });
    return {
      fields,
      cardColors,
      freeText,
      selectedSmiley: null,
    };
  }

  for (const task of doc.tasks) {
    if (task.subtasks) {
      for (const sub of task.subtasks) {
        if (sub.solutionQuotient !== undefined) fields[`${sub.id}-q`] = '';
        if (sub.solutionRemainder !== undefined) fields[`${sub.id}-r`] = '';
        if (sub.answerLine1BlankSolution !== undefined) fields[`${sub.id}-a1`] = '';
        if (sub.answerLine2BlankSolution !== undefined) fields[`${sub.id}-a2`] = '';
      }
    }
    if (task.equationColumns) {
      for (const col of task.equationColumns) {
        for (const item of col.items) {
          fields[`${item.id}-main`] = '';
          if (item.hasRemainder) {
            fields[`${item.id}-rem`] = '';
          }
        }
      }
    }
    if (task.cards) {
      for (const card of task.cards) {
        cardColors[card.id] = null;
      }
    }
    if (task.riddles) {
      for (const riddle of task.riddles) {
        riddle.solutions.forEach((_, idx) => {
          fields[`${riddle.id}-${idx}`] = '';
        });
      }
    }
    if (task.type === 'free-text') {
      freeText[task.id] = '';
    }
  }

  return {
    fields,
    cardColors,
    freeText,
    selectedSmiley: null,
  };
}

export function evaluateUniversalWorksheet(
  doc: UniversalWorksheetDocument,
  state: UniversalStudentState
): {
  totalFields: number;
  filledFields: number;
  correctFields: number;
} {
  if (doc.documentCategory === 'document' && doc.documentSections) {
    const count = doc.documentSections.length;
    return {
      totalFields: count,
      filledFields: count,
      correctFields: count,
    };
  }

  let totalFields = 0;
  let filledFields = 0;
  let correctFields = 0;

  const checkField = (key: string, expected?: string) => {
    if (expected === undefined || expected === '') return;
    totalFields++;
    const actual = (state.fields[key] ?? '').trim();
    if (actual !== '') {
      filledFields++;
      if (actual.toLowerCase() === expected.trim().toLowerCase()) {
        correctFields++;
      }
    }
  };

  for (const task of doc.tasks) {
    if (task.subtasks) {
      for (const sub of task.subtasks) {
        checkField(`${sub.id}-q`, sub.solutionQuotient);
        checkField(`${sub.id}-r`, sub.solutionRemainder);
        checkField(`${sub.id}-a1`, sub.answerLine1BlankSolution);
        checkField(`${sub.id}-a2`, sub.answerLine2BlankSolution);
      }
    }
    if (task.equationColumns) {
      for (const col of task.equationColumns) {
        for (const item of col.items) {
          checkField(`${item.id}-main`, item.solutionMain);
          if (item.hasRemainder) {
            checkField(`${item.id}-rem`, item.solutionRemainder);
          }
        }
      }
    }
    if (task.cards) {
      for (const card of task.cards) {
        totalFields++;
        const chosen = state.cardColors[card.id];
        if (chosen) {
          filledFields++;
          if (chosen === card.expectedColor) {
            correctFields++;
          }
        }
      }
    }
    if (task.riddles) {
      for (const riddle of task.riddles) {
        riddle.solutions.forEach((sol, idx) => {
          checkField(`${riddle.id}-${idx}`, sol);
        });
      }
    }
  }

  return { totalFields, filledFields, correctFields };
}

export function normalizeAnalyzedDocument(raw: any): UniversalWorksheetDocument {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_BOOK_PAGE_22;
  }

  // Check if this is a general document / letter / medical report (Befundbericht, Arztbrief, etc.)
  const isGeneralDoc =
    raw.documentCategory === 'document' ||
    (Array.isArray(raw.documentSections) && raw.documentSections.length > 0) ||
    (raw.letterMeta && typeof raw.letterMeta === 'object' && (!Array.isArray(raw.tasks) || raw.tasks.length === 0));

  if (isGeneralDoc) {
    const sections: UniversalDocumentSection[] = Array.isArray(raw.documentSections)
      ? raw.documentSections.map((s: any, idx: number) => ({
          id: String(s.id || `sec-${idx + 1}`),
          heading: s.heading ? String(s.heading) : undefined,
          inlineLeadBold: s.inlineLeadBold ? String(s.inlineLeadBold) : undefined,
          paragraphs: Array.isArray(s.paragraphs) ? s.paragraphs.map(String) : [],
          listItems: Array.isArray(s.listItems) ? s.listItems.map(String) : undefined,
        }))
      : [];

    const lm = raw.letterMeta || {};
    return {
      documentCategory: 'document',
      title: String(raw.title || lm.senderLine || 'Dokument-Rekonstruktion'),
      pageNumber: String(raw.pageNumber || '1'),
      themeColor: String(raw.themeColor || '#1E3A8A'),
      footerNote: String(raw.footerNote || lm.senderLine || ''),
      crossReference: String(raw.crossReference || (lm.dateLine ? `Datum: ${lm.dateLine}` : '')),
      hasSmileySelfAssessment: false,
      illustrationBox: null,
      tasks: [],
      letterMeta: {
        topReferenceLine: lm.topReferenceLine ? String(lm.topReferenceLine) : undefined,
        senderLine: lm.senderLine ? String(lm.senderLine) : undefined,
        dateLine: lm.dateLine ? String(lm.dateLine) : undefined,
        recipientLines: Array.isArray(lm.recipientLines) ? lm.recipientLines.map(String) : [],
        noticeLine: lm.noticeLine ? String(lm.noticeLine) : undefined,
        salutation: lm.salutation ? String(lm.salutation) : undefined,
        introLines: Array.isArray(lm.introLines) ? lm.introLines.map(String) : [],
        closingPhrase: lm.closingPhrase ? String(lm.closingPhrase) : undefined,
        signerName: lm.signerName ? String(lm.signerName) : undefined,
        removedHandwritingNote: lm.removedHandwritingNote
          ? String(lm.removedHandwritingNote)
          : 'Handschriftliche Unterschrift / Notizen entfernt',
      },
      documentSections: sections,
    };
  }

  if (!Array.isArray(raw.tasks) || raw.tasks.length === 0) {
    return DEFAULT_BOOK_PAGE_22;
  }

  const tasks: UniversalTaskItem[] = raw.tasks.map((t: any, tIdx: number) => {
    const taskId = String(t.id || `task-${tIdx + 1}`);
    const taskNumber = String(t.taskNumber || tIdx + 1);
    const type: UniversalTaskItem['type'] =
      t.type === 'word-problem' ||
      t.type === 'equation-grid' ||
      t.type === 'cards' ||
      t.type === 'riddle' ||
      t.type === 'free-text'
        ? t.type
        : Array.isArray(t.equationColumns) && t.equationColumns.length > 0
        ? 'equation-grid'
        : Array.isArray(t.subtasks) && t.subtasks.length > 0
        ? 'word-problem'
        : Array.isArray(t.cards) && t.cards.length > 0
        ? 'cards'
        : Array.isArray(t.riddles) && t.riddles.length > 0
        ? 'riddle'
        : 'free-text';

    const subtasks: UniversalSubtask[] | undefined = Array.isArray(t.subtasks)
      ? t.subtasks.map((s: any, sIdx: number) => ({
          id: String(s.id || `${taskId}-sub-${sIdx + 1}`),
          label: String(s.label || `${String.fromCharCode(97 + sIdx)})`),
          storyLines: Array.isArray(s.storyLines) ? s.storyLines.map(String) : [],
          question: s.question ? String(s.question) : undefined,
          equationPrefix: s.equationPrefix ? String(s.equationPrefix) : undefined,
          solutionQuotient: s.solutionQuotient !== undefined ? String(s.solutionQuotient) : undefined,
          solutionRemainder: s.solutionRemainder !== undefined ? String(s.solutionRemainder) : undefined,
          answerLine1Prefix: s.answerLine1Prefix ? String(s.answerLine1Prefix) : 'A:',
          answerLine1BlankSolution:
            s.answerLine1BlankSolution !== undefined ? String(s.answerLine1BlankSolution) : undefined,
          answerLine1Suffix: s.answerLine1Suffix ? String(s.answerLine1Suffix) : undefined,
          answerLine2BlankSolution:
            s.answerLine2BlankSolution !== undefined ? String(s.answerLine2BlankSolution) : undefined,
          answerLine2Suffix: s.answerLine2Suffix ? String(s.answerLine2Suffix) : undefined,
        }))
      : undefined;

    const equationColumns: UniversalEquationColumn[] | undefined = Array.isArray(t.equationColumns)
      ? t.equationColumns.map((col: any, cIdx: number) => ({
          label: String(col.label || `${String.fromCharCode(97 + cIdx)})`),
          items: Array.isArray(col.items)
            ? col.items.map((it: any, iIdx: number) => ({
                id: String(it.id || `${taskId}-c${cIdx}-i${iIdx}`),
                expressionLeft: String(it.expressionLeft || '').trim(),
                solutionMain: String(it.solutionMain ?? ''),
                hasRemainder: Boolean(it.hasRemainder),
                solutionRemainder:
                  it.solutionRemainder !== undefined && it.solutionRemainder !== null
                    ? String(it.solutionRemainder)
                    : undefined,
              }))
            : [],
        }))
      : undefined;

    const cards: UniversalCardItem[] | undefined = Array.isArray(t.cards)
      ? t.cards.map((c: any, cIdx: number) => ({
          id: String(c.id || `${taskId}-card-${cIdx + 1}`),
          row: c.row === 2 || cIdx >= 4 ? 2 : 1,
          text: String(c.text || ''),
          expectedColor:
            c.expectedColor === 'blue' || c.expectedColor === 'green' ? c.expectedColor : 'red',
          tiltDeg: typeof c.tiltDeg === 'number' ? c.tiltDeg : cIdx % 2 === 0 ? -1.1 : 0.9,
        }))
      : undefined;

    const sacks: UniversalSackItem[] | undefined = Array.isArray(t.sacks)
      ? t.sacks.map((s: any, sIdx: number) => ({
          label: String(s.label || 'Rest'),
          subLabel: String(s.subLabel || sIdx + 2),
          color: s.color === 'blue' || s.color === 'green' ? s.color : 'red',
        }))
      : undefined;

    const riddles: UniversalRiddleItem[] | undefined = Array.isArray(t.riddles)
      ? t.riddles.map((r: any, rIdx: number) => ({
          id: String(r.id || `${taskId}-riddle-${rIdx + 1}`),
          label: String(r.label || `${String.fromCharCode(97 + rIdx)})`),
          lines: Array.isArray(r.lines) ? r.lines.map(String) : [String(r.text || '')],
          answerPrefix: String(r.answerPrefix || 'Antwort:'),
          solutions:
            Array.isArray(r.solutions) && r.solutions.length > 0 ? r.solutions.map(String) : [''],
          answerSuffix: r.answerSuffix !== undefined ? String(r.answerSuffix) : '.',
        }))
      : undefined;

    return {
      id: taskId,
      taskNumber,
      badgeVariant: tIdx < 2 ? 'light' : 'dark',
      title: String(t.title || ''),
      instructions: t.instructions ? String(t.instructions) : undefined,
      hasPartnerWork: Boolean(t.hasPartnerWork),
      hasCrayonIcon: Boolean(t.hasCrayonIcon),
      hasIllustration: Boolean(t.hasIllustration),
      type,
      subtasks,
      equationColumns,
      cards,
      sacks,
      riddles,
    };
  });

  let illustrationBox: IllustrationBoundingBox | null = null;
  if (
    raw.illustrationBox &&
    typeof raw.illustrationBox.ymin === 'number' &&
    typeof raw.illustrationBox.xmin === 'number' &&
    typeof raw.illustrationBox.ymax === 'number' &&
    typeof raw.illustrationBox.xmax === 'number' &&
    raw.illustrationBox.ymax > raw.illustrationBox.ymin &&
    raw.illustrationBox.xmax > raw.illustrationBox.xmin
  ) {
    illustrationBox = {
      ymin: raw.illustrationBox.ymin,
      xmin: raw.illustrationBox.xmin,
      ymax: raw.illustrationBox.ymax,
      xmax: raw.illustrationBox.xmax,
      description: raw.illustrationBox.description || 'Buchillustration',
    };
  }

  return {
    documentCategory: 'worksheet',
    title: String(raw.title || 'Arbeitsblatt'),
    pageNumber: String(raw.pageNumber || ''),
    themeColor: String(raw.themeColor || '#D66840'),
    footerNote: String(raw.footerNote || ''),
    crossReference: String(raw.crossReference || ''),
    hasSmileySelfAssessment:
      raw.hasSmileySelfAssessment !== undefined ? Boolean(raw.hasSmileySelfAssessment) : true,
    illustrationBox,
    tasks,
  };
}
