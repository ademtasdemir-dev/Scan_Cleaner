import test from 'node:test';
import assert from 'node:assert/strict';
import {
  solveDivisionWithRemainder,
  getCardColorForRemainder,
  TASK_1_SUBTASKS,
  TASK_2_PACKS,
  TASK_3_PACKS,
  TASK_4_CARDS,
  isValidTask5aAnswer,
  validateTask5bAnswers,
  createEmptyStudentState,
  createSolvedStudentState,
  evaluateStudentWorksheet,
} from './worksheetData';
import {
  DEFAULT_BOOK_PAGE_22,
  createEmptyUniversalState,
  evaluateUniversalWorksheet,
  normalizeAnalyzedDocument,
} from '../types/worksheetModel';

test('solveDivisionWithRemainder calculates quotient and remainder accurately for Task 1', () => {
  assert.deepEqual(solveDivisionWithRemainder(32, 5), { quotient: 6, remainder: 2 });
  assert.deepEqual(solveDivisionWithRemainder(32, 6), { quotient: 5, remainder: 2 });
  assert.deepEqual(solveDivisionWithRemainder(32, 7), { quotient: 4, remainder: 4 });
  assert.equal(TASK_1_SUBTASKS.length, 3);
});

test('Task 2 and Task 3 equation packs match textbook solutions', () => {
  const allPacks = [...TASK_2_PACKS, ...TASK_3_PACKS];
  assert.equal(allPacks.length, 6);

  // Check 9 : 3 = 3 R 0 in 2b
  const pack2b = TASK_2_PACKS.find((p) => p.id === '2b')!;
  assert.deepEqual(
    pack2b.equations.map((e) => [e.quotient, e.remainder]),
    [
      [3, 0],
      [3, 1],
      [3, 2],
    ]
  );

  // Check 3c: 17:8=2 R1, 59:8=7 R3, 51:8=6 R3
  const pack3c = TASK_3_PACKS.find((p) => p.id === '3c')!;
  assert.deepEqual(
    pack3c.equations.map((e) => [e.quotient, e.remainder]),
    [
      [2, 1],
      [7, 3],
      [6, 3],
    ]
  );
});

test('Task 4 cards map to expected remainder sack colors (Rest 2=red, Rest 3=blue, Rest 4=green)', () => {
  assert.equal(TASK_4_CARDS.length, 10);
  assert.equal(getCardColorForRemainder(2), 'red');
  assert.equal(getCardColorForRemainder(3), 'blue');
  assert.equal(getCardColorForRemainder(4), 'green');

  const redCards = TASK_4_CARDS.filter((c) => c.expectedColor === 'red');
  const blueCards = TASK_4_CARDS.filter((c) => c.expectedColor === 'blue');
  const greenCards = TASK_4_CARDS.filter((c) => c.expectedColor === 'green');

  // Red (Rest 2): 51:7 (7 R2), 23:3 (7 R2), 58:7 (8 R2), 50:8 (6 R2) -> 4 cards
  assert.equal(redCards.length, 4);
  // Blue (Rest 3): 75:9 (8 R3), 19:4 (4 R3), 45:6 (7 R3) -> 3 cards
  assert.equal(blueCards.length, 3);
  // Green (Rest 4): 40:6 (6 R4), 54:10 (5 R4), 31:9 (3 R4) -> 3 cards
  assert.equal(greenCards.length, 3);
});

test('Task 5 number riddles validate multiples and remainders properly', () => {
  assert.equal(isValidTask5aAnswer('27'), true);
  assert.equal(isValidTask5aAnswer('18'), false);
  assert.equal(isValidTask5aAnswer(''), false);

  const res5b = validateTask5bAnswers(['12', '36', '60']);
  assert.equal(res5b.allUniqueAndValid, true);

  const duplicate5b = validateTask5bAnswers(['12', '12', '60']);
  assert.equal(duplicate5b.allUniqueAndValid, false);
});

test('evaluateStudentWorksheet grades empty vs solved worksheet states', () => {
  const empty = createEmptyStudentState();
  const emptySummary = evaluateStudentWorksheet(empty);
  assert.equal(emptySummary.totalFields, 62);
  assert.equal(emptySummary.filledFields, 0);
  assert.equal(emptySummary.correctFields, 0);
  assert.equal(emptySummary.isAllCorrect, false);

  const solved = createSolvedStudentState();
  const solvedSummary = evaluateStudentWorksheet(solved);
  assert.equal(solvedSummary.totalFields, 62);
  assert.equal(solvedSummary.filledFields, 62);
  assert.equal(solvedSummary.correctFields, 62);
  assert.equal(solvedSummary.isComplete, true);
  assert.equal(solvedSummary.isAllCorrect, true);
});

test('normalizeAnalyzedDocument normalizes newly analyzed scan JSON into UniversalWorksheetDocument', () => {
  const rawScan34 = {
    title: 'Rechnen mit großen Zahlen und Rest',
    pageNumber: '34',
    themeColor: '#2B6CB0',
    tasks: [
      {
        taskNumber: '1',
        type: 'word-problem',
        subtasks: [
          {
            label: 'a)',
            storyLines: ['45 Äpfel werden in 6 Körbe verteilt.'],
            question: 'F: Wie viele Äpfel sind in jedem Korb?',
            equationPrefix: 'L: 45 : 6 =',
            solutionQuotient: '7',
            solutionRemainder: '3',
          },
        ],
      },
      {
        taskNumber: '2',
        title: 'Löse die Aufgabenpäckchen sorgfältig.',
        type: 'equation-grid',
        equationColumns: [
          {
            label: 'a)',
            items: [
              { expressionLeft: '37 : 5 =', solutionMain: '7', hasRemainder: true, solutionRemainder: '2' },
            ],
          },
        ],
      },
    ],
  };

  const doc = normalizeAnalyzedDocument(rawScan34);
  assert.equal(doc.title, 'Rechnen mit großen Zahlen und Rest');
  assert.equal(doc.pageNumber, '34');
  assert.equal(doc.tasks.length, 2);

  const emptyState = createEmptyUniversalState(doc);
  const evalEmpty = evaluateUniversalWorksheet(doc, emptyState);
  assert.equal(evalEmpty.totalFields, 4);
  assert.equal(evalEmpty.filledFields, 0);

  // Fill correct answers
  const subId = doc.tasks[0].subtasks![0].id;
  const eqId = doc.tasks[1].equationColumns![0].items[0].id;
  emptyState.fields[`${subId}-q`] = '7';
  emptyState.fields[`${subId}-r`] = '3';
  emptyState.fields[`${eqId}-main`] = '7';
  emptyState.fields[`${eqId}-rem`] = '2';

  const evalFilled = evaluateUniversalWorksheet(doc, emptyState);
  assert.equal(evalFilled.filledFields, 4);
  assert.equal(evalFilled.correctFields, 4);
});

test('DEFAULT_BOOK_PAGE_22 universal evaluation counts all 62 interactive fields', () => {
  const state = createEmptyUniversalState(DEFAULT_BOOK_PAGE_22);
  const summary = evaluateUniversalWorksheet(DEFAULT_BOOK_PAGE_22, state);
  assert.equal(summary.totalFields, 62);
  assert.equal(summary.filledFields, 0);
});

test('normalizeAnalyzedDocument normalizes general letter and medical report scans (documentCategory=document)', () => {
  const rawReport = {
    documentCategory: 'document',
    title: 'MRT LWS Befundbericht',
    letterMeta: {
      topReferenceLine: 'Tasdemir, Adem',
      senderLine: 'MainRadiologie, Jahnstr. 5, 97199 Ochsenfurt',
      dateLine: '15.11.2023',
      recipientLines: ['Praxis', 'Dr. med. Aqeel Sabah'],
      salutation: 'Sehr geehrter Herr Kollege Sabah,',
      closingPhrase: 'Mit freundlichen Grüßen',
      signerName: 'Dr. Alexandra Obert',
    },
    documentSections: [
      {
        id: 'sec-1',
        heading: 'Befund:',
        paragraphs: ['Unauffällige paravertebrale Weichteile.'],
      },
    ],
  };

  const doc = normalizeAnalyzedDocument(rawReport);
  assert.equal(doc.documentCategory, 'document');
  assert.equal(doc.letterMeta?.topReferenceLine, 'Tasdemir, Adem');
  assert.equal(doc.documentSections?.length, 1);
});


