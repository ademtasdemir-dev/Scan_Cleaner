import { jsPDF } from 'jspdf';
import {
  TASK_1_SUBTASKS,
  TASK_2_PACKS,
  TASK_3_PACKS,
  TASK_4_CARDS,
  StudentWorksheetState,
  createEmptyStudentState,
  createSolvedStudentState,
} from '../data/worksheetData';
import { getCachedChildrenIllustrationDataUrl } from '../components/TextbookIllustrations';

export interface PdfGenerationOptions {
  mode: 'clean' | 'solution' | 'custom';
  customState?: StudentWorksheetState;
  includeSchoolHeader?: boolean;
  includeTask6Lines?: boolean;
  useOriginalCrop?: boolean;
}

function drawOrangeGridBanner(doc: jsPDF, yOffset: number) {
  const bannerX = 12;
  const bannerY = 8 + yOffset;
  const bannerW = 186;
  const bannerH = 14;

  // Main orange banner
  doc.setFillColor(214, 104, 64); // #D66840 textbook orange
  doc.rect(bannerX, bannerY, bannerW, bannerH, 'F');

  // Stepped orange blocks on bottom-left (characteristic textbook motif)
  doc.rect(bannerX + 4.5, bannerY + bannerH, 13.5, 3.2, 'F');
  doc.rect(bannerX + 9.0, bannerY + bannerH + 3.2, 4.5, 3.2, 'F');

  // Subtle grid lines inside banner (4.5mm grid)
  doc.setDrawColor(232, 138, 102);
  doc.setLineWidth(0.2);
  for (let x = bannerX + 4.5; x < bannerX + bannerW; x += 4.5) {
    doc.line(x, bannerY, x, bannerY + bannerH);
  }
  for (let y = bannerY + 4.5; y < bannerY + bannerH; y += 4.5) {
    doc.line(bannerX, y, bannerX + bannerW, y);
  }

  // Title text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Dividieren mit Rest', bannerX + 20, bannerY + 9.8);
}

function drawTaskBadge(
  doc: jsPDF,
  num: string,
  x: number,
  y: number,
  variant: 'light' | 'dark' = 'dark'
) {
  if (variant === 'light') {
    doc.setFillColor(246, 180, 142); // Soft peach-orange for tasks 1 & 2
    doc.setTextColor(124, 45, 18);
  } else {
    doc.setFillColor(219, 109, 71); // Coral-orange for tasks 3, 4, 5, 6
    doc.setTextColor(255, 255, 255);
  }
  doc.rect(x, y, 6.2, 6.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(num, x + 3.1, y + 4.5, { align: 'center' });
}

function drawPartnerIconPdf(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(80, 85, 95);
  doc.setLineWidth(0.35);
  // Left child head & shoulder
  doc.circle(x + 2.2, y + 2.2, 1.5, 'S');
  doc.lines(
    [
      [0.6, -1.6],
      [2.2, 0],
      [0.6, 1.6],
    ],
    x + 0.5,
    y + 5.8
  );
  // Right child head & shoulder
  doc.circle(x + 6.2, y + 2.2, 1.5, 'S');
  doc.lines(
    [
      [0.6, -1.6],
      [2.2, 0],
      [0.6, 1.6],
    ],
    x + 4.5,
    y + 5.8
  );
}

function drawVectorChildrenTablePdf(doc: jsPDF, x: number, y: number, w: number, h: number) {
  const cx = x + w * 0.52;
  const cy = y + h * 0.62;

  // Table shadow
  doc.setFillColor(226, 232, 240);
  doc.ellipse(cx, y + h * 0.86, w * 0.31, h * 0.08, 'F');

  // Back children heads & shirts
  const kids = [
    { kx: cx - 16, ky: cy - 15, shirt: [132, 204, 22], hair: [253, 224, 71] },
    { kx: cx - 2, ky: cy - 17, shirt: [147, 197, 253], hair: [254, 240, 138] },
    { kx: cx + 13, ky: cy - 14, shirt: [253, 186, 116], hair: [180, 83, 9] },
  ];
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.35);
  kids.forEach((k) => {
    doc.setFillColor(k.shirt[0], k.shirt[1], k.shirt[2]);
    doc.ellipse(k.kx, k.ky + 7, 4.8, 5.5, 'FD');
    doc.setFillColor(245, 208, 197);
    doc.circle(k.kx, k.ky, 3.8, 'FD');
    doc.setFillColor(k.hair[0], k.hair[1], k.hair[2]);
    doc.ellipse(k.kx, k.ky - 2.3, 3.8, 1.8, 'FD');
  });

  // Table surface
  doc.setFillColor(203, 213, 225);
  doc.setDrawColor(30, 41, 59);
  doc.ellipse(cx, cy, w * 0.28, h * 0.21, 'FD');

  // Red cards on table
  doc.setFillColor(220, 38, 38);
  const cardOffsets = [
    [-14, -3],
    [-11, -2],
    [-3, -6],
    [0, -5],
    [10, -4],
    [13, -3],
    [-6, 2],
    [-3, 3],
    [7, 3],
    [10, 4],
  ];
  cardOffsets.forEach(([dx, dy]) => {
    doc.rect(cx + dx, cy + dy, 3.2, 2.2, 'FD');
  });

  // Front-left child in wheelchair
  doc.setFillColor(101, 163, 13);
  doc.ellipse(cx - 28, cy - 1, 5.2, 6.5, 'FD');
  doc.setFillColor(245, 208, 197);
  doc.circle(cx - 28, cy - 10, 3.8, 'FD');
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.circle(cx - 29, cy + 7, 6.2, 'S');
  doc.setLineWidth(0.3);
  doc.circle(cx - 29, cy + 7, 4.6, 'S');

  // Front-right child
  doc.setFillColor(132, 204, 22);
  doc.ellipse(cx + 26, cy + 1, 5.2, 7, 'FD');
  doc.setFillColor(214, 158, 114);
  doc.circle(cx + 26, cy - 9, 3.8, 'FD');
}

function drawBlankOrSolution(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  value: string,
  isSolutionStyle: boolean
) {
  // Draw crisp underline
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.32);
  doc.line(x, y + 0.8, x + width, y + 0.8);

  if (value && value.trim() !== '') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    if (isSolutionStyle) {
      doc.setTextColor(29, 78, 216); // Neat blue ink for solutions
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(value.trim(), x + width / 2, y - 0.3, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
  }
}

function drawRemainderSackPdf(
  doc: jsPDF,
  x: number,
  y: number,
  remainder: 2 | 3 | 4,
  rgb: [number, number, number]
) {
  // Base shadow
  doc.setFillColor(215, 222, 232);
  doc.ellipse(x + 8, y + 18.5, 6.8, 1.4, 'F');

  // Sack top knot
  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.triangle(x + 5, y + 2, x + 11, y + 2, x + 8, y + 6.5, 'FD');

  // Sack main body
  doc.ellipse(x + 8, y + 12.2, 6.8, 6.2, 'FD');

  // Neck tie line
  doc.setLineWidth(0.5);
  doc.line(x + 5.8, y + 6.1, x + 10.2, y + 6.1);

  // Label inside sack
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.setTextColor(20, 20, 25);
  doc.text('Rest', x + 8, y + 11.4, { align: 'center' });
  doc.text(String(remainder), x + 8, y + 15.1, { align: 'center' });
}

export function buildWorksheetPdfDocument(options: PdfGenerationOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const state: StudentWorksheetState =
    options.mode === 'solution'
      ? createSolvedStudentState()
      : options.mode === 'custom' && options.customState
      ? options.customState
      : createEmptyStudentState();

  const isSolution = options.mode === 'solution' || options.mode === 'custom';
  const yShift = options.includeSchoolHeader ? 6 : 0;
  const gapScale = options.includeSchoolHeader ? 0.96 : 1;

  // White A4 background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // Optional school header (Name / Klasse / Datum)
  if (options.includeSchoolHeader) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Name: ____________________________', 20, 9.5);
    doc.text('Klasse: __________', 105, 9.5);
    doc.text('Datum: __________________', 148, 9.5);
  }

  // 1. Orange Grid Header Banner
  drawOrangeGridBanner(doc, yShift);

  // =========================================================================
  // SECTION 1: 32 Karten verteilen (1, a, b, c)
  // =========================================================================
  const s1Y = 29 + yShift;
  drawTaskBadge(doc, '1', 26, s1Y, 'light');

  // Children at card table illustration
  const croppedDataUrl =
    options.useOriginalCrop !== false ? getCachedChildrenIllustrationDataUrl() : null;
  if (croppedDataUrl) {
    try {
      doc.addImage(croppedDataUrl, 'PNG', 35, s1Y - 2, 68, 32);
    } catch {
      drawVectorChildrenTablePdf(doc, 35, s1Y - 2, 68, 32);
    }
  } else {
    drawVectorChildrenTablePdf(doc, 35, s1Y - 2, 68, 32);
  }

  // Helper to render 1a, 1b, 1c blocks
  const renderTask1Block = (
    subId: '1a' | '1b' | '1c',
    bx: number,
    by: number,
    twoLineQuestion: boolean
  ) => {
    const sub = TASK_1_SUBTASKS.find((s) => s.id === subId)!;
    const st = state.task1[subId];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    doc.setTextColor(30, 41, 59);

    doc.text(`${sub.label}`, bx, by);
    doc.text(`32 Karten sollen gerecht`, bx + 5, by);
    doc.text(`an ${sub.childrenWord} Kinder verteilt werden.`, bx + 5, by + 4.5);

    let curY = by + 9.2;
    if (twoLineQuestion) {
      doc.text('F:', bx + 5, curY);
      doc.text('Wie viele Karten erhält', bx + 11, curY);
      curY += 4.5;
      doc.text('jedes Kind?', bx + 11, curY);
    } else {
      doc.text('F:', bx + 5, curY);
      doc.text('Wie viele Karten erhält jedes Kind?', bx + 11, curY);
    }

    curY += 5.0;
    doc.text('L:', bx + 5, curY);
    doc.text(`32 : ${sub.childrenCount} =`, bx + 11, curY);
    drawBlankOrSolution(doc, bx + 25.5, curY, 9, st.quotient, isSolution);
    doc.text('R', bx + 36.2, curY);
    drawBlankOrSolution(doc, bx + 40.2, curY, 9, st.remainder, isSolution);

    curY += 5.2;
    doc.text('A:', bx + 5, curY);
    drawBlankOrSolution(doc, bx + 11, curY, 9, st.cardsPerChild, isSolution);
    doc.text('Karten erhält jedes Kind.', bx + 21.5, curY);

    curY += 5.0;
    drawBlankOrSolution(doc, bx + 11, curY, 9, st.cardsLeftover, isSolution);
    doc.text('Karten bleiben übrig.', bx + 21.5, curY);
  };

  // 1a (top right)
  renderTask1Block('1a', 114, s1Y + 1, false);
  // 1b (bottom left under illustration)
  renderTask1Block('1b', 33, s1Y + 35.5 * gapScale, true);
  // 1c (bottom right under 1a)
  renderTask1Block('1c', 114, s1Y + 35.5 * gapScale, false);

  // =========================================================================
  // SECTION 2: Päckchen rechnen (2, a, b, c)
  // =========================================================================
  const s2Y = Math.round(101 * gapScale) + yShift;
  drawPartnerIconPdf(doc, 14, s2Y - 0.5);
  drawTaskBadge(doc, '2', 24.5, s2Y, 'light');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.8);
  doc.setTextColor(30, 41, 59);
  doc.text('Rechnet. Seht euch jedes Päckchen genau an. Was stellt ihr fest?', 33, s2Y + 4.5);

  const packColsX = [32, 88, 144];
  TASK_2_PACKS.forEach((pack, colIdx) => {
    const px = packColsX[colIdx];
    const py = s2Y + 11;
    doc.setFont('helvetica', 'normal');
    doc.text(pack.label, px, py);

    pack.equations.forEach((eq, rowIdx) => {
      const ey = py + rowIdx * 6.2;
      const eqState = state.equations[eq.id] ?? { quotient: '', remainder: '' };
      const lhs = `${String(eq.dividend).padStart(2, ' ')} : ${eq.divisor} =`;
      doc.text(lhs, px + 16, ey, { align: 'right' });
      drawBlankOrSolution(doc, px + 17.5, ey, 8.5, eqState.quotient, isSolution);
      doc.text('R', px + 27.5, ey);
      drawBlankOrSolution(doc, px + 31.2, ey, 8.5, eqState.remainder, isSolution);
    });
  });

  // =========================================================================
  // SECTION 3: Weitere Divisionsaufgaben (3, a, b, c)
  // =========================================================================
  const s3Y = Math.round(132 * gapScale) + yShift;
  drawTaskBadge(doc, '3', 24.5, s3Y, 'dark');

  TASK_3_PACKS.forEach((pack, colIdx) => {
    const px = packColsX[colIdx];
    const py = s3Y + 4.5;
    doc.setFont('helvetica', 'normal');
    doc.text(pack.label, px, py);

    pack.equations.forEach((eq, rowIdx) => {
      const ey = py + rowIdx * 6.2;
      const eqState = state.equations[eq.id] ?? { quotient: '', remainder: '' };
      const lhs = `${String(eq.dividend).padStart(2, ' ')} : ${eq.divisor} =`;
      doc.text(lhs, px + 16, ey, { align: 'right' });
      drawBlankOrSolution(doc, px + 17.5, ey, 8.5, eqState.quotient, isSolution);
      doc.text('R', px + 27.5, ey);
      drawBlankOrSolution(doc, px + 31.2, ey, 8.5, eqState.remainder, isSolution);
    });
  });

  // =========================================================================
  // SECTION 4: Aufgabenkärtchen & Rest-Säcke (4)
  // =========================================================================
  const s4Y = Math.round(158 * gapScale) + yShift;
  drawTaskBadge(doc, '4', 24.5, s4Y, 'dark');

  // Small pencil icon under badge 4
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.35);
  doc.line(23.5, s4Y + 11.5, 29.5, s4Y + 8);
  doc.line(24.2, s4Y + 12.5, 30.2, s4Y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.8);
  doc.setTextColor(30, 41, 59);
  doc.text('Bei welchen Aufgaben bleibt der Rest 2, 3 oder 4?', 33, s4Y + 4.2);
  doc.text('Male die Aufgabenkärtchen in der richtigen Farbe an.', 33, s4Y + 9.2);

  // Three sacks on the right
  drawRemainderSackPdf(doc, 137, s4Y - 1, 2, [200, 75, 49]);
  drawRemainderSackPdf(doc, 155, s4Y + 2, 3, [91, 125, 177]);
  drawRemainderSackPdf(doc, 173, s4Y - 0.5, 4, [83, 141, 78]);

  // Task 4 Cards (Row 1: 4 cards, Row 2: 6 cards)
  const row1Cards = TASK_4_CARDS.filter((c) => c.row === 1);
  const row2Cards = TASK_4_CARDS.filter((c) => c.row === 2);

  const drawCardPdf = (cardId: string, label: string, cx: number, cy: number) => {
    const color = state.task4Colors[cardId];
    if (color === 'red') {
      doc.setFillColor(254, 215, 215);
      doc.setDrawColor(185, 28, 28);
    } else if (color === 'blue') {
      doc.setFillColor(219, 234, 254);
      doc.setDrawColor(29, 78, 216);
    } else if (color === 'green') {
      doc.setFillColor(220, 252, 231);
      doc.setDrawColor(21, 128, 61);
    } else {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(100, 116, 139);
    }
    doc.setLineWidth(0.35);
    doc.rect(cx, cy, 20, 8.0, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    doc.setTextColor(15, 23, 42);
    doc.text(label, cx + 10, cy + 5.4, { align: 'center' });
  };

  row1Cards.forEach((c, idx) => {
    drawCardPdf(c.id, `${c.dividend} : ${c.divisor}`, 33 + idx * 24.5, s4Y + 14);
  });

  row2Cards.forEach((c, idx) => {
    const extraY = idx >= 4 ? 1.2 : 0;
    drawCardPdf(c.id, `${c.dividend} : ${c.divisor}`, 35 + idx * 24.5, s4Y + 25 + extraY);
  });

  // =========================================================================
  // SECTION 5: Zahlenrätsel (5, a, b)
  // =========================================================================
  const s5Y = Math.round(199 * gapScale) + yShift;
  drawTaskBadge(doc, '5', 24.5, s5Y, 'dark');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.8);
  doc.setTextColor(30, 41, 59);
  doc.text('Zahlenrätsel. Wie heißen die Zahlen?', 33, s5Y + 4.5);

  // 5a
  doc.text(
    'a) Meine Zahl gehört zur Neuner-Reihe. Wenn du sie durch 8 dividierst,',
    33,
    s5Y + 10.2
  );
  doc.text('bleibt als Rest 3.', 38, s5Y + 14.8);
  doc.text('Meine Zahl heißt', 38, s5Y + 19.6);
  drawBlankOrSolution(doc, 67.5, s5Y + 19.6, 13, state.task5a, isSolution);
  doc.text('.', 81, s5Y + 19.6);

  // 5b
  doc.text(
    'b) Meine Zahlen gehören zur Sechser-Reihe. Wenn du sie durch 8 dividierst,',
    33,
    s5Y + 26.5
  );
  doc.text('bleibt als Rest 4.', 38, s5Y + 31.1);
  doc.text('Meine Zahlen heißen', 38, s5Y + 35.9);
  drawBlankOrSolution(doc, 73, s5Y + 35.9, 12, state.task5b[0], isSolution);
  doc.text(',', 85.5, s5Y + 35.9);
  drawBlankOrSolution(doc, 88, s5Y + 35.9, 12, state.task5b[1], isSolution);
  doc.text(',', 100.5, s5Y + 35.9);
  drawBlankOrSolution(doc, 103, s5Y + 35.9, 12, state.task5b[2], isSolution);
  doc.text('.', 115.5, s5Y + 35.9);

  // =========================================================================
  // Self-Assessment Smileys on Left Margin (next to 5b & 6)
  // =========================================================================
  const smX = 16.5;
  const smStartY = s5Y + 26;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.32);
  // Small book icon above smileys
  doc.rect(smX - 2.8, smStartY - 7, 5.6, 4, 'S');
  doc.line(smX, smStartY - 7, smX, smStartY - 3);

  for (let i = 0; i < 4; i++) {
    const cy = smStartY + i * 6.0;
    doc.circle(smX, cy, 2.4, 'S');
    doc.circle(smX - 0.8, cy - 0.6, 0.25, 'F');
    doc.circle(smX + 0.8, cy - 0.6, 0.25, 'F');
    if (i === 0) {
      doc.line(smX - 1.1, cy + 0.6, smX, cy + 1.3);
      doc.line(smX, cy + 1.3, smX + 1.1, cy + 0.6);
    } else if (i === 1) {
      doc.line(smX - 1.0, cy + 0.7, smX, cy + 1.1);
      doc.line(smX, cy + 1.1, smX + 1.0, cy + 0.7);
    } else if (i === 2) {
      doc.line(smX - 1.0, cy + 0.8, smX + 1.0, cy + 0.8);
    } else {
      doc.line(smX - 1.0, cy + 1.2, smX, cy + 0.6);
      doc.line(smX, cy + 0.6, smX + 1.0, cy + 1.2);
    }
  }

  // =========================================================================
  // SECTION 6: Eigenes Zahlenrätsel (6)
  // =========================================================================
  const s6Y = Math.round(244 * gapScale) + yShift;
  drawTaskBadge(doc, '6', 24.5, s6Y, 'dark');
  drawPartnerIconPdf(doc, 23.5, s6Y + 7.2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.8);
  doc.setTextColor(30, 41, 59);
  doc.text('Schreibe ein eigenes Zahlenrätsel auf ein Blatt. Ein anderes Kind löst es.', 33, s6Y + 4.3);
  doc.text('Vergleicht.', 33, s6Y + 9.3);

  if (options.includeTask6Lines) {
    doc.setDrawColor(180, 190, 205);
    doc.setLineWidth(0.25);
    doc.line(33, s6Y + 15.0, 192, s6Y + 15.0);
    doc.line(33, s6Y + 20.5, 192, s6Y + 20.5);
  }

  // =========================================================================
  // FOOTER (Page 22)
  // =========================================================================
  const footerY = 283;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(24.5, footerY - 4.5, 195, footerY - 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('22', 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text('› 6 Zahlenrätsel in der Klasse sammeln und vergleichen.', 24.5, footerY - 1);

  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('› zu Schulbuch-Seite 30', 195, footerY, { align: 'right' });

  return doc;
}

export function downloadWorksheetPdf(options: PdfGenerationOptions): string {
  const doc = buildWorksheetPdfDocument(options);
  const filename =
    options.mode === 'solution'
      ? 'Loesungsblatt_Dividieren_mit_Rest_S22.pdf'
      : options.mode === 'custom'
      ? 'Arbeitsblatt_Dividieren_mit_Rest_S22_Ausgefuellt.pdf'
      : 'Arbeitsblatt_Dividieren_mit_Rest_S22.pdf';
  doc.save(filename);
  return filename;
}

export function createWorksheetPdfBlobUrl(options: PdfGenerationOptions): string {
  const doc = buildWorksheetPdfDocument(options);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
