import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle, FileCheck2 } from 'lucide-react';

interface UniversalUploaderProps {
  onAnalyzeSuccess: (data: { imageBase64: string; document: any }) => void;
}

export const UniversalUploader: React.FC<UniversalUploaderProps> = ({ onAnalyzeSuccess }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/png');
    setAnalysisError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setStatusMessage('Bild wird analysiert & Handschrift wird entfernt...');

    try {
      const response = await fetch('/api/analyze-worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server antwortete mit Status ${response.status}`);
      }

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Verarbeitung fehlgeschlagen');
      }

      setStatusMessage('Bereinigung abgeschlossen! Bereinige Druckansicht...');
      setTimeout(() => {
        setIsAnalyzing(false);
        onAnalyzeSuccess({
          imageBase64: selectedImage,
          document: resData.document,
        });
      }, 600);
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalysisError(
        err?.message ||
          'Die Analyse konnte nicht durchgeführt werden. Du kannst das Arbeitsblatt trotzdem mit Standard-Bereinigung verwenden.'
      );
    }
  };

  const handleUseSampleScan = async () => {
    try {
      setAnalysisError(null);
      const res = await fetch('/assets/aistudio/image_d72e70b6.png');
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setMimeType('image/png');
      };
      reader.readAsDataURL(blob);
    } catch {
      setSelectedImage('/assets/aistudio/image_d72e70b6.png');
      setMimeType('image/png');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-orange-100 text-orange-700">
              <UploadCloud className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-display font-bold text-slate-900">
              Universeller Upload & Automatische Handschrift-Bereinigung
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Lade einen beliebigen Schulbuch-Scan oder ein Handyfoto hoch (PNG, JPG, HEIC). Das System analysiert
            die Aufgaben, entfernt alle handschriftlichen Zahlen/Einträge und rekonstruiert sofort ein sauberes A4-PDF.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseSampleScan}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Vorlage Seite 22 laden
        </button>
      </div>

      {/* Upload Drop Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
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
          Scan oder Foto hier ablegen oder <span className="text-orange-600 underline">Datei auswählen</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">Unterstützt JPG, PNG, WebP bis 25 MB</p>
      </div>

      {/* Preview & Action Area */}
      {selectedImage && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 rounded overflow-hidden border border-slate-300 bg-white shrink-0">
              <img src={selectedImage} alt="Hochgeladene Buchseite" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-800 block">Scan erfolgreich bereitgestellt</span>
              <span className="text-[11px] text-slate-500">Bereit für automatische Handschrift-Entfernung</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleRunAnalysis}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#D66840] hover:bg-[#bf5630] disabled:bg-slate-400 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Analysiere & Bereinige...
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
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
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
