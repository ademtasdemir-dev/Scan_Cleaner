import React, { useState } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  Loader2,
  FileVideo,
  Download,
  Plus,
  Trash2,
  Terminal,
} from 'lucide-react';

export type VideoPipelineStatus = 'Pending' | 'Processing' | 'Completed';

export interface VideoQueueItem {
  id: string;
  filename: string;
  inputResolution: string;
  outputResolution: string;
  bitrate: string;
  container: 'mp4' | 'mkv' | 'webm' | 'avi';
  codec: 'libx264' | 'libx265' | 'libvpx-vp9' | 'av1';
  fps: number;
  status: VideoPipelineStatus;
  progress: number;
  sizeMb?: number;
}

export const FfmpegWorkbench: React.FC = () => {
  // Batch export configuration
  const [batchResolution, setBatchResolution] = useState<'1920x1080' | '1280x720' | '3840x2160' | 'original'>('1920x1080');
  const [batchBitrate, setBatchBitrate] = useState<'4500k' | '2500k' | '8000k' | '12000k'>('4500k');
  const [batchContainer, setBatchContainer] = useState<'mp4' | 'mkv' | 'webm' | 'avi'>('mp4');
  const [batchCodec, setBatchCodec] = useState<'libx264' | 'libx265' | 'libvpx-vp9' | 'av1'>('libx264');

  // Video production pipeline queue
  const [videoQueue, setVideoQueue] = useState<VideoQueueItem[]>([
    {
      id: 'vid-1',
      filename: 'schulstunde_mathe_intro.mp4',
      inputResolution: '1920x1080',
      outputResolution: '1920x1080',
      bitrate: '4500k',
      container: 'mp4',
      codec: 'libx264',
      fps: 30,
      status: 'Completed',
      progress: 100,
      sizeMb: 42.5,
    },
    {
      id: 'vid-2',
      filename: 'erklaervideo_dividieren_rest_s22.mp4',
      inputResolution: '2560x1440',
      outputResolution: '1920x1080',
      bitrate: '4500k',
      container: 'mp4',
      codec: 'libx264',
      fps: 60,
      status: 'Processing',
      progress: 58,
      sizeMb: 68.2,
    },
    {
      id: 'vid-3',
      filename: 'zahlenraetsel_uebung_animation.mov',
      inputResolution: '1920x1080',
      outputResolution: '1920x1080',
      bitrate: '4500k',
      container: 'mp4',
      codec: 'libx264',
      fps: 30,
      status: 'Pending',
      progress: 0,
    },
    {
      id: 'vid-4',
      filename: 'lehrprobe_tafelbild_aufnahme.mkv',
      inputResolution: '3840x2160',
      outputResolution: '1920x1080',
      bitrate: '4500k',
      container: 'mp4',
      codec: 'libx264',
      fps: 60,
      status: 'Pending',
      progress: 0,
    },
  ]);

  const [newVideoName, setNewVideoName] = useState('');

  // Apply batch configuration to all items or only pending items
  const handleApplyBatchConfig = () => {
    setVideoQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'Completed') return item;
        return {
          ...item,
          outputResolution: batchResolution === 'original' ? item.inputResolution : batchResolution,
          bitrate: batchBitrate,
          container: batchContainer,
          codec: batchCodec,
        };
      })
    );
  };

  const handleStartProcessing = () => {
    setVideoQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'Pending') {
          return { ...item, status: 'Processing', progress: 15 };
        }
        if (item.status === 'Processing') {
          return { ...item, status: 'Completed', progress: 100, sizeMb: 52.8 };
        }
        return item;
      })
    );
  };

  const handleResetQueue = () => {
    setVideoQueue((prev) =>
      prev.map((item) => ({
        ...item,
        status: 'Pending',
        progress: 0,
      }))
    );
  };

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoName.trim()) return;

    const newItem: VideoQueueItem = {
      id: `vid-${Date.now()}`,
      filename: newVideoName.trim().endsWith('.mp4') ? newVideoName.trim() : `${newVideoName.trim()}.mp4`,
      inputResolution: '1920x1080',
      outputResolution: batchResolution === 'original' ? '1920x1080' : batchResolution,
      bitrate: batchBitrate,
      container: batchContainer,
      codec: batchCodec,
      fps: 30,
      status: 'Pending',
      progress: 0,
    };

    setVideoQueue((prev) => [...prev, newItem]);
    setNewVideoName('');
  };

  const handleDeleteItem = (id: string) => {
    setVideoQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Status counts for the dashboard
  const pendingCount = videoQueue.filter((v) => v.status === 'Pending').length;
  const processingCount = videoQueue.filter((v) => v.status === 'Processing').length;
  const completedCount = videoQueue.filter((v) => v.status === 'Completed').length;
  const totalCount = videoQueue.length;

  return (
    <div className="space-y-6">
      {/* 1. STATUS DASHBOARD COMPONENT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-display font-bold text-slate-900">
              Pipeline Status Dashboard
            </h3>
            <p className="text-xs text-slate-500">
              Überblick aller Videos in der FFmpeg Produktions- und Export-Warteschlange
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartProcessing}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#D66840] hover:bg-[#bf5630] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Batch-Verarbeitung starten
            </button>
            <button
              type="button"
              onClick={handleResetQueue}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Zurücksetzen
            </button>
          </div>
        </div>

        {/* Status Counter Cards with Distinct Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Total */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Gesamt
              </span>
              <span className="text-xl font-bold font-display text-slate-900 tabular-nums">
                {totalCount}
              </span>
            </div>
            <FileVideo className="w-5 h-5 text-slate-400" />
          </div>

          {/* Pending (Amber) */}
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-800 block uppercase tracking-wider">
                Pending (Wartend)
              </span>
              <span className="text-xl font-bold font-display text-amber-900 tabular-nums">
                {pendingCount}
              </span>
            </div>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>

          {/* Processing (Blue) */}
          <div className="p-3.5 rounded-lg border border-blue-200 bg-blue-50/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-blue-800 block uppercase tracking-wider">
                Processing (In Arbeit)
              </span>
              <span className="text-xl font-bold font-display text-blue-900 tabular-nums">
                {processingCount}
              </span>
            </div>
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>

          {/* Completed (Emerald) */}
          <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-emerald-800 block uppercase tracking-wider">
                Completed (Fertig)
              </span>
              <span className="text-xl font-bold font-display text-emerald-900 tabular-nums">
                {completedCount}
              </span>
            </div>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* 2. BATCH EXPORT CONFIGURATION FEATURE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="p-1 rounded bg-orange-100 text-orange-700">
            <Sliders className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-display font-bold text-slate-900">
              Batch Export Konfiguration
            </h3>
            <p className="text-xs text-slate-500">
              Definiere Ziel-Auflösung, Bitraten und Container-Formate simultan für alle Pipeline-Videos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Resolution */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Ziel-Auflösung (-s)
            </label>
            <select
              value={batchResolution}
              onChange={(e) => setBatchResolution(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="1920x1080">1080p Full HD (1920x1080)</option>
              <option value="1280x720">720p HD (1280x720)</option>
              <option value="3840x2160">4K Ultra HD (3840x2160)</option>
              <option value="original">Originalauflösung beibehalten</option>
            </select>
          </div>

          {/* Bitrate */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Video-Bitrate (-b:v)
            </label>
            <select
              value={batchBitrate}
              onChange={(e) => setBatchBitrate(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="2500k">2.500 kbps (Kompakt / Web)</option>
              <option value="4500k">4.500 kbps (Standard 1080p)</option>
              <option value="8000k">8.000 kbps (Hohe Qualität)</option>
              <option value="12000k">12.000 kbps (Archiv / Broadcast)</option>
            </select>
          </div>

          {/* Container */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Container-Format
            </label>
            <select
              value={batchContainer}
              onChange={(e) => setBatchContainer(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="mp4">MP4 (.mp4 - Standard)</option>
              <option value="mkv">MKV (.mkv - Matroska)</option>
              <option value="webm">WebM (.webm - Web)</option>
              <option value="avi">AVI (.avi - Legacy)</option>
            </select>
          </div>

          {/* Video Codec */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              Video-Codec (-c:v)
            </label>
            <select
              value={batchCodec}
              onChange={(e) => setBatchCodec(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="libx264">H.264 (libx264 - Höchste Kompatibilität)</option>
              <option value="libx265">H.265 / HEVC (libx265 - Beste Kompression)</option>
              <option value="libvpx-vp9">VP9 (libvpx-vp9 - WebM Standard)</option>
              <option value="av1">AV1 (Next-Gen Open Codec)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-orange-600" />
            ffmpeg -i input.{batchContainer} -s {batchResolution} -b:v {batchBitrate} -c:v {batchCodec} output.{batchContainer}
          </div>

          <button
            type="button"
            onClick={handleApplyBatchConfig}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
          >
            Auf alle anstehenden Videos anwenden
          </button>
        </div>
      </div>

      {/* 3. VIDEO QUEUE PIPELINE LIST */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="text-sm font-display font-bold text-slate-900">
            Aktive Video-Warteschlange ({videoQueue.length})
          </h3>

          <form onSubmit={handleAddVideo} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Video-Dateiname hinzufügen..."
              value={newVideoName}
              onChange={(e) => setNewVideoName(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-orange-500 w-60"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Hinzufügen
            </button>
          </form>
        </div>

        {/* Video Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="pb-2.5 font-semibold">Video-Datei</th>
                <th className="pb-2.5 font-semibold">Status</th>
                <th className="pb-2.5 font-semibold">Auflösung</th>
                <th className="pb-2.5 font-semibold">Bitrate</th>
                <th className="pb-2.5 font-semibold">Codec / Format</th>
                <th className="pb-2.5 font-semibold">Fortschritt</th>
                <th className="pb-2.5 font-semibold text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videoQueue.map((item) => {
                // Color badges according to requirement
                const statusBadge =
                  item.status === 'Completed' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Completed
                    </span>
                  ) : item.status === 'Processing' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                      Processing
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Pending
                    </span>
                  );

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-medium text-slate-900 flex items-center gap-2">
                      <FileVideo className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[220px]" title={item.filename}>
                        {item.filename}
                      </span>
                    </td>
                    <td className="py-3">{statusBadge}</td>
                    <td className="py-3 font-mono text-slate-600 tabular-nums">
                      {item.outputResolution}
                    </td>
                    <td className="py-3 font-mono text-slate-600 tabular-nums">
                      {item.bitrate}
                    </td>
                    <td className="py-3 text-slate-600 uppercase font-mono text-[11px]">
                      {item.codec} ({item.container})
                    </td>
                    <td className="py-3">
                      <div className="w-28 space-y-1">
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              item.status === 'Completed'
                                ? 'bg-emerald-500'
                                : item.status === 'Processing'
                                ? 'bg-blue-500'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 tabular-nums">
                          {item.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Aus Warteschlange entfernen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
