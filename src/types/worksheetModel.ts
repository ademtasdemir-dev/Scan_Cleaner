export interface UniversalTaskItem {
  id: string;
  taskNumber: string;
  title: string;
  instructions?: string;
  hasPartnerWork?: boolean;
  hasCrayonIcon?: boolean;
  type: 'word-problem' | 'equation-grid' | 'cards' | 'riddle' | 'free-text';
  rawText?: string;
  // Subtasks or equations
  subtasks?: Array<{
    id: string;
    label: string; // e.g. "a)"
    storyLines?: string[];
    question?: string;
    equationFormula?: string; // e.g. "32 : 5 ="
    solutionQuotient?: string | number;
    solutionRemainder?: string | number;
    answerLines?: string[];
  }>;
  // Equations grid
  equationColumns?: Array<{
    label: string; // e.g. "a)", "b)", "c)"
    items: Array<{
      id: string;
      dividend: number | string;
      divisor: number | string;
      quotient?: number | string;
      remainder?: number | string;
    }>;
  }>;
  // Task 4 cards
  cards?: Array<{
    id: string;
    dividend: number | string;
    divisor: number | string;
    expectedColor?: 'red' | 'blue' | 'green';
  }>;
  sacks?: Array<{
    label: string;
    remainder: number;
    color: string;
  }>;
  // Riddles
  riddles?: Array<{
    label: string;
    text: string;
    blanksCount: number;
    answers?: string[];
  }>;
}

export interface UniversalWorksheetDocument {
  title: string;
  pageNumber?: string;
  themeColor: string; // Hex e.g. "#D66840"
  subtitle?: string;
  footerNote?: string;
  crossReference?: string;
  hasSmileySelfAssessment?: boolean;
  tasks: UniversalTaskItem[];
}

export const DEFAULT_BOOK_PAGE_22: UniversalWorksheetDocument = {
  title: 'Dividieren mit Rest',
  pageNumber: '22',
  themeColor: '#D66840',
  footerNote: '› 6 Zahlenrätsel in der Klasse sammeln und vergleichen.',
  crossReference: '› zu Schulbuch-Seite 30',
  hasSmileySelfAssessment: true,
  tasks: [
    {
      id: 'task-1',
      taskNumber: '1',
      title: 'Karten verteilen',
      type: 'word-problem',
      subtasks: [
        {
          id: '1a',
          label: 'a)',
          storyLines: ['32 Karten sollen gerecht', 'an fünf Kinder verteilt werden.'],
          question: 'F: Wie viele Karten erhält jedes Kind?',
          equationFormula: '32 : 5 =',
          solutionQuotient: 6,
          solutionRemainder: 2,
          answerLines: ['A: ______ Karten erhält jedes Kind.', '______ Karten bleiben übrig.'],
        },
        {
          id: '1b',
          label: 'b)',
          storyLines: ['32 Karten sollen gerecht', 'an sechs Kinder verteilt werden.'],
          question: 'F: Wie viele Karten erhält jedes Kind?',
          equationFormula: '32 : 6 =',
          solutionQuotient: 5,
          solutionRemainder: 2,
          answerLines: ['A: ______ Karten erhält jedes Kind.', '______ Karten bleiben übrig.'],
        },
        {
          id: '1c',
          label: 'c)',
          storyLines: ['32 Karten sollen gerecht', 'an sieben Kinder verteilt werden.'],
          question: 'F: Wie viele Karten erhält jedes Kind?',
          equationFormula: '32 : 7 =',
          solutionQuotient: 4,
          solutionRemainder: 4,
          answerLines: ['A: ______ Karten erhält jedes Kind.', '______ Karten bleiben übrig.'],
        },
      ],
    },
    {
      id: 'task-2',
      taskNumber: '2',
      title: 'Rechnet. Seht euch jedes Päckchen genau an. Was stellt ihr fest?',
      hasPartnerWork: true,
      type: 'equation-grid',
      equationColumns: [
        {
          label: 'a)',
          items: [
            { id: '2a-1', dividend: 27, divisor: 5, quotient: 5, remainder: 2 },
            { id: '2a-2', dividend: 28, divisor: 5, quotient: 5, remainder: 3 },
            { id: '2a-3', dividend: 29, divisor: 5, quotient: 5, remainder: 4 },
          ],
        },
        {
          label: 'b)',
          items: [
            { id: '2b-1', dividend: 9, divisor: 3, quotient: 3, remainder: 0 },
            { id: '2b-2', dividend: 10, divisor: 3, quotient: 3, remainder: 1 },
            { id: '2b-3', dividend: 11, divisor: 3, quotient: 3, remainder: 2 },
          ],
        },
        {
          label: 'c)',
          items: [
            { id: '2c-1', dividend: 14, divisor: 6, quotient: 2, remainder: 2 },
            { id: '2c-2', dividend: 15, divisor: 6, quotient: 2, remainder: 3 },
            { id: '2c-3', dividend: 16, divisor: 6, quotient: 2, remainder: 4 },
          ],
        },
      ],
    },
    {
      id: 'task-3',
      taskNumber: '3',
      title: 'Weitere Divisionsaufgaben berechnen',
      type: 'equation-grid',
      equationColumns: [
        {
          label: 'a)',
          items: [
            { id: '3a-1', dividend: 9, divisor: 2, quotient: 4, remainder: 1 },
            { id: '3a-2', dividend: 15, divisor: 2, quotient: 7, remainder: 1 },
            { id: '3a-3', dividend: 21, divisor: 2, quotient: 10, remainder: 1 },
          ],
        },
        {
          label: 'b)',
          items: [
            { id: '3b-1', dividend: 18, divisor: 4, quotient: 4, remainder: 2 },
            { id: '3b-2', dividend: 21, divisor: 4, quotient: 5, remainder: 1 },
            { id: '3b-3', dividend: 39, divisor: 4, quotient: 9, remainder: 3 },
          ],
        },
        {
          label: 'c)',
          items: [
            { id: '3c-1', dividend: 17, divisor: 8, quotient: 2, remainder: 1 },
            { id: '3c-2', dividend: 59, divisor: 8, quotient: 7, remainder: 3 },
            { id: '3c-3', dividend: 51, divisor: 8, quotient: 6, remainder: 3 },
          ],
        },
      ],
    },
    {
      id: 'task-4',
      taskNumber: '4',
      title: 'Bei welchen Aufgaben bleibt der Rest 2, 3 oder 4?',
      instructions: 'Male die Aufgabenkärtchen in der richtigen Farbe an.',
      hasCrayonIcon: true,
      type: 'cards',
      sacks: [
        { label: 'Rest 2', remainder: 2, color: '#c84b31' },
        { label: 'Rest 3', remainder: 3, color: '#5b7db1' },
        { label: 'Rest 4', remainder: 4, color: '#538d4e' },
      ],
      cards: [
        { id: '4-1', dividend: 40, divisor: 6, expectedColor: 'green' },
        { id: '4-2', dividend: 51, divisor: 7, expectedColor: 'red' },
        { id: '4-3', dividend: 75, divisor: 9, expectedColor: 'blue' },
        { id: '4-4', dividend: 19, divisor: 4, expectedColor: 'blue' },
        { id: '4-5', dividend: 23, divisor: 3, expectedColor: 'red' },
        { id: '4-6', dividend: 54, divisor: 10, expectedColor: 'green' },
        { id: '4-7', dividend: 45, divisor: 6, expectedColor: 'blue' },
        { id: '4-8', dividend: 58, divisor: 7, expectedColor: 'red' },
        { id: '4-9', dividend: 50, divisor: 8, expectedColor: 'red' },
        { id: '4-10', dividend: 31, divisor: 9, expectedColor: 'green' },
      ],
    },
    {
      id: 'task-5',
      taskNumber: '5',
      title: 'Zahlenrätsel. Wie heißen die Zahlen?',
      type: 'riddle',
      riddles: [
        {
          label: 'a)',
          text: 'Meine Zahl gehört zur Neuner-Reihe. Wenn du sie durch 8 dividierst, bleibt als Rest 3. Meine Zahl heißt ______.',
          blanksCount: 1,
          answers: ['27'],
        },
        {
          label: 'b)',
          text: 'Meine Zahlen gehören zur Sechser-Reihe. Wenn du sie durch 8 dividierst, bleibt als Rest 4. Meine Zahlen heißen ______, ______, ______.',
          blanksCount: 3,
          answers: ['12', '36', '60'],
        },
      ],
    },
    {
      id: 'task-6',
      taskNumber: '6',
      title: 'Schreibe ein eigenes Zahlenrätsel auf ein Blatt. Ein anderes Kind löst es. Vergleicht.',
      hasPartnerWork: true,
      type: 'free-text',
    },
  ],
};
