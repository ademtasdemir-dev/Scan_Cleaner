import { jsPDF } from 'jspdf';
import {
  UniversalWorksheetDocument,
  UniversalStudentState,
  DEFAULT_BOOK_PAGE_22,
} from '../types/worksheetModel';
import { getCachedChildrenIllustrationDataUrl } from '../components/TextbookIllustrations';

export interface PdfGenerationOptions {
  document?: UniversalWorksheetDocument;
  mode: 'clean' | 'solution' | 'custom';
  customState?: UniversalStudentState;
  includeSchoolHeader?: boolean;
  includeTask6Lines?: boolean;
  useOriginalCrop?: boolean;
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return [r, g, b];
    }
  }
  return [214, 104, 64]; // #D66840 fallback
}

function drawGridBanner(doc: jsPDF, title: string, themeColor: string, yOffset: number) {
  const bannerX = 12;
  const bannerY = 8 + yOffset;
  const bannerW = 186;
  const bannerH = 14;

  const [r, g, b] = hexToRgb(themeColor);
  doc.setFillColor(r, g, b);
  doc.rect(bannerX, bannerY, bannerW, bannerH, 'F');

  // Stepped blocks on bottom-left (characteristic textbook motif)
  doc.rect(bannerX + 4.5, bannerY + bannerH, 13.5, 3.2, 'F');
  doc.rect(bannerX + 9.0, bannerY + bannerH + 3.2, 4.5, 3.2, 'F');

  // Subtle grid lines inside banner (4.5mm grid)
  doc.setDrawColor(Math.min(255, r + 24), Math.min(255, g + 30), Math.min(255, b + 34));
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
  doc.text(title || 'Arbeitsblatt', bannerX + 20, bannerY + 9.8);
}

function drawTaskBadge(
  doc: jsPDF,
  num: string,
  x: number,
  y: number,
  variant: 'light' | 'dark' = 'dark'
) {
  if (variant === 'light') {
    doc.setFillColor(246, 180, 142);
    doc.setTextColor(124, 45, 18);
  } else {
    doc.setFillColor(219, 109, 71);
    doc.setTextColor(255, 255, 255);
  }
  doc.rect(x, y, 6.2, 6.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(String(num), x + 3.1, y + 4.5, { align: 'center' });
}

function drawPartnerIconPdf(doc: jsPDF, x: number, y: number) {
  doc.setDrawColor(80, 85, 95);
  doc.setLineWidth(0.35);
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

  doc.setFillColor(226, 232, 240);
  doc.ellipse(cx, y + h * 0.86, w * 0.31, h * 0.08, 'F');

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

  doc.setFillColor(203, 213, 225);
  doc.setDrawColor(30, 41, 59);
  doc.ellipse(cx, cy, w * 0.28, h * 0.21, 'FD');

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

  doc.setFillColor(101, 163, 13);
  doc.ellipse(cx - 28, cy - 1, 5.2, 6.5, 'FD');
  doc.setFillColor(245, 208, 197);
  doc.circle(cx - 28, cy - 10, 3.8, 'FD');
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);
  doc.circle(cx - 29, cy + 7, 6.2, 'S');
  doc.setLineWidth(0.3);
  doc.circle(cx - 29, cy + 7, 4.6, 'S');

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
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.32);
  doc.line(x, y + 0.8, x + width, y + 0.8);

  if (value && value.trim() !== '') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.2);
    if (isSolutionStyle) {
      doc.setTextColor(29, 78, 216);
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
  topLabel: string,
  subLabel: string,
  rgb: [number, number, number]
) {
  doc.setFillColor(215, 222, 232);
  doc.ellipse(x + 8, y + 18.5, 6.8, 1.4, 'F');

  doc.setFillColor(rgb[0], rgb[1], rgb[2]);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.4);
  doc.triangle(x + 5, y + 2, x + 11, y + 2, x + 8, y + 6.5, 'FD');
  doc.ellipse(x + 8, y + 12.2, 6.8, 6.2, 'FD');

  doc.setLineWidth(0.5);
  doc.line(x + 5.8, y + 6.1, x + 10.2, y + 6.1);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.0);
  doc.setTextColor(20, 20, 25);
  doc.text(topLabel, x + 8, y + 11.4, { align: 'center' });
  doc.text(subLabel, x + 8, y + 15.1, { align: 'center' });
}

export function buildWorksheetPdfDocument(options: PdfGenerationOptions): jsPDF {
  const worksheet = options.document ?? DEFAULT_BOOK_PAGE_22;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const isSolution = options.mode === 'solution';
  const isCustom = options.mode === 'custom' && Boolean(options.customState);
  const showValues = isSolution || isCustom;

  const getFieldVal = (key: string, solution?: string): string => {
    if (isSolution) return solution ?? '';
    if (isCustom && options.customState) return options.customState.fields[key] ?? '';
    return '';
  };

  const getCardColor = (cardId: string, expected: 'red' | 'blue' | 'green') => {
    if (isSolution) return expected;
    if (isCustom && options.customState) return options.customState.cardColors[cardId] ?? null;
    return null;
  };

  const yShift = options.includeSchoolHeader ? 6 : 0;

  // White A4 background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // =========================================================================
  // GENERAL DOCUMENT / LETTER / MEDICAL REPORT MODE (DIN A4 BRIEF)
  // =========================================================================
  if (worksheet.documentCategory === 'document') {
    const lm = worksheet.letterMeta || {};
    const sections = worksheet.documentSections || [];
    const leftX = 22;
    const maxW = 166;
    let y = 22;

    doc.setTextColor(30, 41, 59);

    if (lm.topReferenceLine) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(lm.topReferenceLine, leftX, y);
      y += 14;
    }

    if (lm.senderLine || lm.dateLine) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      if (lm.senderLine) {
        doc.text(lm.senderLine, leftX, y);
      }
      if (lm.dateLine) {
        doc.text(lm.dateLine, leftX + maxW, y, { align: 'right' });
      }
      y += 10;
    }

    if (lm.recipientLines && lm.recipientLines.length > 0) {
      doc.setFontSize(10.5);
      lm.recipientLines.forEach((line, idx) => {
        doc.setFont('helvetica', idx === 1 ? 'bold' : 'normal');
        doc.text(line, leftX, y);
        y += 5.0;
      });
      y += 8;
    }

    if (lm.noticeLine) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.2);
      doc.text(lm.noticeLine, leftX, y);
      y += 8;
    }

    if (lm.salutation) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      doc.text(lm.salutation, leftX, y);
      y += 6.5;
    }

    if (lm.introLines && lm.introLines.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.2);
      lm.introLines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, maxW);
        doc.text(wrapped, leftX, y);
        y += wrapped.length * 4.8;
      });
      y += 3.5;
    }

    const writeWrappedParagraph = (text: string, boldLead?: string) => {
      doc.setFontSize(10.2);
      if (boldLead) {
        doc.setFont('helvetica', 'bold');
        doc.text(boldLead, leftX, y);
        const leadW = doc.getTextWidth(`${boldLead} `);
        doc.setFont('helvetica', 'normal');
        const fullCombined = `${boldLead} ${text}`;
        const lines = doc.splitTextToSize(fullCombined, maxW);
        if (lines.length > 0) {
          const firstRest = lines[0].slice(boldLead.length).trimStart();
          doc.text(firstRest, leftX + leadW, y);
          for (let i = 1; i < lines.length; i++) {
            y += 4.8;
            doc.text(lines[i], leftX, y);
          }
        }
        y += 5.4;
      } else {
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(text, maxW);
        doc.text(lines, leftX, y);
        y += lines.length * 4.8 + 0.6;
      }
    };

    sections.forEach((sec) => {
      if (y > 260) {
        doc.addPage();
        y = 22;
      }
      if (sec.heading) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text(sec.heading, leftX, y);
        y += 5.2;
      }

      if (isCustom && options.customState?.freeText[sec.id]) {
        const customLines = options.customState.freeText[sec.id].split('\n');
        customLines.forEach((cl) => writeWrappedParagraph(cl));
        y += 2.5;
        return;
      }

      if (sec.inlineLeadBold && sec.paragraphs.length > 0) {
        writeWrappedParagraph(sec.paragraphs[0], sec.inlineLeadBold);
        sec.paragraphs.slice(1).forEach((p) => writeWrappedParagraph(p));
      } else {
        sec.paragraphs.forEach((p) => writeWrappedParagraph(p));
      }

      if (sec.listItems && sec.listItems.length > 0) {
        sec.listItems.forEach((item) => writeWrappedParagraph(item));
      }

      y += 2.5;
    });

    if (lm.closingPhrase || lm.signerName) {
      y += 3;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10.5);
      if (lm.closingPhrase) {
        doc.text(lm.closingPhrase, leftX, y);
        y += 14; // Clean blank space where handwritten signature was removed
      }
      if (isSolution && lm.removedHandwritingNote) {
        doc.setFontSize(8.5);
        doc.setTextColor(29, 78, 216);
        doc.text(`[${lm.removedHandwritingNote}]`, leftX, y - 6);
        doc.setTextColor(30, 41, 59);
      }
      if (lm.signerName) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.text(lm.signerName, leftX, y);
      }
    }

    return doc;
  }

  // Optional school header (Name / Klasse / Datum)
  if (options.includeSchoolHeader) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Name: ____________________________', 20, 9.5);
    doc.text('Klasse: __________', 105, 9.5);
    doc.text('Datum: __________________', 148, 9.5);
  }

  // 1. Header Banner
  drawGridBanner(doc, worksheet.title, worksheet.themeColor || '#D66840', yShift);

  let curY = 29 + yShift;

  // Render each task dynamically
  worksheet.tasks.forEach((task, taskIdx) => {
    const variant = task.badgeVariant ?? (taskIdx < 2 ? 'light' : 'dark');

    // =========================================================================
    // WORD-PROBLEM TASK (e.g. Task 1)
    // =========================================================================
    if (task.type === 'word-problem' && task.subtasks && task.subtasks.length > 0) {
      drawTaskBadge(doc, task.taskNumber, 24.5, curY, variant);

      if (task.title) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.8);
        doc.setTextColor(30, 41, 59);
        doc.text(task.title, 33, curY + 4.5);
        curY += 7;
      }

      const showIllu = Boolean(task.hasIllustration || (taskIdx === 0 && worksheet.illustrationBox));
      const croppedDataUrl =
        options.useOriginalCrop !== false ? getCachedChildrenIllustrationDataUrl() : null;

      if (showIllu) {
        if (croppedDataUrl) {
          try {
            doc.addImage(croppedDataUrl, 'PNG', 34, curY - 2, 68, 31);
          } catch {
            drawVectorChildrenTablePdf(doc, 34, curY - 2, 68, 31);
          }
        } else {
          drawVectorChildrenTablePdf(doc, 34, curY - 2, 68, 31);
        }
      }

      const renderSubPdf = (
        sub: NonNullable<typeof task.subtasks>[number],
        bx: number,
        by: number
      ): number => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);

        doc.text(sub.label, bx, by);
        let sy = by;
        sub.storyLines.forEach((line, lIdx) => {
          doc.text(line, bx + 5, sy + lIdx * 4.4);
        });
        sy += Math.max(1, sub.storyLines.length) * 4.4 + 0.5;

        if (sub.question) {
          doc.text(sub.question, bx + 5, sy);
          sy += 4.8;
        }

        if (sub.equationPrefix) {
          doc.text(sub.equationPrefix, bx + 5, sy);
          const prefixW = doc.getTextWidth(sub.equationPrefix) + 1.5;
          drawBlankOrSolution(
            doc,
            bx + 5 + prefixW,
            sy,
            8.5,
            getFieldVal(`${sub.id}-q`, sub.solutionQuotient),
            showValues
          );
          if (sub.solutionRemainder !== undefined && sub.solutionRemainder !== '') {
            doc.text('R', bx + 5 + prefixW + 10.2, sy);
            drawBlankOrSolution(
              doc,
              bx + 5 + prefixW + 14.2,
              sy,
              8.5,
              getFieldVal(`${sub.id}-r`, sub.solutionRemainder),
              showValues
            );
          }
          sy += 5.0;
        }

        if (sub.answerLine1Suffix || sub.answerLine1BlankSolution !== undefined) {
          doc.text(sub.answerLine1Prefix || 'A:', bx + 5, sy);
          drawBlankOrSolution(
            doc,
            bx + 11,
            sy,
            8.5,
            getFieldVal(`${sub.id}-a1`, sub.answerLine1BlankSolution),
            showValues
          );
          if (sub.answerLine1Suffix) {
            doc.text(sub.answerLine1Suffix, bx + 21, sy);
          }
          sy += 4.8;
        }

        if (sub.answerLine2Suffix || sub.answerLine2BlankSolution !== undefined) {
          drawBlankOrSolution(
            doc,
            bx + 11,
            sy,
            8.5,
            getFieldVal(`${sub.id}-a2`, sub.answerLine2BlankSolution),
            showValues
          );
          if (sub.answerLine2Suffix) {
            doc.text(sub.answerLine2Suffix, bx + 21, sy);
          }
          sy += 4.8;
        }

        return sy;
      };

      const subs = task.subtasks;
      if (showIllu && subs.length >= 3) {
        const end1a = renderSubPdf(subs[0], 113, curY + 1);
        const row2Y = Math.max(curY + 34, end1a + 3);
        const end1b = renderSubPdf(subs[1], 33, row2Y);
        const end1c = renderSubPdf(subs[2], 113, row2Y);
        curY = Math.max(end1b, end1c) + 4;
      } else {
        let maxSubY = curY;
        subs.forEach((sub, sIdx) => {
          const colX = sIdx % 2 === 0 ? 33 : 113;
          const rowStart = sIdx >= 2 ? maxSubY + 2 : curY + 1;
          const endY = renderSubPdf(sub, colX, rowStart);
          if (endY > maxSubY) maxSubY = endY;
        });
        curY = maxSubY + 4;
      }
      return;
    }

    // =========================================================================
    // EQUATION GRID TASK (e.g. Task 2 & Task 3)
    // =========================================================================
    if (task.type === 'equation-grid' && task.equationColumns && task.equationColumns.length > 0) {
      if (task.hasPartnerWork) {
        drawPartnerIconPdf(doc, 14, curY - 0.5);
      }
      drawTaskBadge(doc, task.taskNumber, 24.5, curY, variant);

      let gridStartY = curY + 4.5;
      if (task.title || task.instructions) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.8);
        doc.setTextColor(30, 41, 59);
        doc.text(
          `${task.title}${task.instructions ? ` ${task.instructions}` : ''}`.trim(),
          33,
          curY + 4.5
        );
        gridStartY = curY + 10.5;
      }

      const packColsX = [33, 89, 144];
      let maxRowCount = 0;

      task.equationColumns.slice(0, 3).forEach((col, colIdx) => {
        const px = packColsX[colIdx] ?? 33 + colIdx * 55;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.8);
        doc.setTextColor(30, 41, 59);
        doc.text(col.label, px, gridStartY);

        if (col.items.length > maxRowCount) {
          maxRowCount = col.items.length;
        }

        col.items.forEach((eq, rowIdx) => {
          const ey = gridStartY + rowIdx * 6.0;
          doc.text(eq.expressionLeft, px + 18, ey, { align: 'right' });
          drawBlankOrSolution(
            doc,
            px + 19.5,
            ey,
            8.5,
            getFieldVal(`${eq.id}-main`, eq.solutionMain),
            showValues
          );
          if (eq.hasRemainder) {
            doc.text('R', px + 29.5, ey);
            drawBlankOrSolution(
              doc,
              px + 33.2,
              ey,
              8.5,
              getFieldVal(`${eq.id}-rem`, eq.solutionRemainder),
              showValues
            );
          }
        });
      });

      curY = gridStartY + Math.max(1, maxRowCount) * 6.0 + 3.5;
      return;
    }

    // =========================================================================
    // CARDS & COLOR SACKS TASK (e.g. Task 4)
    // =========================================================================
    if (task.type === 'cards' && task.cards && task.cards.length > 0) {
      drawTaskBadge(doc, task.taskNumber, 24.5, curY, variant);

      if (task.hasCrayonIcon !== false) {
        doc.setDrawColor(100, 116, 139);
        doc.setLineWidth(0.35);
        doc.line(23.5, curY + 11.5, 29.5, curY + 8);
        doc.line(24.2, curY + 12.5, 30.2, curY + 9);
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.8);
      doc.setTextColor(30, 41, 59);
      if (task.title) {
        doc.text(task.title, 33, curY + 4.2);
      }
      if (task.instructions) {
        doc.text(task.instructions, 33, curY + 9.0);
      }

      const sacks = task.sacks ?? [
        { label: 'Rest', subLabel: '2', color: 'red' as const },
        { label: 'Rest', subLabel: '3', color: 'blue' as const },
        { label: 'Rest', subLabel: '4', color: 'green' as const },
      ];
      drawRemainderSackPdf(
        doc,
        137,
        curY - 1,
        sacks[0]?.label ?? 'Rest',
        sacks[0]?.subLabel ?? '2',
        [200, 75, 49]
      );
      drawRemainderSackPdf(
        doc,
        155,
        curY + 2,
        sacks[1]?.label ?? 'Rest',
        sacks[1]?.subLabel ?? '3',
        [91, 125, 177]
      );
      drawRemainderSackPdf(
        doc,
        173,
        curY - 0.5,
        sacks[2]?.label ?? 'Rest',
        sacks[2]?.subLabel ?? '4',
        [83, 141, 78]
      );

      const row1Cards = task.cards.filter((c, i) => (c.row ? c.row === 1 : i < 4));
      const row2Cards = task.cards.filter((c, i) => (c.row ? c.row === 2 : i >= 4));

      const drawCardPdf = (
        cardId: string,
        label: string,
        expectedColor: 'red' | 'blue' | 'green',
        cx: number,
        cy: number
      ) => {
        const color = getCardColor(cardId, expectedColor);
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
        doc.setFontSize(9.6);
        doc.setTextColor(15, 23, 42);
        doc.text(label, cx + 10, cy + 5.4, { align: 'center' });
      };

      row1Cards.forEach((c, idx) => {
        drawCardPdf(c.id, c.text, c.expectedColor, 33 + idx * 24.5, curY + 13.5);
      });

      row2Cards.forEach((c, idx) => {
        const extraY = idx >= 4 ? 1.2 : 0;
        drawCardPdf(c.id, c.text, c.expectedColor, 35 + idx * 24.5, curY + 24.5 + extraY);
      });

      curY += row2Cards.length > 0 ? 39 : 26;
      return;
    }

    // =========================================================================
    // RIDDLE TASK (e.g. Task 5)
    // =========================================================================
    if (task.type === 'riddle' && task.riddles && task.riddles.length > 0) {
      drawTaskBadge(doc, task.taskNumber, 24.5, curY, variant);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.8);
      doc.setTextColor(30, 41, 59);
      let ry = curY + 4.5;
      if (task.title) {
        doc.text(task.title, 33, ry);
        ry += 5.5;
      }

      task.riddles.forEach((riddle) => {
        doc.text(riddle.label, 33, ry);
        riddle.lines.forEach((line, lIdx) => {
          doc.text(line, 38, ry + lIdx * 4.5);
        });
        ry += Math.max(1, riddle.lines.length) * 4.5 + 0.5;

        doc.text(riddle.answerPrefix, 38, ry);
        let blankX = 38 + doc.getTextWidth(riddle.answerPrefix) + 2;
        riddle.solutions.forEach((sol, sIdx) => {
          drawBlankOrSolution(
            doc,
            blankX,
            ry,
            12,
            getFieldVal(`${riddle.id}-${sIdx}`, sol),
            showValues
          );
          blankX += 12.5;
          if (sIdx < riddle.solutions.length - 1) {
            doc.text(',', blankX, ry);
            blankX += 2.5;
          }
        });
        doc.text(riddle.answerSuffix ?? '.', blankX, ry);
        ry += 6.5;
      });

      curY = ry + 1.5;
      return;
    }

    // =========================================================================
    // FREE-TEXT / PARTNER TASK (e.g. Task 6)
    // =========================================================================
    drawTaskBadge(doc, task.taskNumber, 24.5, curY, variant);
    if (task.hasPartnerWork) {
      drawPartnerIconPdf(doc, 23.5, curY + 7.2);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    doc.setTextColor(30, 41, 59);
    if (task.title) {
      doc.text(task.title, 33, curY + 4.3);
    }
    if (task.instructions) {
      doc.text(task.instructions, 33, curY + 9.3);
    }

    if (options.includeTask6Lines) {
      doc.setDrawColor(180, 190, 205);
      doc.setLineWidth(0.25);
      doc.line(33, curY + 14.5, 192, curY + 14.5);
      doc.line(33, curY + 19.5, 192, curY + 19.5);
      curY += 23;
    } else {
      curY += 14;
    }
  });

  // =========================================================================
  // Self-Assessment Smileys on Left Margin
  // =========================================================================
  if (worksheet.hasSmileySelfAssessment) {
    const smX = 16.5;
    const smStartY = 225;
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.32);
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
  }

  // =========================================================================
  // FOOTER
  // =========================================================================
  const footerY = 283;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(24.5, footerY - 4.5, 195, footerY - 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(worksheet.pageNumber || '22', 14, footerY);

  if (worksheet.footerNote) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text(worksheet.footerNote, 24.5, footerY - 1);
  }

  if (worksheet.crossReference) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(worksheet.crossReference, 195, footerY, { align: 'right' });
  }

  return doc;
}

export function downloadWorksheetPdf(options: PdfGenerationOptions): string {
  const worksheet = options.document ?? DEFAULT_BOOK_PAGE_22;
  const doc = buildWorksheetPdfDocument(options);
  const safeTitle = (worksheet.title || 'Arbeitsblatt')
    .replace(/[^a-zA-Z0-9äöüÄÖÜß_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const pageSuffix = worksheet.pageNumber ? `_S${worksheet.pageNumber}` : '';
  const filename =
    options.mode === 'solution'
      ? `Loesungsblatt_${safeTitle}${pageSuffix}.pdf`
      : options.mode === 'custom'
      ? `Arbeitsblatt_${safeTitle}${pageSuffix}_Ausgefuellt.pdf`
      : `Arbeitsblatt_${safeTitle}${pageSuffix}.pdf`;
  doc.save(filename);
  return filename;
}

export function createWorksheetPdfBlobUrl(options: PdfGenerationOptions): string {
  const doc = buildWorksheetPdfDocument(options);
  const blob = doc.output('blob');
  return URL.createObjectURL(blob);
}
