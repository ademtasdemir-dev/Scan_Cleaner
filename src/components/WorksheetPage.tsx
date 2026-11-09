import React from 'react';
import {
  TASK_1_SUBTASKS,
  TASK_2_PACKS,
  TASK_3_PACKS,
  TASK_4_CARDS,
  RemainderBagColor,
  StudentWorksheetState,
  isValidTask5aAnswer,
  validateTask5bAnswers,
} from '../data/worksheetData';
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
  mode: WorksheetViewMode;
  studentState: StudentWorksheetState;
  onChangeState: React.Dispatch<React.SetStateAction<StudentWorksheetState>>;
  activeBrush: RemainderBagColor;
  onSelectBrush: (color: RemainderBagColor) => void;
  showCheckFeedback: boolean;
  includeSchoolHeader: boolean;
  includeTask6Lines: boolean;
  useOriginalCrop: boolean;
}

export const WorksheetPage: React.FC<WorksheetPageProps> = ({
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
  const cleanedChildrenUrl = useCleanedChildrenIllustration();
  const isInteractive = mode === 'interactive';
  const isSolution = mode === 'solution';

  const renderBlankField = (
    value: string,
    expectedValue: number | string,
    onChange: (nextVal: string) => void,
    ariaLabel: string,
    widthClass = 'w-8 sm:w-9',
    customValid?: boolean
  ) => {
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
          aria-label={`${ariaLabel}: Lösung ${expectedValue}`}
        >
          {expectedValue}
        </span>
      );
    }

    // Interactive input mode
    const trimmed = value.trim();
    const isFilled = trimmed !== '';
    const isCorrect =
      customValid !== undefined ? customValid : isFilled && Number(trimmed) === Number(expectedValue);

    let feedbackStyle = 'border-slate-700 bg-amber-50/50 focus:bg-orange-50/90 focus:border-orange-600';
    if (showCheckFeedback && isFilled) {
      feedbackStyle = isCorrect
        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
        : 'border-rose-600 bg-rose-50 text-rose-900 font-bold';
    }

    return (
      <input
        type="text"
        inputMode="numeric"
        maxLength={3}
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        className={`inline-block ${widthClass} h-5 text-center border-b-[1.8px] rounded-t-sm text-[13.5px] font-semibold tabular-nums outline-none transition-colors mx-0.5 ${feedbackStyle}`}
      />
    );
  };

  const task5bValidation = validateTask5bAnswers(studentState.task5b);

  return (
    <article
      data-testid="a4-worksheet-page"
      aria-label="Arbeitsblatt Dividieren mit Rest Seite 22"
      className="a4-print-sheet relative bg-white text-slate-900 w-full max-w-[794px] aspect-[210/297] mx-auto shadow-xl border border-slate-200/90 px-6 sm:px-10 pt-4 pb-6 flex flex-col justify-between select-none print:shadow-none print:border-none"
    >
      {/* Top Section Wrapper */}
      <div className="space-y-3 sm:space-y-3.5">
        {/* Optional Classroom Name / Date / Class Header */}
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

        {/* Orange Textbook Grid Banner */}
        <div className="relative mb-3">
          <div
            className="relative h-11 sm:h-12 w-full bg-[#D66840] flex items-center pl-12 sm:pl-14 pr-6 overflow-hidden"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          >
            <h2 className="text-white font-display font-bold text-lg sm:text-[20px] tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]">
              Dividieren mit Rest
            </h2>
          </div>
          {/* Stepped orange pixel extension at bottom-left of banner */}
          <div className="flex flex-col ml-4">
            <div
              className="w-12 h-2.5 bg-[#D66840]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />
            <div className="w-4 h-2.5 bg-[#D66840] ml-4" />
          </div>
        </div>

        {/* ===================================================================
            AUFGABE 1: 32 Karten gerecht verteilen (Illustration + a, b, c)
           =================================================================== */}
        <section aria-label="Aufgabe 1" className="pl-4 sm:pl-6">
          <div className="grid grid-cols-12 gap-x-4 gap-y-2.5 items-start">
            {/* Top-Left: Badge 1 + Children playing cards illustration */}
            <div className="col-span-12 sm:col-span-6 flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-[#F6B48E] text-[#7c2d12] font-display font-bold text-[13px] shrink-0 mt-0.5">
                1
              </span>
              <div className="flex-1 flex items-center justify-center bg-white rounded overflow-hidden max-w-[270px]">
                {useOriginalCrop && cleanedChildrenUrl ? (
                  <img
                    src={cleanedChildrenUrl}
                    alt="Fünf Kinder sitzen an einem runden Tisch und spielen Karten"
                    className="w-full h-auto object-contain max-h-[124px]"
                  />
                ) : (
                  <ChildrenCardTableVector className="max-h-[124px]" />
                )}
              </div>
            </div>

            {/* Top-Right: 1a */}
            {(() => {
              const sub = TASK_1_SUBTASKS[0]; // 1a
              const st = studentState.task1['1a'];
              return (
                <div className="col-span-12 sm:col-span-6 text-[12.5px] sm:text-[13px] leading-[1.42] text-slate-800">
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 shrink-0">a)</span>
                    <div>
                      <p>32 Karten sollen gerecht</p>
                      <p>an fünf Kinder verteilt werden.</p>
                      <p className="mt-0.5">
                        <span className="inline-block w-4">F:</span>
                        Wie viele Karten erhält jedes Kind?
                      </p>
                      <p className="mt-0.5 tabular-nums">
                        <span className="inline-block w-4">L:</span>
                        32 : 5 ={' '}
                        {renderBlankField(
                          st.quotient,
                          sub.quotient,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: { ...prev.task1, '1a': { ...prev.task1['1a'], quotient: val } },
                            })),
                          'Aufgabe 1a Quotient'
                        )}{' '}
                        R{' '}
                        {renderBlankField(
                          st.remainder,
                          sub.remainder,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1a': { ...prev.task1['1a'], remainder: val },
                              },
                            })),
                          'Aufgabe 1a Rest'
                        )}
                      </p>
                      <p className="mt-0.5">
                        <span className="inline-block w-4">A:</span>
                        {renderBlankField(
                          st.cardsPerChild,
                          sub.quotient,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1a': { ...prev.task1['1a'], cardsPerChild: val },
                              },
                            })),
                          'Aufgabe 1a Karten pro Kind'
                        )}{' '}
                        Karten erhält jedes Kind.
                      </p>
                      <p className="pl-4">
                        {renderBlankField(
                          st.cardsLeftover,
                          sub.remainder,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1a': { ...prev.task1['1a'], cardsLeftover: val },
                              },
                            })),
                          'Aufgabe 1a übrige Karten'
                        )}{' '}
                        Karten bleiben übrig.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom-Left: 1b */}
            {(() => {
              const sub = TASK_1_SUBTASKS[1]; // 1b
              const st = studentState.task1['1b'];
              return (
                <div className="col-span-12 sm:col-span-6 pl-5 text-[12.5px] sm:text-[13px] leading-[1.42] text-slate-800">
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 shrink-0">b)</span>
                    <div>
                      <p>32 Karten sollen gerecht</p>
                      <p>an sechs Kinder verteilt werden.</p>
                      <div className="flex items-start mt-0.5">
                        <span className="inline-block w-4 shrink-0">F:</span>
                        <div>
                          <p>Wie viele Karten erhält</p>
                          <p>jedes Kind?</p>
                        </div>
                      </div>
                      <p className="mt-0.5 tabular-nums">
                        <span className="inline-block w-4">L:</span>
                        32 : 6 ={' '}
                        {renderBlankField(
                          st.quotient,
                          sub.quotient,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: { ...prev.task1, '1b': { ...prev.task1['1b'], quotient: val } },
                            })),
                          'Aufgabe 1b Quotient'
                        )}{' '}
                        R{' '}
                        {renderBlankField(
                          st.remainder,
                          sub.remainder,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1b': { ...prev.task1['1b'], remainder: val },
                              },
                            })),
                          'Aufgabe 1b Rest'
                        )}
                      </p>
                      <p className="mt-0.5">
                        <span className="inline-block w-4">A:</span>
                        {renderBlankField(
                          st.cardsPerChild,
                          sub.quotient,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1b': { ...prev.task1['1b'], cardsPerChild: val },
                              },
                            })),
                          'Aufgabe 1b Karten pro Kind'
                        )}{' '}
                        Karten erhält jedes Kind.
                      </p>
                      <p className="pl-4">
                        {renderBlankField(
                          st.cardsLeftover,
                          sub.remainder,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1b': { ...prev.task1['1b'], cardsLeftover: val },
                              },
                            })),
                          'Aufgabe 1b übrige Karten'
                        )}{' '}
                        Karten bleiben übrig.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Bottom-Right: 1c */}
            {(() => {
              const sub = TASK_1_SUBTASKS[2]; // 1c
              const st = studentState.task1['1c'];
              return (
                <div className="col-span-12 sm:col-span-6 text-[12.5px] sm:text-[13px] leading-[1.42] text-slate-800">
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 shrink-0">c)</span>
                    <div>
                      <p>32 Karten sollen gerecht</p>
                      <p>an sieben Kinder verteilt werden.</p>
                      <p className="mt-0.5">
                        <span className="inline-block w-4">F:</span>
                        Wie viele Karten erhält jedes Kind?
                      </p>
                      <p className="mt-0.5 tabular-nums">
                        <span className="inline-block w-4">L:</span>
                        32 : 7 ={' '}
                        {renderBlankField(
                          st.quotient,
                          sub.quotient,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: { ...prev.task1, '1c': { ...prev.task1['1c'], quotient: val } },
                            })),
                          'Aufgabe 1c Quotient'
                        )}{' '}
                        R{' '}
                        {renderBlankField(
                          st.remainder,
                          sub.remainder,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1c': { ...prev.task1['1c'], remainder: val },
                              },
                            })),
                          'Aufgabe 1c Rest'
                        )}
                      </p>
                      <p className="mt-0.5">
                        <span className="inline-block w-4">A:</span>
                        {renderBlankField(
                          st.cardsPerChild,
                          sub.quotient,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1c': { ...prev.task1['1c'], cardsPerChild: val },
                              },
                            })),
                          'Aufgabe 1c Karten pro Kind'
                        )}{' '}
                        Karten erhält jedes Kind.
                      </p>
                      <p className="pl-4">
                        {renderBlankField(
                          st.cardsLeftover,
                          sub.remainder,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task1: {
                                ...prev.task1,
                                '1c': { ...prev.task1['1c'], cardsLeftover: val },
                              },
                            })),
                          'Aufgabe 1c übrige Karten'
                        )}{' '}
                        Karten bleiben übrig.
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* ===================================================================
            AUFGABE 2: Päckchen rechnen
           =================================================================== */}
        <section aria-label="Aufgabe 2" className="pt-1">
          <div className="flex items-center gap-2">
            <PartnerWorkIcon className="w-6 h-5" />
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#F6B48E] text-[#7c2d12] font-display font-bold text-[13px] shrink-0">
              2
            </span>
            <p className="text-[12.5px] sm:text-[13.5px] text-slate-800">
              Rechnet. Seht euch jedes Päckchen genau an. Was stellt ihr fest?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pl-12 sm:pl-14 pt-1.5 text-[12.5px] sm:text-[13.5px] text-slate-800">
            {TASK_2_PACKS.map((pack) => (
              <div key={pack.id} className="flex items-start gap-1.5">
                <span className="w-4 shrink-0">{pack.label}</span>
                <div className="space-y-1.5 tabular-nums">
                  {pack.equations.map((eq) => {
                    const eqSt = studentState.equations[eq.id] ?? { quotient: '', remainder: '' };
                    return (
                      <div key={eq.id} className="flex items-baseline whitespace-nowrap">
                        <span className="inline-block w-5 text-right">{eq.dividend}</span>
                        <span className="mx-1">:</span>
                        <span>{eq.divisor}</span>
                        <span className="mx-1">=</span>
                        {renderBlankField(
                          eqSt.quotient,
                          eq.quotient,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              equations: {
                                ...prev.equations,
                                [eq.id]: { ...eqSt, quotient: val },
                              },
                            })),
                          `Aufgabe ${eq.id} Quotient`,
                          'w-7 sm:w-8'
                        )}
                        <span className="mx-1">R</span>
                        {renderBlankField(
                          eqSt.remainder,
                          eq.remainder,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              equations: {
                                ...prev.equations,
                                [eq.id]: { ...eqSt, remainder: val },
                              },
                            })),
                          `Aufgabe ${eq.id} Rest`,
                          'w-7 sm:w-8'
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===================================================================
            AUFGABE 3: Divisionsaufgaben a, b, c
           =================================================================== */}
        <section aria-label="Aufgabe 3" className="pt-1.5 pl-6 sm:pl-8">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 bg-[#DB6D47] text-white font-display font-bold text-[13px] shrink-0">
              3
            </span>

            <div className="flex-1 grid grid-cols-3 gap-4 text-[12.5px] sm:text-[13.5px] text-slate-800">
              {TASK_3_PACKS.map((pack) => (
                <div key={pack.id} className="flex items-start gap-1.5">
                  <span className="w-4 shrink-0">{pack.label}</span>
                  <div className="space-y-1.5 tabular-nums">
                    {pack.equations.map((eq) => {
                      const eqSt = studentState.equations[eq.id] ?? {
                        quotient: '',
                        remainder: '',
                      };
                      return (
                        <div key={eq.id} className="flex items-baseline whitespace-nowrap">
                          <span className="inline-block w-5 text-right">{eq.dividend}</span>
                          <span className="mx-1">:</span>
                          <span>{eq.divisor}</span>
                          <span className="mx-1">=</span>
                          {renderBlankField(
                            eqSt.quotient,
                            eq.quotient,
                            (val) =>
                              onChangeState((prev) => ({
                                ...prev,
                                equations: {
                                  ...prev.equations,
                                  [eq.id]: { ...eqSt, quotient: val },
                                },
                              })),
                            `Aufgabe ${eq.id} Quotient`,
                            'w-7 sm:w-8'
                          )}
                          <span className="mx-1">R</span>
                          {renderBlankField(
                            eqSt.remainder,
                            eq.remainder,
                            (val) =>
                              onChangeState((prev) => ({
                                ...prev,
                                equations: {
                                  ...prev.equations,
                                  [eq.id]: { ...eqSt, remainder: val },
                                },
                              })),
                            `Aufgabe ${eq.id} Rest`,
                            'w-7 sm:w-8'
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================================================
            AUFGABE 4: Aufgabenkärtchen & Rest 2, 3, 4 Säcke
           =================================================================== */}
        <section aria-label="Aufgabe 4" className="pt-1.5 pl-6 sm:pl-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 flex-1">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#DB6D47] text-white font-display font-bold text-[13px]">
                  4
                </span>
                <CrayonIcon />
              </div>

              <div className="flex-1">
                <p className="text-[12.5px] sm:text-[13.5px] text-slate-800 leading-snug">
                  Bei welchen Aufgaben bleibt der Rest 2, 3 oder 4?
                  <br />
                  Male die Aufgabenkärtchen in der richtigen Farbe an.
                </p>

                {/* Row 1 of cards (4 cards below text) */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                  {TASK_4_CARDS.filter((c) => c.row === 1).map((card) => {
                    const chosenColor: RemainderBagColor = isSolution
                      ? card.expectedColor
                      : mode === 'clean'
                      ? null
                      : studentState.task4Colors[card.id];

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
                            const current = prev.task4Colors[card.id];
                            let nextColor: RemainderBagColor = activeBrush;
                            if (!activeBrush) {
                              // Cycle through red -> blue -> green -> null if no brush explicitly selected
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
                              task4Colors: {
                                ...prev.task4Colors,
                                [card.id]: nextColor,
                              },
                            };
                          });
                        }}
                        style={{ transform: `rotate(${card.tiltDeg}deg)` }}
                        aria-label={`Aufgabenkärtchen ${card.dividend} geteilt durch ${card.divisor}`}
                        className={`px-3.5 py-1 border text-[13px] tabular-nums shadow-[1px_1px_0px_rgba(0,0,0,0.08)] transition-all ${colorClasses} ${
                          isInteractive
                            ? 'cursor-pointer hover:scale-105 focus-visible:outline-2 focus-visible:outline-orange-600'
                            : 'cursor-default'
                        } ${isWrong ? 'ring-2 ring-rose-600' : ''}`}
                      >
                        {card.dividend} : {card.divisor}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: 3 Colored Remainder Sacks */}
            <div className="shrink-0 pr-1">
              <RemainderSacksInteractive
                activeBrush={activeBrush}
                onSelectBrush={onSelectBrush}
                interactive={isInteractive}
              />
            </div>
          </div>

          {/* Row 2 of cards (6 cards spanning across bottom of Task 4) */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 pl-9 mt-2.5">
            {TASK_4_CARDS.filter((c) => c.row === 2).map((card, idx) => {
              const chosenColor: RemainderBagColor = isSolution
                ? card.expectedColor
                : mode === 'clean'
                ? null
                : studentState.task4Colors[card.id];

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
                      const current = prev.task4Colors[card.id];
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
                        task4Colors: {
                          ...prev.task4Colors,
                          [card.id]: nextColor,
                        },
                      };
                    });
                  }}
                  style={{
                    transform: `rotate(${card.tiltDeg}deg) translateY(${idx >= 4 ? '3px' : '0px'})`,
                  }}
                  aria-label={`Aufgabenkärtchen ${card.dividend} geteilt durch ${card.divisor}`}
                  className={`px-3.5 py-1 border text-[13px] tabular-nums shadow-[1px_1px_0px_rgba(0,0,0,0.08)] transition-all ${colorClasses} ${
                    isInteractive
                      ? 'cursor-pointer hover:scale-105 focus-visible:outline-2 focus-visible:outline-orange-600'
                      : 'cursor-default'
                  } ${isWrong ? 'ring-2 ring-rose-600' : ''}`}
                >
                  {card.dividend} : {card.divisor}
                </button>
              );
            })}
          </div>
        </section>

        {/* ===================================================================
            AUFGABE 5 & AUFGABE 6 + Left Margin Self-Assessment Smileys
           =================================================================== */}
        <section aria-label="Aufgabe 5 und 6" className="pt-1.5">
          <div className="flex items-end gap-2">
            {/* Far-left Self-Assessment Smiley Strip */}
            <div className="w-6 shrink-0 pb-0.5">
              <SelfAssessmentStrip
                selectedSmiley={studentState.selectedSmiley}
                onSelectSmiley={(idx) =>
                  onChangeState((prev) => ({
                    ...prev,
                    selectedSmiley: prev.selectedSmiley === idx ? null : idx,
                  }))
                }
                interactive={isInteractive}
              />
            </div>

            {/* Main Task 5 and Task 6 Column */}
            <div className="flex-1 space-y-2.5">
              {/* Task 5 */}
              <div className="flex items-start gap-2.5">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#DB6D47] text-white font-display font-bold text-[13px] shrink-0">
                  5
                </span>

                <div className="text-[12.5px] sm:text-[13.5px] text-slate-800 leading-[1.42] space-y-1.5">
                  <p className="font-medium">Zahlenrätsel. Wie heißen die Zahlen?</p>

                  {/* 5a */}
                  <div className="flex items-start gap-1.5">
                    <span className="w-4 shrink-0">a)</span>
                    <div>
                      <p>Meine Zahl gehört zur Neuner-Reihe. Wenn du sie durch 8 dividierst,</p>
                      <p>bleibt als Rest 3.</p>
                      <p>
                        Meine Zahl heißt{' '}
                        {renderBlankField(
                          studentState.task5a,
                          27,
                          (val) => onChangeState((prev) => ({ ...prev, task5a: val })),
                          'Aufgabe 5a Gesuchte Zahl',
                          'w-11 sm:w-12',
                          isValidTask5aAnswer(studentState.task5a)
                        )}
                        .
                      </p>
                    </div>
                  </div>

                  {/* 5b */}
                  <div className="flex items-start gap-1.5 pt-0.5">
                    <span className="w-4 shrink-0">b)</span>
                    <div>
                      <p>Meine Zahlen gehören zur Sechser-Reihe. Wenn du sie durch 8 dividierst,</p>
                      <p>bleibt als Rest 4.</p>
                      <p>
                        Meine Zahlen heißen{' '}
                        {renderBlankField(
                          studentState.task5b[0],
                          12,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task5b: [val, prev.task5b[1], prev.task5b[2]],
                            })),
                          'Aufgabe 5b Erste Zahl',
                          'w-10 sm:w-11',
                          task5bValidation.validIndices[0]
                        )}
                        ,{' '}
                        {renderBlankField(
                          studentState.task5b[1],
                          36,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task5b: [prev.task5b[0], val, prev.task5b[2]],
                            })),
                          'Aufgabe 5b Zweite Zahl',
                          'w-10 sm:w-11',
                          task5bValidation.validIndices[1]
                        )}
                        ,{' '}
                        {renderBlankField(
                          studentState.task5b[2],
                          60,
                          (val) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task5b: [prev.task5b[0], prev.task5b[1], val],
                            })),
                          'Aufgabe 5b Dritte Zahl',
                          'w-10 sm:w-11',
                          task5bValidation.validIndices[2]
                        )}
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task 6 */}
              <div className="flex items-start gap-2.5 pt-1">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-[#DB6D47] text-white font-display font-bold text-[13px]">
                    6
                  </span>
                  <PartnerWorkIcon className="w-6 h-5" />
                </div>

                <div className="flex-1 text-[12.5px] sm:text-[13.5px] text-slate-800 leading-[1.42]">
                  <p>Schreibe ein eigenes Zahlenrätsel auf ein Blatt. Ein anderes Kind löst es.</p>
                  <p>Vergleicht.</p>

                  {includeTask6Lines && (
                    <div className="mt-2 space-y-2.5">
                      {isInteractive ? (
                        <input
                          type="text"
                          value={studentState.task6CustomRiddle}
                          onChange={(e) =>
                            onChangeState((prev) => ({
                              ...prev,
                              task6CustomRiddle: e.target.value,
                            }))
                          }
                          placeholder="Eigenes Zahlenrätsel hier notieren..."
                          aria-label="Aufgabe 6 Eigenes Zahlenrätsel"
                          className="w-full border-b border-slate-400 bg-amber-50/40 px-1.5 py-0.5 text-xs text-slate-800 outline-none focus:border-orange-600"
                        />
                      ) : isSolution ? (
                        <p className="text-xs text-blue-700 font-medium border-b border-slate-300 pb-0.5">
                          Beispiel: Meine Zahl gehört zur Siebener-Reihe. Durch 5 geteilt bleibt Rest 3. (Lösung: 28)
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
            </div>
          </div>
        </section>
      </div>

      {/* ===================================================================
          FOOTER (Page 22)
         =================================================================== */}
      <footer className="pt-2 mt-2">
        <div className="border-t border-slate-400 ml-6 mb-1.5" />
        <div className="flex items-baseline justify-between text-slate-700">
          <div className="flex items-baseline gap-3">
            <span className="font-display font-bold text-[15px] text-slate-900">22</span>
            <span className="text-[9.5px] text-slate-600">
              › <strong className="font-semibold">6</strong> Zahlenrätsel in der Klasse sammeln und
              vergleichen.
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-800">› zu Schulbuch-Seite 30</span>
        </div>
      </footer>
    </article>
  );
};
