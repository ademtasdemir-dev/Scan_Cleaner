export type RemainderBagColor = 'red' | 'blue' | 'green' | null;

export interface WordProblemSubtask {
  id: '1a' | '1b' | '1c';
  label: string;
  totalCards: number;
  childrenWord: string;
  childrenCount: number;
  questionLines: string[];
  quotient: number;
  remainder: number;
}

export interface DivisionEquation {
  id: string;
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
}

export interface EquationPack {
  id: string;
  label: 'a)' | 'b)' | 'c)';
  equations: DivisionEquation[];
}

export interface RemainderCardItem {
  id: string;
  row: 1 | 2;
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: 2 | 3 | 4;
  expectedColor: 'red' | 'blue' | 'green';
  tiltDeg: number;
}

export interface StudentWorksheetState {
  // Task 1: quotient, remainder, sentence cards per child, sentence leftover cards
  task1: Record<
    '1a' | '1b' | '1c',
    {
      quotient: string;
      remainder: string;
      cardsPerChild: string;
      cardsLeftover: string;
    }
  >;
  // Task 2 & 3: equations by id
  equations: Record<
    string,
    {
      quotient: string;
      remainder: string;
    }
  >;
  // Task 4: card colors by id
  task4Colors: Record<string, RemainderBagColor>;
  // Task 5: riddles
  task5a: string;
  task5b: [string, string, string];
  // Task 6: custom riddle
  task6CustomRiddle: string;
  task6CustomAnswer: string;
  // Self assessment smiley (0..3 or null)
  selectedSmiley: number | null;
}

export function solveDivisionWithRemainder(dividend: number, divisor: number): {
  quotient: number;
  remainder: number;
} {
  if (divisor <= 0 || !Number.isInteger(dividend) || !Number.isInteger(divisor)) {
    throw new Error('Dividend must be an integer and divisor must be a positive integer.');
  }
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  return { quotient, remainder };
}

export function getCardColorForRemainder(remainder: number): 'red' | 'blue' | 'green' | null {
  if (remainder === 2) return 'red';
  if (remainder === 3) return 'blue';
  if (remainder === 4) return 'green';
  return null;
}

export const TASK_1_SUBTASKS: WordProblemSubtask[] = [
  {
    id: '1a',
    label: 'a)',
    totalCards: 32,
    childrenWord: 'fünf',
    childrenCount: 5,
    questionLines: ['Wie viele Karten erhält jedes Kind?'],
    ...solveDivisionWithRemainder(32, 5),
  },
  {
    id: '1b',
    label: 'b)',
    totalCards: 32,
    childrenWord: 'sechs',
    childrenCount: 6,
    questionLines: ['Wie viele Karten erhält', 'jedes Kind?'],
    ...solveDivisionWithRemainder(32, 6),
  },
  {
    id: '1c',
    label: 'c)',
    totalCards: 32,
    childrenWord: 'sieben',
    childrenCount: 7,
    questionLines: ['Wie viele Karten erhält jedes Kind?'],
    ...solveDivisionWithRemainder(32, 7),
  },
];

function makeEq(id: string, dividend: number, divisor: number): DivisionEquation {
  const { quotient, remainder } = solveDivisionWithRemainder(dividend, divisor);
  return { id, dividend, divisor, quotient, remainder };
}

export const TASK_2_PACKS: EquationPack[] = [
  {
    id: '2a',
    label: 'a)',
    equations: [
      makeEq('2a-1', 27, 5),
      makeEq('2a-2', 28, 5),
      makeEq('2a-3', 29, 5),
    ],
  },
  {
    id: '2b',
    label: 'b)',
    equations: [
      makeEq('2b-1', 9, 3),
      makeEq('2b-2', 10, 3),
      makeEq('2b-3', 11, 3),
    ],
  },
  {
    id: '2c',
    label: 'c)',
    equations: [
      makeEq('2c-1', 14, 6),
      makeEq('2c-2', 15, 6),
      makeEq('2c-3', 16, 6),
    ],
  },
];

export const TASK_3_PACKS: EquationPack[] = [
  {
    id: '3a',
    label: 'a)',
    equations: [
      makeEq('3a-1', 9, 2),
      makeEq('3a-2', 15, 2),
      makeEq('3a-3', 21, 2),
    ],
  },
  {
    id: '3b',
    label: 'b)',
    equations: [
      makeEq('3b-1', 18, 4),
      makeEq('3b-2', 21, 4),
      makeEq('3b-3', 39, 4),
    ],
  },
  {
    id: '3c',
    label: 'c)',
    equations: [
      makeEq('3c-1', 17, 8),
      makeEq('3c-2', 59, 8),
      makeEq('3c-3', 51, 8),
    ],
  },
];

function makeCard(
  id: string,
  row: 1 | 2,
  dividend: number,
  divisor: number,
  tiltDeg: number
): RemainderCardItem {
  const { quotient, remainder } = solveDivisionWithRemainder(dividend, divisor);
  const expectedColor = getCardColorForRemainder(remainder);
  if (!expectedColor || (remainder !== 2 && remainder !== 3 && remainder !== 4)) {
    throw new Error(`Unexpected remainder ${remainder} for card ${dividend}:${divisor}`);
  }
  return {
    id,
    row,
    dividend,
    divisor,
    quotient,
    remainder,
    expectedColor,
    tiltDeg,
  };
}

export const TASK_4_CARDS: RemainderCardItem[] = [
  // Row 1 (4 cards)
  makeCard('4-1', 1, 40, 6, -1.2),
  makeCard('4-2', 1, 51, 7, 0.8),
  makeCard('4-3', 1, 75, 9, -0.7),
  makeCard('4-4', 1, 19, 4, 1.1),
  // Row 2 (6 cards)
  makeCard('4-5', 2, 23, 3, -1.5),
  makeCard('4-6', 2, 54, 10, 1.3),
  makeCard('4-7', 2, 45, 6, -0.9),
  makeCard('4-8', 2, 58, 7, 1.2),
  makeCard('4-9', 2, 50, 8, -0.8),
  makeCard('4-10', 2, 31, 9, -1.3),
];

export const TASK_5_SOLUTIONS = {
  // 5a: Multiples of 9 (1..90) with remainder 3 when divided by 8 -> 27 (27 : 8 = 3 R 3)
  aPrimary: 27,
  // 5b: Multiples of 6 (1..60) with remainder 4 when divided by 8 -> 12, 36, 60
  bPrimary: [12, 36, 60] as [number, number, number],
};

export function isValidTask5aAnswer(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const num = Number(trimmed);
  if (!Number.isInteger(num) || num <= 0) return false;
  return num % 9 === 0 && num % 8 === 3;
}

export function validateTask5bAnswers(values: [string, string, string]): {
  validIndices: [boolean, boolean, boolean];
  allUniqueAndValid: boolean;
} {
  const parsed = values.map((v) => {
    const t = v.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isInteger(n) && n > 0 ? n : null;
  });

  const validIndices: [boolean, boolean, boolean] = [false, false, false];
  const seen = new Set<number>();

  parsed.forEach((n, idx) => {
    if (n !== null && n % 6 === 0 && n % 8 === 4 && !seen.has(n)) {
      validIndices[idx] = true;
      seen.add(n);
    }
  });

  return {
    validIndices,
    allUniqueAndValid: validIndices.every(Boolean),
  };
}

export function createEmptyStudentState(): StudentWorksheetState {
  const equations: StudentWorksheetState['equations'] = {};
  for (const pack of [...TASK_2_PACKS, ...TASK_3_PACKS]) {
    for (const eq of pack.equations) {
      equations[eq.id] = { quotient: '', remainder: '' };
    }
  }

  const task4Colors: Record<string, RemainderBagColor> = {};
  for (const card of TASK_4_CARDS) {
    task4Colors[card.id] = null;
  }

  return {
    task1: {
      '1a': { quotient: '', remainder: '', cardsPerChild: '', cardsLeftover: '' },
      '1b': { quotient: '', remainder: '', cardsPerChild: '', cardsLeftover: '' },
      '1c': { quotient: '', remainder: '', cardsPerChild: '', cardsLeftover: '' },
    },
    equations,
    task4Colors,
    task5a: '',
    task5b: ['', '', ''],
    task6CustomRiddle: '',
    task6CustomAnswer: '',
    selectedSmiley: null,
  };
}

export function createSolvedStudentState(): StudentWorksheetState {
  const equations: StudentWorksheetState['equations'] = {};
  for (const pack of [...TASK_2_PACKS, ...TASK_3_PACKS]) {
    for (const eq of pack.equations) {
      equations[eq.id] = {
        quotient: String(eq.quotient),
        remainder: String(eq.remainder),
      };
    }
  }

  const task4Colors: Record<string, RemainderBagColor> = {};
  for (const card of TASK_4_CARDS) {
    task4Colors[card.id] = card.expectedColor;
  }

  return {
    task1: {
      '1a': {
        quotient: '6',
        remainder: '2',
        cardsPerChild: '6',
        cardsLeftover: '2',
      },
      '1b': {
        quotient: '5',
        remainder: '2',
        cardsPerChild: '5',
        cardsLeftover: '2',
      },
      '1c': {
        quotient: '4',
        remainder: '4',
        cardsPerChild: '4',
        cardsLeftover: '4',
      },
    },
    equations,
    task4Colors,
    task5a: String(TASK_5_SOLUTIONS.aPrimary),
    task5b: [
      String(TASK_5_SOLUTIONS.bPrimary[0]),
      String(TASK_5_SOLUTIONS.bPrimary[1]),
      String(TASK_5_SOLUTIONS.bPrimary[2]),
    ],
    task6CustomRiddle:
      'Meine Zahl gehört zur Siebener-Reihe. Wenn du sie durch 5 dividierst, bleibt als Rest 3.',
    task6CustomAnswer: '28',
    selectedSmiley: 0,
  };
}

export interface WorksheetValidationSummary {
  totalFields: number;
  filledFields: number;
  correctFields: number;
  isComplete: boolean;
  isAllCorrect: boolean;
}

export function evaluateStudentWorksheet(
  state: StudentWorksheetState
): WorksheetValidationSummary {
  let totalFields = 0;
  let filledFields = 0;
  let correctFields = 0;

  // Task 1: 3 subtasks * 4 fields = 12 fields
  for (const sub of TASK_1_SUBTASKS) {
    const entry = state.task1[sub.id];
    const checks: Array<[string, number]> = [
      [entry.quotient, sub.quotient],
      [entry.remainder, sub.remainder],
      [entry.cardsPerChild, sub.quotient],
      [entry.cardsLeftover, sub.remainder],
    ];
    for (const [val, expected] of checks) {
      totalFields++;
      const trimmed = val.trim();
      if (trimmed !== '') {
        filledFields++;
        if (Number(trimmed) === expected) {
          correctFields++;
        }
      }
    }
  }

  // Task 2 & Task 3: 18 equations * 2 fields = 36 fields
  for (const pack of [...TASK_2_PACKS, ...TASK_3_PACKS]) {
    for (const eq of pack.equations) {
      const entry = state.equations[eq.id] ?? { quotient: '', remainder: '' };
      totalFields += 2;
      if (entry.quotient.trim() !== '') {
        filledFields++;
        if (Number(entry.quotient.trim()) === eq.quotient) {
          correctFields++;
        }
      }
      if (entry.remainder.trim() !== '') {
        filledFields++;
        if (Number(entry.remainder.trim()) === eq.remainder) {
          correctFields++;
        }
      }
    }
  }

  // Task 4: 10 cards
  for (const card of TASK_4_CARDS) {
    totalFields++;
    const color = state.task4Colors[card.id];
    if (color !== null && color !== undefined) {
      filledFields++;
      if (color === card.expectedColor) {
        correctFields++;
      }
    }
  }

  // Task 5a: 1 field
  totalFields++;
  if (state.task5a.trim() !== '') {
    filledFields++;
    if (isValidTask5aAnswer(state.task5a)) {
      correctFields++;
    }
  }

  // Task 5b: 3 fields
  const { validIndices } = validateTask5bAnswers(state.task5b);
  state.task5b.forEach((val, idx) => {
    totalFields++;
    if (val.trim() !== '') {
      filledFields++;
      if (validIndices[idx]) {
        correctFields++;
      }
    }
  });

  return {
    totalFields,
    filledFields,
    correctFields,
    isComplete: filledFields === totalFields,
    isAllCorrect: correctFields === totalFields,
  };
}
