import React, { useState, useMemo } from 'react';
import {
  FileDown,
  Printer,
  CheckCircle2,
  RotateCcw,
  Eye,
  FileText,
  Paintbrush,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import {
  RemainderBagColor,
  UniversalWorksheetDocument,
  DEFAULT_BOOK_PAGE_22,
  BEFUND_SABAH_MRT_2023_DOC,
  createEmptyUniversalState,
  evaluateUniversalWorksheet,
} from './types/worksheetModel';
import { WorksheetPage, WorksheetViewMode } from './components/WorksheetPage';
import {
  downloadWorksheetPdf,
  createWorksheetPdfBlobUrl,
} from './utils/pdfGenerator';

import { OfflineRunnerPanel } from './components/OfflineRunnerPanel';
import { UniversalUploader } from './components/UniversalUploader';
import { FfmpegWorkbench } from './components/FfmpegWorkbench';

type ActiveWorkspaceTab =
  | 'clean'
  | 'interactive'
  | 'solution'
  | 'compare'
  | 'pdf-preview'
  | 'offline-script'
  | 'upload-new'
  | 'ffmpeg-workbench';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('clean');
  const [currentDoc, setCurrentDoc] = useState<UniversalWorksheetDocument>(DEFAULT_BOOK_PAGE_22);
  const [uploadedScanUrl, setUploadedScanUrl] = useState<string>(
    '/assets/aistudio/image_d72e70b6.png'
  );
  const [studentState, setStudentState] = useState(() =>
    createEmptyUniversalState(DEFAULT_BOOK_PAGE_22)
  );
  const [activeBrush, setActiveBrush] = useState<RemainderBagColor>('red');
  const [showCheckFeedback, setShowCheckFeedback] = useState(false);

  // Print & PDF Customization Options
  const [includeSchoolHeader, setIncludeSchoolHeader] = useState(false);
  const [includeTask6Lines, setIncludeTask6Lines] = useState(false);
  const [useOriginalCrop, setUseOriginalCrop] = useState(true);

  // Notification banners
  const [lastDownloadedFile, setLastDownloadedFile] = useState<string | null>(null);
  const [scanLoadedBanner, setScanLoadedBanner] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [pdfPreviewMode, setPdfPreviewMode] = useState<'clean' | 'solution'>('clean');

  const validationSummary = useMemo(
    () => evaluateUniversalWorksheet(currentDoc, studentState),
    [currentDoc, studentState]
  );

  const handleDownloadPdf = (targetMode: 'clean' | 'solution' | 'custom') => {
    const filename = downloadWorksheetPdf({
      document: currentDoc,
      mode: targetMode,
      customState: studentState,
      includeSchoolHeader,
      includeTask6Lines,
      useOriginalCrop,
    });
    setLastDownloadedFile(filename);
  };

  const handleOpenPdfPreview = (modeToPreview: 'clean' | 'solution' = 'clean') => {
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
    }
    const url = createWorksheetPdfBlobUrl({
      document: currentDoc,
      mode: modeToPreview,
      customState: studentState,
      includeSchoolHeader,
      includeTask6Lines,
      useOriginalCrop,
    });
    setPdfPreviewMode(modeToPreview);
    setPdfPreviewUrl(url);
    setActiveTab('pdf-preview');
  };

  const handleResetToDefaultPage22 = () => {
    setCurrentDoc(DEFAULT_BOOK_PAGE_22);
    setUploadedScanUrl('/assets/aistudio/image_d72e70b6.png');
    setStudentState(createEmptyUniversalState(DEFAULT_BOOK_PAGE_22));
    setShowCheckFeedback(false);
    setScanLoadedBanner(null);
    setActiveTab('clean');
  };

  const handleLoadBefundSabah = () => {
    setCurrentDoc(BEFUND_SABAH_MRT_2023_DOC);
    setUploadedScanUrl('/assets/aistudio/befund_sabah_mrt_2023_e83309f5.jpeg');
    setStudentState(createEmptyUniversalState(BEFUND_SABAH_MRT_2023_DOC));
    setShowCheckFeedback(false);
    setScanLoadedBanner(
      '"Radiologischer Befundbericht – MRT LWS nativ (Tasdemir, Adem)" – 4 Sektionen ohne Handschrift/Unterschrift als DIN-A4-Dokument rekonstruiert.'
    );
    setActiveTab('clean');
  };

  const worksheetMode: WorksheetViewMode =
    activeTab === 'interactive'
      ? 'interactive'
      : activeTab === 'solution'
      ? 'solution'
      : 'clean';

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* =====================================================================
          TOP BAR CONTRACT: 3 Zones separated by gap-8
         ===================================================================== */}
      <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#arbeitsblatt"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('clean');
          }}
          className="text-lg font-display font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          MatheBlatt Studio
        </a>

        {/* Zone 2: Navigation links */}
        <nav
          aria-label="Hauptnavigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
        >
          <a
            href="#upload"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('upload-new');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'upload-new'
                ? 'text-slate-900 border-b-2 border-orange-600 font-semibold'
                : ''
            }`}
          >
            Scan hochladen (Universal)
          </a>
          <a
            href="#leer"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('clean');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'clean' ? 'text-slate-900 border-b-2 border-orange-600 font-semibold' : ''
            }`}
          >
            Arbeitsblatt (Leer)
          </a>
          <a
            href="#interaktiv"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('interactive');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'interactive'
                ? 'text-slate-900 border-b-2 border-orange-600 font-semibold'
                : ''
            }`}
          >
            Interaktiv lösen
          </a>
          <a
            href="#loesungen"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('solution');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'solution'
                ? 'text-slate-900 border-b-2 border-orange-600 font-semibold'
                : ''
            }`}
          >
            Lösungsblatt
          </a>
          <a
            href="#vergleich"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('compare');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'compare'
                ? 'text-slate-900 border-b-2 border-orange-600 font-semibold'
                : ''
            }`}
          >
            Vorher / Nachher
          </a>
          <a
            href="#offline"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('offline-script');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'offline-script'
                ? 'text-slate-900 border-b-2 border-orange-600 font-semibold'
                : ''
            }`}
          >
            Offline-Tool (LM Studio)
          </a>
          <a
            href="#ffmpeg"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('ffmpeg-workbench');
            }}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'ffmpeg-workbench'
                ? 'text-slate-900 border-b-2 border-orange-600 font-semibold'
                : ''
            }`}
          >
            FFmpeg Workbench
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleDownloadPdf('clean')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#D66840] hover:bg-[#bf5630] rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            PDF herunterladen (Leer)
          </button>
        </div>
      </header>

      {/* =====================================================================
          MAIN WORKSPACE (1440px Desktop Container, 2-Zone Sandbox Layout)
         ===================================================================== */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT / MAIN STAGE (8 columns on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Workspace Mode Switcher & Status Strip (Hidden in Print) */}
          <div className="no-print bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('upload-new')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'upload-new'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Neuen Scan hochladen
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('clean')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'clean'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Bereinigtes Arbeitsblatt
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('interactive')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'interactive'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Interaktiv ausfüllen
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('solution')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'solution'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Lösungsblatt
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'compare'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vorher / Nachher
              </button>
              <button
                type="button"
                onClick={() => handleOpenPdfPreview('clean')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'pdf-preview'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                PDF-Vorschau
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('offline-script')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'offline-script'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Offline-Programm (LM Studio)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ffmpeg-workbench')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeTab === 'ffmpeg-workbench'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FFmpeg Workbench
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{currentDoc.pageNumber ? `Buchseite ${currentDoc.pageNumber}` : 'Arbeitsblatt'}</span>
              <span aria-hidden="true">·</span>
              <span>DIN A4 Vektor-Layout</span>
              <span aria-hidden="true">·</span>
              <span>Handschrift entfernt</span>
            </div>
          </div>

          {/* Scan Loaded Notification Banner */}
          {scanLoadedBanner && (
            <div
              role="status"
              data-testid="scan-loaded-banner"
              className="no-print bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Neuer Scan erfolgreich rekonstruiert:</strong> {scanLoadedBanner}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('compare')}
                  className="px-2.5 py-1 bg-white border border-emerald-300 rounded-md font-semibold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  Vorher / Nachher vergleichen
                </button>
                <button
                  type="button"
                  onClick={() => setScanLoadedBanner(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-semibold px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Interactive Mode Toolbar (Brush Picker & Validation Controls) */}
          {activeTab === 'interactive' && (
            <div className="no-print bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mr-1">
                  <Paintbrush className="w-3.5 h-3.5 text-orange-600" />
                  Stiftfarbe für Kärtchen:
                </span>
                {[
                  { id: 'red' as const, label: 'Rot (Rest 2)', activeClass: 'bg-red-600 text-white' },
                  {
                    id: 'blue' as const,
                    label: 'Blau (Rest 3)',
                    activeClass: 'bg-blue-600 text-white',
                  },
                  {
                    id: 'green' as const,
                    label: 'Grün (Rest 4)',
                    activeClass: 'bg-emerald-600 text-white',
                  },
                ].map((brush) => (
                  <button
                    key={brush.id}
                    type="button"
                    onClick={() =>
                      setActiveBrush((prev) => (prev === brush.id ? null : brush.id))
                    }
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      activeBrush === brush.id
                        ? brush.activeClass
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {brush.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 tabular-nums mr-1">
                  Ausgefüllt: {validationSummary.filledFields} / {validationSummary.totalFields}
                  {showCheckFeedback &&
                    ` · Richtig: ${validationSummary.correctFields} / ${validationSummary.totalFields}`}
                </span>
                <button
                  type="button"
                  onClick={() => setShowCheckFeedback((prev) => !prev)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {showCheckFeedback ? 'Prüfung ausblenden' : 'Ergebnisse prüfen'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentState(createEmptyUniversalState(currentDoc));
                    setShowCheckFeedback(false);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Leeren
                </button>
              </div>
            </div>
          )}

          {/* MAIN CONTENT STAGE */}
          {activeTab === 'compare' ? (
            <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left: Original uploaded photo with handwritten answers */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Vorher: Hochgeladener Scan (Mit Handschrift)
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentDoc.title}{' '}
                      {currentDoc.pageNumber ? `(Seite ${currentDoc.pageNumber})` : ''} – Originalbild
                    </p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <img
                    src={uploadedScanUrl}
                    alt={`Original-Scan ${currentDoc.title}`}
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              {/* Right: Reconstructed Clean Worksheet */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Nachher: Bereinigtes Arbeitsblatt (Druckfertig)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Alle {validationSummary.totalFields} Eingabefelder bereinigt · Vektorscharfes A4-Layout
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('clean')}
                    className="px-2.5 py-1 text-xs font-medium text-orange-700 hover:text-orange-900 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Großansicht öffnen →
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <WorksheetPage
                    document={currentDoc}
                    sourceImageUrl={uploadedScanUrl}
                    mode="clean"
                    studentState={studentState}
                    onChangeState={setStudentState}
                    activeBrush={activeBrush}
                    onSelectBrush={setActiveBrush}
                    showCheckFeedback={false}
                    includeSchoolHeader={includeSchoolHeader}
                    includeTask6Lines={includeTask6Lines}
                    useOriginalCrop={useOriginalCrop}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'pdf-preview' && pdfPreviewUrl ? (
            <div className="no-print bg-white border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Integrierte PDF-Dokument-Vorschau ({pdfPreviewMode === 'clean' ? 'Leeres Arbeitsblatt' : 'Lösungsblatt'})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direkt generiertes DIN-A4 PDF-Dokument im Vektorformat ({currentDoc.title})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPdfPreview('clean')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap shrink-0 ${
                      pdfPreviewMode === 'clean'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Leeres PDF zeigen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenPdfPreview('solution')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap shrink-0 ${
                      pdfPreviewMode === 'solution'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Lösungs-PDF zeigen
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(pdfPreviewMode)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[#D66840] hover:bg-[#bf5630] rounded-lg cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Datei speichern
                  </button>
                </div>
              </div>
              <iframe
                src={pdfPreviewUrl}
                title="Generiertes Arbeitsblatt PDF"
                className="w-full h-[860px] rounded-lg border border-slate-200 bg-slate-800"
              />
            </div>
          ) : activeTab === 'upload-new' ? (
            <UniversalUploader
              onAnalyzeSuccess={({ imageBase64, document: analyzedDoc }) => {
                setCurrentDoc(analyzedDoc);
                setUploadedScanUrl(imageBase64);
                setStudentState(createEmptyUniversalState(analyzedDoc));
                setShowCheckFeedback(false);
                const countInfo =
                  analyzedDoc.documentCategory === 'document'
                    ? `${analyzedDoc.documentSections?.length || 0} Textsektionen ohne Unterschrift/Handschrift`
                    : `${analyzedDoc.tasks.length} Aufgaben ohne Handschrift`;
                setScanLoadedBanner(
                  `"${analyzedDoc.title}"${
                    analyzedDoc.pageNumber ? ` (Seite ${analyzedDoc.pageNumber})` : ''
                  } – ${countInfo} aufgebaut.`
                );
                setActiveTab('clean');
              }}
            />
          ) : activeTab === 'offline-script' ? (
            <OfflineRunnerPanel />
          ) : activeTab === 'ffmpeg-workbench' ? (
            <FfmpegWorkbench />
          ) : (
            /* Standard A4 Sheet Stage (Also used when printing via window.print()) */
            <WorksheetPage
              document={currentDoc}
              sourceImageUrl={uploadedScanUrl}
              mode={worksheetMode}
              studentState={studentState}
              onChangeState={setStudentState}
              activeBrush={activeBrush}
              onSelectBrush={setActiveBrush}
              showCheckFeedback={showCheckFeedback}
              includeSchoolHeader={includeSchoolHeader}
              includeTask6Lines={includeTask6Lines}
              useOriginalCrop={useOriginalCrop}
            />
          )}
        </div>

        {/* RIGHT / CONTROL & PDF EXPORT DECK (4 columns on lg, hidden in print) */}
        <aside className="no-print lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Card 1: Direct PDF Export & Print */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h1 className="text-base font-display font-bold text-slate-900">
                {currentDoc.documentCategory === 'document' ? 'Dokument: ' : 'Arbeitsblatt: '}
                {currentDoc.title}{' '}
                {currentDoc.pageNumber ? `(S. ${currentDoc.pageNumber})` : ''}
              </h1>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {currentDoc.documentCategory === 'document'
                  ? 'Das Schreiben/Befunddokument wurde vollständig im DIN-A4-Format rekonstruiert. Papierfalten, Schatten und handschriftliche Unterschriften wurden entfernt.'
                  : `Die Buchseite wurde vollständig im DIN-A4-Format rekonstruiert. Sämtliche handschriftlichen Einträge in allen ${currentDoc.tasks.length} Aufgaben wurden entfernt.`}
              </p>
            </div>

            {lastDownloadedFile && (
              <div
                role="status"
                className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2"
              >
                <span>
                  PDF erstellt: <strong className="font-semibold">{lastDownloadedFile}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setLastDownloadedFile(null)}
                  className="text-emerald-700 hover:text-emerald-950 font-medium cursor-pointer"
                >
                  OK
                </button>
              </div>
            )}

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleDownloadPdf('clean')}
                className="w-full py-2.5 px-4 bg-[#D66840] hover:bg-[#bf5630] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
              >
                <FileDown className="w-4 h-4" />
                Als bereinigtes DIN-A4 PDF laden
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPdf('solution')}
                className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                {currentDoc.documentCategory === 'document'
                  ? 'Mit Bereinigungs-Vermerk als PDF laden'
                  : 'Lösungsblatt als PDF laden (Mit Lösungen)'}
              </button>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Direkt drucken (A4)
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenPdfPreview('clean')}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" />
                  PDF im Browser öffnen
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload-new')}
                  className="w-full py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Eigenen Scan / Foto hochladen
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleLoadBefundSabah}
                    className="py-1.5 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-medium text-[11px] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    MRT-Befund (Sabah) zeigen
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefaultPage22}
                    className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Mathe-Blatt S. 22 zeigen
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Layout & Print Adjustments */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
            <h2 className="text-sm font-display font-bold text-slate-900">
              Druck- & Layout-Optionen
            </h2>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeSchoolHeader}
                onChange={(e) => setIncludeSchoolHeader(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  Name, Klasse & Datum Kopfzeile
                </span>
                <span className="text-slate-500">
                  Fügt über dem Banner eine Beschriftungszeile für Kopien hinzu
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeTask6Lines}
                onChange={(e) => setIncludeTask6Lines(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  Schreiblinien für Freitext-Aufgaben einblenden
                </span>
                <span className="text-slate-500">
                  Ergänzt zwei Linien, damit Kinder eigene Antworten direkt aufs Blatt schreiben können
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useOriginalCrop}
                onChange={(e) => setUseOriginalCrop(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">
                  Original-Buchillustration freistellen
                </span>
                <span className="text-slate-500">
                  Nutzt die automatisch ausgeschnittene Illustration aus dem Scan (alternativ: reine SVG-Vektorgrafik)
                </span>
              </div>
            </label>
          </div>

          {/* Card 3: Overview of Cleaned Tasks / Document Sections */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-display font-bold text-slate-900">
              {currentDoc.documentCategory === 'document'
                ? `Übersicht der bereinigten Sektionen (${currentDoc.documentSections?.length || 0})`
                : `Übersicht der bereinigten Aufgaben (${currentDoc.tasks.length})`}
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
              {currentDoc.documentCategory === 'document'
                ? (currentDoc.documentSections || []).map((sec, idx, arr) => (
                    <li
                      key={sec.id}
                      className={idx < arr.length - 1 ? 'border-b border-slate-100 pb-1.5' : ''}
                    >
                      <strong className="text-slate-800">
                        {sec.heading || sec.inlineLeadBold || `Abschnitt ${idx + 1}`}:
                      </strong>{' '}
                      {sec.paragraphs?.[0]?.slice(0, 75) || ''}
                      {(sec.paragraphs?.[0]?.length || 0) > 75 ? '…' : ''}
                    </li>
                  ))
                : currentDoc.tasks.map((t, idx) => (
                    <li
                      key={t.id}
                      className={
                        idx < currentDoc.tasks.length - 1 ? 'border-b border-slate-100 pb-1.5' : ''
                      }
                    >
                      <strong className="text-slate-800">Aufgabe {t.taskNumber}:</strong>{' '}
                      {t.title ||
                        (t.type === 'word-problem'
                          ? `Sachaufgabe (${t.subtasks?.length || 0} Teilaufgaben)`
                          : t.type === 'equation-grid'
                          ? `Rechenpäckchen (${t.equationColumns?.length || 0} Spalten)`
                          : t.type === 'cards'
                          ? `Farbkärtchen (${t.cards?.length || 0} Kärtchen)`
                          : t.type === 'riddle'
                          ? `Zahlenrätsel (${t.riddles?.length || 0} Rätsel)`
                          : 'Freie Zusatzaufgabe')}
                    </li>
                  ))}
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
