import React from 'react';
import {
  RemainderBagColor,
  UniversalWorksheetDocument,
  UniversalStudentState,
  UniversalTaskItem,
  UniversalSubtask,
  DEFAULT_BOOK_PAGE_22,
} from '../types/worksheetModel';
import {
  useCleanedChildrenIllustration,
  ChildrenCardTableVector,
  PartnerWorkIcon,
  CrayonIcon,
  RemainderSacksInteractive,
  SelfAssessmentStrip,
} from './TextbookIllustrations';

export type WorksheetViewMode = 'clean' | 'interactive' | 'solution';

interface WorksheetPageProps {
  document?: UniversalWorksheetDocument;
  sourceImageUrl?: string;
  mode: WorksheetViewMode;
  studentState: UniversalStudentState;
  onChangeState: React.Dispatch<React.SetStateAction<UniversalStudentState>>;
  activeBrush: RemainderBagColor;
  onSelectBrush: (color: RemainderBagColor) => void;
  showCheckFeedback: boolean;
  includeSchoolHeader: boolean;
  includeTask6Lines: boolean;
  useOriginalCrop: boolean;
}

export const WorksheetPage: React.FC<WorksheetPageProps> = ({
  document = DEFAULT_BOOK_PAGE_22,
  sourceImageUrl = '/assets/aistudio/image_d72e70b6.png',
  mode,
  studentState,
  onChangeState,
  activeBrush,
  onSelectBrush,
  showCheckFeedback,
  includeSchoolHeader,
  includeTask6Lines,
  useOriginalCrop,
}) => {
  const cleanedIllustrationUrl = useCleanedChildrenIllustration(
    sourceImageUrl,
    document.illustrationBox
  );
  const isInteractive = mode === 'interactive';
  const isSolution = mode === 'solution';
  const themeColor = document.themeColor || '#D66840';

  // ===========================================================================
  // RENDER MODE A: GENERAL DOCUMENT / LETTER / MEDICAL REPORT (DIN A4 BRIEF)
  // ===========================================================================
  if (document.documentCategory === 'document') {
    const lm = document.letterMeta || {};
    const sections = document.documentSections || [];

    return (
      <article
        data-testid="a4-worksheet-page"
        aria-label={`Dokument ${document.title}`}
        className="a4-print-sheet relative bg-white text-slate-900 w-full max-w-[794px] aspect-[210/297] mx-auto shadow-xl border border-slate-200/90 px-10 sm:px-14 pt-10 pb-10 flex flex-col justify-between print:shadow-none print:border-none"
      >
        <div className="space-y-4 text-[12px] sm:text-[12.5px] leading-[1.48] text-slate-900 font-sans">
          {/* Top Reference Line (e.g., "Tasdemir, Adem") */}
          {lm.topReferenceLine && (
            <div className="text-[11px] text-slate-700 font-medium pb-3">
              {lm.topReferenceLine}
            </div>
          )}

          {/* Sender Line (left) and Date (right) */}
          {(lm.senderLine || lm.dateLine) && (
            <div className="flex items-baseline justify-between gap-4 text-[10.5px] text-slate-700 border-b border-slate-200 pb-1.5">
              <span className="font-medium">{lm.senderLine}</span>
              <span className="tabular-nums font-medium">{lm.dateLine}</span>
            </div>
          )}

          {/* Recipient Address Block */}
          {lm.recipientLines && lm.recipientLines.length > 0 && (
            <div className="pt-1 pb-2 space-y-0.5 text-[12.5px] text-slate-900">
              {lm.recipientLines.map((line, idx) => (
                <p key={idx} className={idx === 1 ? 'font-semibold' : ''}>
                  {line}
                </p>
              ))}
            </div>
          )}

          {/* Notice / CC Line */}
          {lm.noticeLine && (
            <p className="pt-2 text-[12px] text-slate-800 font-medium">{lm.noticeLine}</p>
          )}

          {/* Salutation & Intro */}
          {(lm.salutation || (lm.introLines && lm.introLines.length > 0)) && (
            <div className="pt-1 space-y-1.5">
              {lm.salutation && (
                <p data-testid="worksheet-banner-title" className="font-medium text-slate-900">
                  {lm.salutation}
                </p>
              )}
              {lm.introLines?.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}

          {!lm.salutation && (
            <h2 data-testid="worksheet-banner-title" className="text-base font-bold text-slate-900">
              {document.title}
            </h2>
          )}

          {/* Document Body Sections */}
          <div className="space-y-3 pt-1">
            {sections.map((sec) => {
              if (isInteractive) {
                const currentVal =
                  studentState.freeText[sec.id] ??
                  [...(sec.paragraphs || []), ...(sec.listItems || [])].join('\n');
                return (
                  <div key={sec.id} className="space-y-1">
                    {(sec.heading || sec.inlineLeadBold) && (
                      <p className="font-bold text-slate-900">
                        {sec.heading || sec.inlineLeadBold}
                      </p>
                    )}
                    <textarea
                      rows={Math.max(2, currentVal.split('\n').length)}
                      value={currentVal}
                      onChange={(e) =>
                        onChangeState((prev) => ({
                          ...prev,
                          freeText: {
                            ...prev.freeText,
                            [sec.id]: e.target.value,
                          },
                        }))
                      }
                      aria-label={sec.heading || sec.inlineLeadBold || sec.id}
                      className="w-full rounded border border-amber-300 bg-amber-50/40 p-2 text-[12px] leading-relaxed text-slate-900 outline-none focus:border-orange-600"
                    />
                  </div>
                );
              }

              return (
                <div key={sec.id} className="space-y-1">
                  {sec.heading && <p className="font-bold text-slate-900">{sec.heading}</p>}

                  {sec.inlineLeadBold && sec.paragraphs.length > 0 ? (
                    <p>
                      <strong className="font-bold text-slate-900">{sec.inlineLeadBold}</strong>{' '}
                      {sec.paragraphs[0]}
                    </p>
                  ) : null}

                  {(sec.inlineLeadBold ? sec.paragraphs.slice(1) : sec.paragraphs).map(
                    (pText, pIdx) => (
                      <p key={pIdx}>{pText}</p>
                    )
                  )}

                  {sec.listItems && sec.listItems.length > 0 && (
                    <div className="space-y-0.5 pt-0.5">
                      {sec.listItems.map((item, lIdx) => (
                        <p key={lIdx}>{item}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Closing & Cleaned Signature Block */}
          {(lm.closingPhrase || lm.signerName) && (
            <div className="pt-4 space-y-1">
              {lm.closingPhrase && <p>{lm.closingPhrase}</p>}

              {/* Signature space: clean blank space in 'clean' mode; annotated in 'solution' mode */}
              <div className="h-11 flex items-center">
                {isSolution && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-800">
                    ✓ {lm.removedHandwritingNote || 'Handschriftliche Unterschrift hier bereinigt'}
                  </span>
                )}
              </div>

              {lm.signerName && <p className="font-medium text-slate-900">{lm.signerName}</p>}
            </div>
          )}
        </div>

        {/* Clean Document Footer */}
        <footer className="pt-3 mt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <span>{document.footerNote || lm.senderLine || document.title}</span>
          <span>
            {document.crossReference || (lm.dateLine ? `Stand: ${lm.dateLine}` : 'DIN A4 Rekonstruktion')}
          </span>
        </footer>
      </article>
    );
  }

  // ===========================================================================
  // RENDER MODE B: TEXTBOOK WORKSHEET (SCHULBUCHSEITE / ARBEITSBLATT)
  // ===========================================================================
  const setFieldValue = (fieldKey: string, val: string) => {
    onChangeState((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [fieldKey]: val,
      },
    }));
  };

  const renderBlankField = (
    fieldKey: string,
    expectedValue: string | undefined,
    ariaLabel: string,
    widthClass = 'w-8 sm:w-9',
    allowText = false
  ) => {
    const value = studentState.fields[fieldKey] ?? '';
    const expectedStr = expectedValue !== undefined ? String(expectedValue) : '';

    if (mode === 'clean') {
      return (
        <span
          className={`inline-block border-b-[1.5px] border-slate-700 ${widthClass} h-4 align-baseline mx-0.5`}
          aria-label={ariaLabel}
        />
      );
    }

    if (isSolution) {
      return (
        <span
          className={`inline-flex items-center justify-center border-b-[1.5px] border-slate-700 ${widthClass} px-0.5 font-bold text-blue-700 tabular-nums mx-0.5 leading-none`}
          aria-label={`${ariaLabel}: Lösung ${expectedStr}`}
        >
          {expectedStr}
        </span>
      );
    }

    const trimmed = value.trim();
    const isFilled = trimmed !== '';
    const isCorrect =
      isFilled &&
      (trimmed.toLowerCase() === expectedStr.trim().toLowerCase() ||
        (!isNaN(Number(trimmed)) &&
          expectedStr.trim() !== '' &&
          !isNaN(Number(expectedStr)) &&
          Number(trimmed) === Number(expectedStr)));

    let feedbackStyle = 'border-slate-700 bg-amber-50/50 focus:bg-orange-50/90 focus:border-orange-600';
    if (showCheckFeedback && isFilled) {
      feedbackStyle = isCorrect
        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
        : 'border-rose-600 bg-rose-50 text-rose-900 font-bold';
    }

    return (
      <input
        type="text"
        inputMode={allowText ? 'text' : 'numeric'}
        maxLength={allowText ? 12 : 4}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) =>
          setFieldValue(
            fieldKey,
            allowText ? e.target.value : e.target.value.replace(/[^0-9.,-]/g, '')
          )
        }
        className={`inline-block ${widthClass} h-5 text-center border-b-[1.8px] rounded-t-sm text-[13.5px] font-semibold tabular-nums outline-none transition-colors mx-0.5 ${feedbackStyle}`}
      />
    );
  };

  const renderBadge = (task: UniversalTaskItem) => {
    const isLight = task.badgeVariant === 'light';
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 font-display font-bold text-[13px] shrink-0 ${
          isLight ? 'bg-[#F6B48E] text-[#7c2d12]' : 'bg-[#DB6D47] text-white'
        }`}
      >
        {task.taskNumber}
      </span>
    );
  };

  const renderSubtaskBlock = (sub: UniversalSubtask, extraClass = '') => {
    return (
      <div
        key={sub.id}
        className={`text-[12.5px] sm:text-[13px] leading-[1.42] text-slate-800 ${extraClass}`}
      >
        <div className="flex items-start gap-1.5">
          <span className="w-4 shrink-0">{sub.label}</span>
          <div>
            {sub.storyLines.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
            {sub.question && (
              <p className="mt-0.5">
                {sub.question.startsWith('F:') ? (
                  <>
                    <span className="inline-block w-4">F:</span>
                    {sub.question.replace(/^F:\s*/, '')}
                  </>
                ) : (
                  sub.question
                )}
              </p>
            )}
            {sub.equationPrefix && (
              <p className="mt-0.5 tabular-nums">
                {sub.equationPrefix.startsWith('L:') ? (
                  <>
                    <span className="inline-block w-4">L:</span>
                    {sub.equationPrefix.replace(/^L:\s*/, '')}{' '}
                  </>
                ) : (
                  <>{sub.equationPrefix} </>
                )}
                {renderBlankField(
                  `${sub.id}-q`,
                  sub.solutionQuotient,
                  `Aufgabe ${sub.id} Ergebnis`
                )}
                {sub.solutionRemainder !== undefined && sub.solutionRemainder !== '' && (
                  <>
                    {' '}
                    R{' '}
                    {renderBlankField(
                      `${sub.id}-r`,
                      sub.solutionRemainder,
                      `Aufgabe ${sub.id} Rest`
                    )}
                  </>
                )}
              </p>
            )}
            {(sub.answerLine1Suffix || sub.answerLine1BlankSolution !== undefined) && (
              <p className="mt-0.5">
                <span className="inline-block w-4">{sub.answerLine1Prefix || 'A:'}</span>
                {sub.answerLine1BlankSolution !== undefined && (
                  <>
                    {renderBlankField(
                      `${sub.id}-a1`,
                      sub.answerLine1BlankSolution,
                      `Aufgabe ${sub.id} Antwort 1`
                    )}{' '}
                  </>
                )}
                {sub.answerLine1Suffix}
              </p>
            )}
            {(sub.answerLine2Suffix || sub.answerLine2BlankSolution !== undefined) && (
              <p className="pl-4">
                {sub.answerLine2BlankSolution !== undefined && (
                  <>
                    {renderBlankField(
                      `${sub.id}-a2`,
                      sub.answerLine2BlankSolution,
                      `Aufgabe ${sub.id} Antwort 2`
                    )}{' '}
                  </>
                )}
                {sub.answerLine2Suffix}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTask = (task: UniversalTaskItem, idx: number, totalTasks: number) => {
    const isLastTask = idx === totalTasks - 1;
    const isSecondLastTask = idx === totalTasks - 2;
    const showSmileyNextToTask =
      document.hasSmileySelfAssessment &&
      ((totalTasks >= 2 && isSecondLastTask) || (totalTasks === 1 && isLastTask));

    const taskContent = (() => {
      // 1. WORD PROBLEM TASK (with or without illustration)
      if (task.type === 'word-problem' || (task.subtasks && task.subtasks.length > 0)) {
        const subs = task.subtasks ?? [];
        const showIllu = Boolean(task.hasIllustration || (idx === 0 && document.illustrationBox));

        if (showIllu && subs.length >= 1) {
          return (
            <section key={task.id} aria-label={`Aufgabe ${task.taskNumber}`} className="pl-4 sm:pl-6">
              {task.title && (
                <div className="flex items-center gap-2 mb-1.5">
                  {task.hasPartnerWork && <PartnerWorkIcon className="w-6 h-5" />}
                  {renderBadge(task)}
                  <p className="text-[12.5px] sm:text-[13.5px] text-slate-800 font-medium">
                    {task.title}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-12 gap-x-4 gap-y-2.5 items-start">
                <div className="col-span-12 sm:col-span-6 flex items-start gap-2.5">
                  {!task.title && renderBadge(task)}
                  <div className="flex-1 flex items-center justify-center bg-white rounded overflow-hidden max-w-[270px]">
                    {useOriginalCrop && cleanedIllustrationUrl ? (
                      <img
                        src={cleanedIllustrationUrl}
                        alt={
                          document.illustrationBox?.description ||
                          'Freigestellte Illustration aus der Buchseite'
                        }
                        className="w-full h-auto object-contain max-h-[124px]"
                      />
                    ) : (
                      <ChildrenCardTableVector className="max-h-[124px]" />
                    )}
                  </div>
                </div>

                {/* First subtask top-right */}
                <div className="col-span-12 sm:col-span-6">
                  {renderSubtaskBlock(subs[0])}
                </div>

                {/* Remaining subtasks */}
                {subs.slice(1).map((sub, sIdx) => (
                  <div
                    key={sub.id}
                    className={`col-span-12 sm:col-span-6 ${sIdx % 2 === 0 ? 'pl-5' : ''}`}
                  >
                    {renderSubtaskBlock(sub)}
                  </div>
                ))}
              </div>
            </section>
          );
        }

        return (
          <section key={task.id} aria-label={`Aufgabe ${task.taskNumber}`} className="pt-1 pl-4 sm:pl-6">
            <div className="flex items-start gap-2.5">
              {task.hasPartnerWork && <PartnerWorkIcon className="w-6 h-5" />}
              {renderBadge(task)}
              <div className="flex-1 space-y-2">
                {task.title && (
                  <p className="text-[12.5px] sm:text-[13.5px] text-slate-800">{task.title}</p>
                )}
                {task.instructions && (
                  <p className="text-[12px] text-slate-600">{task.instructions}</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {subs.map((sub) => renderSubtaskBlock(sub))}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // 2. EQUATION GRID TASK (e.g. Task 2 & Task 3)
      if (task.type === 'equation-grid' && task.equationColumns && task.equationColumns.length > 0) {
        const cols = task.equationColumns;
        const hasHeaderText = Boolean(task.title || task.instructions);

        return (
          <section
            key={task.id}
            aria-label={`Aufgabe ${task.taskNumber}`}
            className={hasHeaderText ? 'pt-1' : 'pt-1.5 pl-6 sm:pl-8'}
          >
            {hasHeaderText ? (
              <>
                <div className="flex items-center gap-2">
                  {task.hasPartnerWork ? (
                    <PartnerWorkIcon className="w-6 h-5" />
                  ) : (
                    <span className="w-6 shrink-0" />
                  )}
                  {renderBadge(task)}
                  <p className="text-[12.5px] sm:text-[13.5px] text-slate-800">
                    {task.title}
                    {task.instructions ? ` ${task.instructions}` : ''}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-12 sm:pl-14 pt-1.5 text-[12.5px] sm:text-[13.5px] text-slate-800">
                  {cols.map((col, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-1.5">
                      <span className="w-4 shrink-0">{col.label}</span>
                      <div className="space-y-1.5 tabular-nums">
                        {col.items.map((eq) => (
                          <div key={eq.id} className="flex items-baseline whitespace-nowrap">
                            <span className="mr-1">{eq.expressionLeft}</span>
                            {renderBlankField(
                              `${eq.id}-main`,
                              eq.solutionMain,
                              `Aufgabe ${eq.id} Ergebnis`,
                              'w-7 sm:w-8'
                            )}
                            {eq.hasRemainder && (
                              <>
                                <span className="mx-1">R</span>
                                {renderBlankField(
                                  `${eq.id}-rem`,
                                  eq.solutionRemainder,
                                  `Aufgabe ${eq.id} Rest`,
                                  'w-7 sm:w-8'
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-start gap-2.5">
                {renderBadge(task)}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12.5px] sm:text-[13.5px] text-slate-800">
                  {cols.map((col, cIdx) => (
                    <div key={cIdx} className="flex items-start gap-1.5">
                      <span className="w-4 shrink-0">{col.label}</span>
                      <div className="space-y-1.5 tabular-nums">
                        {col.items.map((eq) => (
                          <div key={eq.id} className="flex items-baseline whitespace-nowrap">
                            <span className="mr-1">{eq.expressionLeft}</span>
                            {renderBlankField(
                              `${eq.id}-main`,
                              eq.solutionMain,
                              `Aufgabe ${eq.id} Ergebnis`,
                              'w-7 sm:w-8'
                            )}
                            {eq.hasRemainder && (
                              <>
                                <span className="mx-1">R</span>
                                {renderBlankField(
                                  `${eq.id}-rem`,
                                  eq.solutionRemainder,
                                  `Aufgabe ${eq.id} Rest`,
                                  'w-7 sm:w-8'
                                )}
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      }

      // 3. CARDS & COLOR SACKS TASK (e.g. Task 4)
      if (task.type === 'cards' && task.cards && task.cards.length > 0) {
        const row1Cards = task.cards.filter((c, i) => (c.row ? c.row === 1 : i < 4));
        const row2Cards = task.cards.filter((c, i) => (c.row ? c.row === 2 : i >= 4));

        const renderCardButton = (
          card: NonNullable<UniversalTaskItem['cards']>[number],
          extraTranslateY = '0px'
        ) => {
          const chosenColor: RemainderBagColor = isSolution
            ? card.expectedColor
            : mode === 'clean'
            ? null
            : studentState.cardColors[card.id] ?? null;

          const colorClasses =
            chosenColor === 'red'
              ? 'bg-red-200/90 border-red-800 text-red-950 font-semibold'
              : chosenColor === 'blue'
              ? 'bg-blue-200/90 border-blue-800 text-blue-950 font-semibold'
              : chosenColor === 'green'
              ? 'bg-emerald-200/90 border-emerald-800 text-emerald-950 font-semibold'
              : 'bg-white border-slate-500 text-slate-900';

          const isWrong =
            isInteractive &&
            showCheckFeedback &&
            chosenColor !== null &&
            chosenColor !== card.expectedColor;

          return (
            <button
              key={card.id}
              type="button"
              disabled={!isInteractive}
              onClick={() => {
                if (!isInteractive) return;
                onChangeState((prev) => {
                  const current = prev.cardColors[card.id] ?? null;
                  let nextColor: RemainderBagColor = activeBrush;
                  if (!activeBrush) {
                    nextColor =
                      current === null
                        ? 'red'
                        : current === 'red'
                        ? 'blue'
                        : current === 'blue'
                        ? 'green'
                        : null;
                  } else if (current === activeBrush) {
                    nextColor = null;
                  }
                  return {
                    ...prev,
                    cardColors: {
                      ...prev.cardColors,
                      [card.id]: nextColor,
                    },
                  };
                });
              }}
              style={{
                transform: `rotate(${card.tiltDeg ?? -0.8}deg) translateY(${extraTranslateY})`,
              }}
              aria-label={`Aufgabenkärtchen ${card.text}`}
              className={`px-3.5 py-1 border text-[13px] tabular-nums shadow-[1px_1px_0px_rgba(0,0,0,0.08)] transition-all ${colorClasses} ${
                isInteractive
                  ? 'cursor-pointer hover:scale-105 focus-visible:outline-2 focus-visible:outline-orange-600'
                  : 'cursor-default'
              } ${isWrong ? 'ring-2 ring-rose-600' : ''}`}
            >
              {card.text}
            </button>
          );
        };

        return (
          <section key={task.id} aria-label={`Aufgabe ${task.taskNumber}`} className="pt-1.5 pl-6 sm:pl-8">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1">
                <div className="flex flex-col items-center gap-1.5 shrink-0">
                  {renderBadge(task)}
                  {task.hasCrayonIcon !== false && <CrayonIcon />}
                </div>

                <div className="flex-1">
                  <p className="text-[12.5px] sm:text-[13.5px] text-slate-800 leading-snug">
                    {task.title}
                    {task.instructions && (
                      <>
                        <br />
                        {task.instructions}
                      </>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                    {row1Cards.map((card) => renderCardButton(card))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 pr-1">
                <RemainderSacksInteractive
                  activeBrush={activeBrush}
                  onSelectBrush={onSelectBrush}
                  interactive={isInteractive}
                  customSacks={task.sacks}
                />
              </div>
            </div>

            {row2Cards.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 pl-9 mt-2.5">
                {row2Cards.map((card, i) => renderCardButton(card, i >= 4 ? '3px' : '0px'))}
              </div>
            )}
          </section>
        );
      }

      // 4. RIDDLE TASK (e.g. Task 5)
      if (task.type === 'riddle' && task.riddles && task.riddles.length > 0) {
        return (
          <div key={task.id} className="flex items-start gap-2.5">
            {renderBadge(task)}
            <div className="text-[12.5px] sm:text-[13.5px] text-slate-800 leading-[1.42] space-y-1.5">
              {task.title && <p className="font-medium">{task.title}</p>}
              {task.riddles.map((riddle) => (
                <div key={riddle.id} className="flex items-start gap-1.5 pt-0.5">
                  <span className="w-4 shrink-0">{riddle.label}</span>
                  <div>
                    {riddle.lines.map((line, lIdx) => (
                      <p key={lIdx}>{line}</p>
                    ))}
                    <p>
                      {riddle.answerPrefix}{' '}
                      {riddle.solutions.map((sol, sIdx) => (
                        <React.Fragment key={sIdx}>
                          {sIdx > 0 && ', '}
                          {renderBlankField(
                            `${riddle.id}-${sIdx}`,
                            sol,
                            `Aufgabe ${riddle.id} Lösung ${sIdx + 1}`,
                            riddle.solutions.length > 1 ? 'w-10 sm:w-11' : 'w-11 sm:w-12',
                            true
                          )}
                        </React.Fragment>
                      ))}
                      {riddle.answerSuffix ?? '.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // 5. FREE-TEXT / PARTNER TASK (e.g. Task 6)
      return (
        <div key={task.id} className="flex items-start gap-2.5 pt-1">
          <div className="flex flex-col items-center gap-1 shrink-0">
            {renderBadge(task)}
            {task.hasPartnerWork && <PartnerWorkIcon className="w-6 h-5" />}
          </div>

          <div className="flex-1 text-[12.5px] sm:text-[13.5px] text-slate-800 leading-[1.42]">
            {task.title && <p>{task.title}</p>}
            {task.instructions && <p>{task.instructions}</p>}

            {includeTask6Lines && (
              <div className="mt-2 space-y-2.5">
                {isInteractive ? (
                  <input
                    type="text"
                    value={studentState.freeText[task.id] ?? ''}
                    onChange={(e) =>
                      onChangeState((prev) => ({
                        ...prev,
                        freeText: {
                          ...prev.freeText,
                          [task.id]: e.target.value,
                        },
                      }))
                    }
                    placeholder="Eigene Antwort / Zahlenrätsel hier notieren..."
                    aria-label={`Aufgabe ${task.taskNumber} Freitext`}
                    className="w-full border-b border-slate-400 bg-amber-50/40 px-1.5 py-0.5 text-xs text-slate-800 outline-none focus:border-orange-600"
                  />
                ) : isSolution ? (
                  <p className="text-xs text-blue-700 font-medium border-b border-slate-300 pb-0.5">
                    Individuelle Schülerlösung (z. B.: Meine Zahl gehört zur Siebener-Reihe. Durch 5 geteilt bleibt Rest 3 → 28)
                  </p>
                ) : (
                  <>
                    <div className="border-b border-slate-300 h-3.5 w-full" />
                    <div className="border-b border-slate-300 h-3.5 w-full" />
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    })();

    if (showSmileyNextToTask && idx === totalTasks - 2) {
      const nextTask = document.tasks[idx + 1];
      return (
        <section
          key={`${task.id}-with-smiley`}
          aria-label={`Aufgabe ${task.taskNumber} und ${nextTask.taskNumber}`}
          className="pt-1.5"
        >
          <div className="flex items-end gap-2">
            <div className="w-6 shrink-0 pb-0.5">
              <SelfAssessmentStrip
                selectedSmiley={studentState.selectedSmiley}
                onSelectSmiley={(sIdx) =>
                  onChangeState((prev) => ({
                    ...prev,
                    selectedSmiley: prev.selectedSmiley === sIdx ? null : sIdx,
                  }))
                }
                interactive={isInteractive}
              />
            </div>
            <div className="flex-1 space-y-2.5">
              {taskContent}
              {renderTask(nextTask, idx + 1, totalTasks)}
            </div>
          </div>
        </section>
      );
    }

    return taskContent;
  };

  return (
    <article
      data-testid="a4-worksheet-page"
      aria-label={`Arbeitsblatt ${document.title} ${document.pageNumber ? `Seite ${document.pageNumber}` : ''}`}
      className="a4-print-sheet relative bg-white text-slate-900 w-full max-w-[794px] aspect-[210/297] mx-auto shadow-xl border border-slate-200/90 px-6 sm:px-10 pt-4 pb-6 flex flex-col justify-between select-none print:shadow-none print:border-none"
    >
      {/* Top Section Wrapper */}
      <div className="space-y-3 sm:space-y-3.5">
        {includeSchoolHeader && (
          <div className="flex items-center justify-between gap-4 text-[11.5px] text-slate-600 border-b border-slate-200 pb-1.5 pt-0.5">
            <div className="flex items-end gap-1.5 flex-1">
              <span className="font-medium text-slate-700">Name:</span>
              <span className="border-b border-slate-400 flex-1 h-3.5" />
            </div>
            <div className="flex items-end gap-1.5 w-28">
              <span className="font-medium text-slate-700">Klasse:</span>
              <span className="border-b border-slate-400 flex-1 h-3.5" />
            </div>
            <div className="flex items-end gap-1.5 w-36">
              <span className="font-medium text-slate-700">Datum:</span>
              <span className="border-b border-slate-400 flex-1 h-3.5" />
            </div>
          </div>
        )}

        {/* Textbook Grid Banner */}
        <div className="relative mb-3">
          <div
            className="relative h-11 sm:h-12 w-full flex items-center pl-12 sm:pl-14 pr-6 overflow-hidden"
            style={{
              backgroundColor: themeColor,
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <h2
              data-testid="worksheet-banner-title"
              className="text-white font-display font-bold text-lg sm:text-[20px] tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]"
            >
              {document.title}
            </h2>
          </div>
          <div className="flex flex-col ml-4">
            <div
              className="w-12 h-2.5"
              style={{
                backgroundColor: themeColor,
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
            <div className="w-4 h-2.5 ml-4" style={{ backgroundColor: themeColor }} />
          </div>
        </div>

        {/* Dynamic Tasks Rendering */}
        {document.tasks.map((task, idx) => {
          if (
            document.hasSmileySelfAssessment &&
            document.tasks.length >= 2 &&
            idx === document.tasks.length - 1
          ) {
            return null;
          }
          return renderTask(task, idx, document.tasks.length);
        })}
      </div>

      {/* FOOTER */}
      <footer className="pt-2 mt-2">
        <div className="border-t border-slate-400 ml-6 mb-1.5" />
        <div className="flex items-baseline justify-between text-slate-700">
          <div className="flex items-baseline gap-3">
            <span className="font-display font-bold text-[15px] text-slate-900">
              {document.pageNumber || '22'}
            </span>
            {document.footerNote && (
              <span className="text-[9.5px] text-slate-600">{document.footerNote}</span>
            )}
          </div>
          {document.crossReference && (
            <span className="text-[11px] font-medium text-slate-800">
              {document.crossReference}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
};
