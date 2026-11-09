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
