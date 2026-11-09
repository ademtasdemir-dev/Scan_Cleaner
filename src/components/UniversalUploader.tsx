import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FilePlus2,
} from 'lucide-react';
import { UniversalWorksheetDocument } from '../types/worksheetModel';

interface UniversalUploaderProps {
  onAnalyzeSuccess: (data: {
    imageBase64: string;
    document: UniversalWorksheetDocument;
  }) => void;
}

/**
 * Downscales and compresses an image dataURL or Blob so large phone scans (e.g. 12MP)
 * transmit quickly and reliably to /api/analyze-worksheet.
 */
async function compressImageDataUrl(
  rawDataUrl: string,
  maxDim = 1400
): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: rawDataUrl, mimeType: 'image/png' });
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.88);
        resolve({ dataUrl: compressed, mimeType: 'image/jpeg' });
      } catch {
        resolve({ dataUrl: rawDataUrl, mimeType: 'image/png' });
      }
    };
    img.onerror = () => resolve({ dataUrl: rawDataUrl, mimeType: 'image/png' });
    img.src = rawDataUrl;
  });
}

/**
 * Generates a realistic second textbook scan ("Halbschriftliches Dividieren & Einmaleins", Page 34)
 * WITH simulated pencil handwriting so users can immediately test how a brand-new scan is analyzed and cleaned.
 */
function generateSecondSampleScanWithHandwriting(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 900;
  canvas.height = 1240;
  const ctx = canvas.getContext('2d')!;

  // Warm photographed paper background
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header Banner (Teal-Blue textbook header)
  ctx.fillStyle = '#2B6CB0';
  ctx.fillRect(48, 42, 804, 58);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Rechnen mit großen Zahlen und Rest', 85, 80);

  // Task 1: Word problem
  ctx.fillStyle = '#2B6CB0';
  ctx.fillRect(58, 130, 32, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('1', 68, 153);

  ctx.fillStyle = '#1e293b';
  ctx.font = '19px sans-serif';
  ctx.fillText('a) 45 Äpfel werden in 6 Körbe verteilt.', 110, 152);
  ctx.fillText('F: Wie viele Äpfel sind in jedem Korb?', 132, 182);
  ctx.fillText('L: 45 : 6 = ____ R ____', 132, 214);
  ctx.fillText('A: ____ Äpfel pro Korb, ____ bleiben übrig.', 132, 246);

  ctx.fillText('b) 50 Äpfel werden in 8 Körbe verteilt.', 480, 152);
  ctx.fillText('F: Wie viele Äpfel sind in jedem Korb?', 502, 182);
  ctx.fillText('L: 50 : 8 = ____ R ____', 502, 214);
  ctx.fillText('A: ____ Äpfel pro Korb, ____ bleiben übrig.', 502, 246);

  // Simulated Pencil Handwriting in Task 1
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 24px cursive, sans-serif';
  ctx.fillText('7', 238, 212);
  ctx.fillText('3', 305, 212);
  ctx.fillText('7', 162, 244);
  ctx.fillText('3', 345, 244);

  ctx.fillText('6', 608, 212);
  ctx.fillText('2', 675, 212);
  ctx.fillText('6', 532, 244);
  ctx.fillText('2', 715, 244);

  // Task 2: Equation packs
  ctx.fillStyle = '#2B6CB0';
  ctx.fillRect(58, 310, 32, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('2', 68, 333);

  ctx.fillStyle = '#1e293b';
  ctx.font = '20px sans-serif';
  ctx.fillText('Löse die Aufgabenpäckchen sorgfältig.', 105, 333);

  const cols = [
    {
      label: 'a)',
      x: 105,
      eqs: [
        ['37 : 5 =', '7', '2'],
        ['38 : 5 =', '7', '3'],
        ['39 : 5 =', '7', '4'],
      ],
    },
    {
      label: 'b)',
      x: 375,
      eqs: [
        ['25 : 4 =', '6', '1'],
        ['26 : 4 =', '6', '2'],
        ['27 : 4 =', '6', '3'],
      ],
    },
    {
      label: 'c)',
      x: 640,
      eqs: [
        ['43 : 7 =', '6', '1'],
        ['44 : 7 =', '6', '2'],
        ['45 : 7 =', '6', '3'],
      ],
    },
  ];

  cols.forEach((col) => {
    ctx.fillStyle = '#1e293b';
    ctx.font = '19px sans-serif';
    ctx.fillText(col.label, col.x, 380);
    col.eqs.forEach((eq, idx) => {
      const y = 380 + idx * 38;
      ctx.fillStyle = '#1e293b';
      ctx.font = '19px sans-serif';
      ctx.fillText(`${eq[0]} ____ R ____`, col.x + 30, y);
      // Pencil handwritten numbers
      ctx.fillStyle = '#475569';
      ctx.font = 'italic 23px sans-serif';
      ctx.fillText(eq[1], col.x + 112, y - 2);
      ctx.fillText(eq[2], col.x + 185, y - 2);
    });
  });

  // Task 3: Number riddles
  ctx.fillStyle = '#2B6CB0';
  ctx.fillRect(58, 530, 32, 32);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('3', 68, 553);

  ctx.fillStyle = '#1e293b';
  ctx.font = '20px sans-serif';
  ctx.fillText('Zahlenrätsel. Welche Zahl wird gesucht?', 105, 553);
  ctx.font = '19px sans-serif';
  ctx.fillText(
    'a) Meine Zahl gehört zur Siebener-Reihe. Wenn du sie durch 5 teilst, bleibt Rest 3.',
    105,
    595
  );
  ctx.fillText('Meine Zahl heißt _______.', 130, 630);
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 24px sans-serif';
  ctx.fillText('28', 295, 628);

  ctx.fillStyle = '#1e293b';
  ctx.font = '19px sans-serif';
  ctx.fillText(
    'b) Meine Zahl gehört zur Achter-Reihe. Wenn du sie durch 9 teilst, bleibt Rest 5.',
    105,
    680
  );
  ctx.fillText('Meine Zahl heißt _______.', 130, 715);
  ctx.fillStyle = '#475569';
  ctx.font = 'italic 24px sans-serif';
  ctx.fillText('32', 295, 713);

  // Footer
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(58, 1150);
  ctx.lineTo(845, 1150);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('34', 58, 1185);
  ctx.font = '15px sans-serif';
  ctx.fillText('› Übungsseite zur Division mit Rest im Hunderterraum', 105, 1185);
  ctx.fillText('› zu Schulbuch-Seite 42', 680, 1185);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const UniversalUploader: React.FC<UniversalUploaderProps> = ({ onAnalyzeSuccess }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<string>('Eigener Scan');
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processSelectedFile = (file: File) => {
    setAnalysisError(null);
    setSelectedLabel(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const rawUrl = reader.result as string;
      const compressed = await compressImageDataUrl(rawUrl, 1400);
      setSelectedImage(compressed.dataUrl);
      setMimeType(compressed.mimeType);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processSelectedFile(file);
  };

  const handleRunAnalysis = async (overrideImage?: string, overrideMime?: string) => {
    const imgToUse = overrideImage ?? selectedImage;
    const mimeToUse = overrideMime ?? mimeType;
    if (!imgToUse) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setStatusMessage(
      'KI-Vision analysiert Aufgabenstruktur, entfernt Handschrift & berechnet Lösungsblatt...'
    );

    try {
      const response = await fetch('/api/analyze-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgToUse,
          mimeType: mimeToUse,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server antwortete mit Status ${response.status}`);
      }

      const resData = await response.json();
      if (!resData.success || !resData.document) {
        throw new Error(resData.error || 'Verarbeitung fehlgeschlagen');
      }

      setStatusMessage(
        `Fertig! "${resData.document.title}" (${resData.document.tasks?.length || 0} Aufgaben) rekonstruiert.`
      );
      setIsAnalyzing(false);
      onAnalyzeSuccess({
        imageBase64: imgToUse,
        document: resData.document,
      });
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalysisError(
        err?.message ||
          'Die Analyse konnte nicht durchgeführt werden. Bitte prüfe deine Bilddatei und versuche es erneut.'
      );
    }
  };

  const handleUseSampleScan22 = async () => {
    try {
      setAnalysisError(null);
      setSelectedLabel('Vorlage Buchseite 22 (Dividieren mit Rest)');
      const res = await fetch('/assets/aistudio/image_d72e70b6.png');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const compressed = await compressImageDataUrl(reader.result as string, 1400);
        setSelectedImage(compressed.dataUrl);
        setMimeType(compressed.mimeType);
      };
      reader.readAsDataURL(blob);
    } catch {
      setSelectedImage('/assets/aistudio/image_d72e70b6.png');
      setMimeType('image/png');
    }
  };

  const handleUseSecondSampleScan34 = () => {
    setAnalysisError(null);
    setSelectedLabel('Neuer Beispiel-Scan: Seite 34 (Mit Handschrift)');
    const dataUrl = generateSecondSampleScanWithHandwriting();
    setSelectedImage(dataUrl);
    setMimeType('image/jpeg');
  };

  const handleUseBefundSabahScan = async () => {
    try {
      setAnalysisError(null);
      setSelectedLabel('MRT-Befundbericht (Dr. Sabah / 15.11.2023)');
      const res = await fetch('/assets/aistudio/befund_sabah_mrt_2023_e83309f5.jpeg');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = async () => {
        const compressed = await compressImageDataUrl(reader.result as string, 1400);
        setSelectedImage(compressed.dataUrl);
        setMimeType(compressed.mimeType);
      };
      reader.readAsDataURL(blob);
    } catch {
      setSelectedImage('/assets/aistudio/befund_sabah_mrt_2023_e83309f5.jpeg');
      setMimeType('image/jpeg');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-orange-100 text-orange-700">
              <UploadCloud className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-display font-bold text-slate-900">
              Universeller Scan-Upload (Arbeitsblätter, Buchseiten, Briefe & Befunde)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Lade einen beliebigen Schulbuch-Scan, ein Arbeitsblatt oder ein abfotografiertes
            Schreiben/Befunddokument hoch (PNG, JPG, WebP). Die KI-Analyse extrahiert den gesamten
            Text, entfernt Handschrift/Unterschriften sowie Papierfalten und baut sofort ein
            druckfertiges DIN-A4-PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleUseBefundSabahScan}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            MRT-Befund (Sabah 2023) laden
          </button>
          <button
            type="button"
            onClick={handleUseSecondSampleScan34}
            className="px-3 py-1.5 text-xs font-semibold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <FilePlus2 className="w-3.5 h-3.5" />
            Test-Scan (Seite 34) laden
          </button>
          <button
            type="button"
            onClick={handleUseSampleScan22}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            Vorlage Seite 22 laden
          </button>
        </div>
      </div>

      {/* Upload Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-slate-300 hover:border-orange-500 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-orange-50/20"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2">
          <ImageIcon className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-slate-800">
          Eigenen Scan oder Foto hier ablegen oder{' '}
          <span className="text-orange-600 underline">Bilddatei auswählen</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Unterstützt alle Buchseiten & Arbeitsblätter (JPG, PNG, WebP – automatische
          Bildoptimierung)
        </p>
      </div>

      {/* Preview & Action Area */}
      {selectedImage && (
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-16 rounded overflow-hidden border border-slate-300 bg-white shrink-0">
              <img
                src={selectedImage}
                alt="Hochgeladene Buchseite"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 block">
                {selectedLabel} bereitgestellt
              </span>
              <span className="text-[11px] text-slate-500">
                Klicke rechts auf „Handschrift jetzt entfernen & PDF bauen“, um das neue Blatt zu
                erstellen
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => handleRunAnalysis()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#D66840] hover:bg-[#bf5630] disabled:bg-slate-400 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analysiere & Bereinige Scan...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Handschrift jetzt entfernen & PDF bauen
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-900 flex items-center gap-2">
          <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>{statusMessage}</span>
        </div>
      )}

      {analysisError && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}
    </div>
  );
};
