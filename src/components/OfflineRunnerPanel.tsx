import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, Cpu, Play, Sparkles } from 'lucide-react';

export const OFFLINE_PYTHON_SCRIPT = `#!/usr/bin/env python3
"""
Worksheet & Vision AI Pipeline (Offline mit LM Studio / Ollama / Local LLM)
--------------------------------------------------------------------------
Kompatibel mit:
- LM Studio (Local Inference Server: http://localhost:1234/v1)
- Google Gemma 4 e4b / e2b (sowie gemma-2, llama-3, qwen-2.5-vl)
- Python 3.9+ (mit requests / reportlab / Pillow)

Funktionen:
1. Analysiert Buchseiten/Arbeitsblätter offline über die lokale LM-Studio-API.
2. Extrahiert Aufgaben, bereinigt Handschrift und generiert druckfertige PDF-Dateien.
3. Enthält auch eine direkte Standalone-PDF-Generierung für 'Dividieren mit Rest' (Seite 22).
"""

import sys
import os
import json
import base64
import argparse
from typing import Optional, Dict, Any

try:
    import requests
except ImportError:
    print("[Hinweis] Bitte installiere requests: pip install requests")

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.pdfgen import canvas
except ImportError:
    print("[Hinweis] Fuer PDF-Generierung: pip install reportlab pillow")


LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
DEFAULT_MODEL = "google/gemma-4-e4b"  # oder "google/gemma-4-e2b"


def encode_image_base64(image_path: str) -> str:
    """Liest ein Bild ein und konvertiert es nach Base64."""
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"Bilddatei nicht gefunden: {image_path}")
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def query_lm_studio(
    prompt: str,
    image_path: Optional[str] = None,
    server_url: str = LM_STUDIO_URL,
    model_name: str = DEFAULT_MODEL,
    temperature: float = 0.2
) -> str:
    """
    Sendet eine Anfrage an den lokalen OpenAI-kompatiblen Server von LM Studio.
    Unterstuetzt sowohl reinen Text als auch Vision (Base64-Bilder).
    """
    content = []
    
    if image_path:
        b64 = encode_image_base64(image_path)
        ext = os.path.splitext(image_path)[1].lower().replace(".", "")
        mime = f"image/{ext if ext != 'jpg' else 'jpeg'}"
        content.append({
            "type": "image_url",
            "image_url": {
                "url": f"data:{mime};base64,{b64}"
            }
        })
    
    content.append({
        "type": "text",
        "text": prompt
    })

    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Du bist ein praeziser didaktischer Mathe-Assistent und OCR-Spezialist. "
                    "Analysiere Schulbuchseiten, entferne handschriftliche Loesungen und "
                    "strukturiere Aufgaben sauber als strukturierte Uebungsblaetter."
                )
            },
            {
                "role": "user",
                "content": content
            }
        ],
        "temperature": temperature,
        "max_tokens": 2048
    }

    try:
        response = requests.post(server_url, json=payload, timeout=120)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except requests.exceptions.ConnectionError:
        return (
            "[FEHLER] Verbindung zu LM Studio fehlgeschlagen!\\n"
            "Stelle sicher, dass in LM Studio der lokale Server gestartet ist:\\n"
            "1. LM Studio oeffnen -> Reiter '<-> Local Server' links anklicken\\n"
            "2. Modell (z.B. google/gemma-4-e4b) laden\\n"
            "3. 'Start Server' druecken (Standard: Port 1234)"
        )
    except Exception as e:
        return f"[FEHLER] Anfrage fehlgeschlagen: {e}"


def generate_clean_worksheet_pdf(output_filename: str = "Arbeitsblatt_Dividieren_mit_Rest_S22.pdf"):
    """
    Erzeugt eigenstaendig ein sauberes, handschriftfreies DIN-A4 PDF
    der Buchseite 22 ('Dividieren mit Rest') ohne externe Web-Abhaengigkeiten.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors
    except ImportError:
        print("[FEHLER] reportlab ist nicht installiert. Führe aus: pip install reportlab")
        return

    c = canvas.Canvas(output_filename, pagesize=A4)
    width, height = A4  # 595.27 x 841.89 pt (~210 x 297 mm)

    # 1. Orange Kopf-Banner
    c.setFillColor(colors.HexColor("#D66840"))
    c.rect(34, height - 60, width - 68, 38, fill=1, stroke=0)
    c.rect(46, height - 68, 34, 8, fill=1, stroke=0)
    c.rect(58, height - 76, 12, 8, fill=1, stroke=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(68, height - 42, "Dividieren mit Rest")

    # 2. Aufgabe 1 Badge
    c.setFillColor(colors.HexColor("#F6B48E"))
    c.rect(50, height - 105, 18, 18, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#7C2D12"))
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(59, height - 98, "1")

    # Aufgaben 1a, 1b, 1c Text
    c.setFillColor(colors.HexColor("#1E293B"))
    c.setFont("Helvetica", 10)
    
    # 1a
    c.drawString(320, height - 100, "a) 32 Karten sollen gerecht")
    c.drawString(335, height - 114, "an fünf Kinder verteilt werden.")
    c.drawString(335, height - 128, "F: Wie viele Karten erhält jedes Kind?")
    c.drawString(335, height - 142, "L: 32 : 5 = ______ R ______")
    c.drawString(335, height - 156, "A: ______ Karten erhält jedes Kind.")
    c.drawString(350, height - 170, "______ Karten bleiben übrig.")

    # 1b
    c.drawString(80, height - 200, "b) 32 Karten sollen gerecht")
    c.drawString(95, height - 214, "an sechs Kinder verteilt werden.")
    c.drawString(95, height - 228, "F: Wie viele Karten erhält jedes Kind?")
    c.drawString(95, height - 242, "L: 32 : 6 = ______ R ______")
    c.drawString(95, height - 256, "A: ______ Karten erhält jedes Kind.")
    c.drawString(110, height - 270, "______ Karten bleiben übrig.")

    # 1c
    c.drawString(320, height - 200, "c) 32 Karten sollen gerecht")
    c.drawString(335, height - 214, "an sieben Kinder verteilt werden.")
    c.drawString(335, height - 228, "F: Wie viele Karten erhält jedes Kind?")
    c.drawString(335, height - 242, "L: 32 : 7 = ______ R ______")
    c.drawString(335, height - 256, "A: ______ Karten erhält jedes Kind.")
    c.drawString(350, height - 270, "______ Karten bleiben übrig.")

    # 3. Aufgabe 2 Badge & Päckchen
    c.setFillColor(colors.HexColor("#F6B48E"))
    c.rect(50, height - 310, 18, 18, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#7C2D12"))
    c.drawCentredString(59, height - 303, "2")
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(78, height - 303, "Rechnet. Seht euch jedes Päckchen genau an. Was stellt ihr fest?")

    packs_2 = [
        ("a)", 80, ["27 : 5 = ___ R ___", "28 : 5 = ___ R ___", "29 : 5 = ___ R ___"]),
        ("b)", 240, [" 9 : 3 = ___ R ___", "10 : 3 = ___ R ___", "11 : 3 = ___ R ___"]),
        ("c)", 400, ["14 : 6 = ___ R ___", "15 : 6 = ___ R ___", "16 : 6 = ___ R ___"]),
    ]
    for label, px, eqs in packs_2:
        c.drawString(px, height - 325, label)
        for idx, eq in enumerate(eqs):
            c.drawString(px + 20, height - 325 - (idx * 16), eq)

    # 4. Aufgabe 3
    c.setFillColor(colors.HexColor("#DB6D47"))
    c.rect(50, height - 390, 18, 18, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.drawCentredString(59, height - 383, "3")

    packs_3 = [
        ("a)", 80, [" 9 : 2 = ___ R ___", "15 : 2 = ___ R ___", "21 : 2 = ___ R ___"]),
        ("b)", 240, ["18 : 4 = ___ R ___", "21 : 4 = ___ R ___", "39 : 4 = ___ R ___"]),
        ("c)", 400, ["17 : 8 = ___ R ___", "59 : 8 = ___ R ___", "51 : 8 = ___ R ___"]),
    ]
    for label, px, eqs in packs_3:
        c.drawString(px, height - 383, label)
        for idx, eq in enumerate(eqs):
            c.drawString(px + 20, height - 383 - (idx * 16), eq)

    # 5. Aufgabe 4 Kärtchen & Säcke
    c.setFillColor(colors.HexColor("#DB6D47"))
    c.rect(50, height - 460, 18, 18, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.drawCentredString(59, height - 453, "4")
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(78, height - 453, "Bei welchen Aufgaben bleibt der Rest 2, 3 oder 4?")
    c.drawString(78, height - 467, "Male die Aufgabenkärtchen in der richtigen Farbe an.")

    # Kärtchen zeichnen
    cards_row1 = ["40 : 6", "51 : 7", "75 : 9", "19 : 4"]
    for idx, card in enumerate(cards_row1):
        cx = 78 + (idx * 68)
        c.setStrokeColor(colors.HexColor("#64748B"))
        c.rect(cx, height - 495, 54, 18, fill=0, stroke=1)
        c.drawString(cx + 10, height - 483, card)

    # Säcke (Rest 2, Rest 3, Rest 4)
    sacks = [
        (380, "#C84B31", "Rest 2"),
        (430, "#5B7DB1", "Rest 3"),
        (480, "#538D4E", "Rest 4")
    ]
    for sx, col, label in sacks:
        c.setFillColor(colors.HexColor(col))
        c.circle(sx + 15, height - 475, 14, fill=1, stroke=1)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(sx + 15, height - 478, label)

    cards_row2 = ["23 : 3", "54 : 10", "45 : 6", "58 : 7", "50 : 8", "31 : 9"]
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.HexColor("#1E293B"))
    for idx, card in enumerate(cards_row2):
        cx = 78 + (idx * 66)
        c.rect(cx, height - 525, 54, 18, fill=0, stroke=1)
        c.drawString(cx + 10, height - 513, card)

    # 6. Aufgabe 5 Zahlenrätsel
    c.setFillColor(colors.HexColor("#DB6D47"))
    c.rect(50, height - 570, 18, 18, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.drawCentredString(59, height - 563, "5")
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(78, height - 563, "Zahlenrätsel. Wie heißen die Zahlen?")
    c.drawString(78, height - 580, "a) Meine Zahl gehört zur Neuner-Reihe. Wenn du sie durch 8 dividierst, bleibt als Rest 3.")
    c.drawString(95, height - 595, "Meine Zahl heißt __________.")

    c.drawString(78, height - 615, "b) Meine Zahlen gehören zur Sechser-Reihe. Wenn du sie durch 8 dividierst, bleibt als Rest 4.")
    c.drawString(95, height - 630, "Meine Zahlen heißen __________, __________, __________.")

    # 7. Aufgabe 6
    c.setFillColor(colors.HexColor("#DB6D47"))
    c.rect(50, height - 665, 18, 18, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.drawCentredString(59, height - 658, "6")
    c.setFillColor(colors.HexColor("#1E293B"))
    c.drawString(78, height - 658, "Schreibe ein eigenes Zahlenrätsel auf ein Blatt. Ein anderes Kind löst es. Vergleicht.")

    # Fußzeile
    c.setFont("Helvetica-Bold", 12)
    c.drawString(34, 30, "22")
    c.setFont("Helvetica", 8)
    c.drawString(60, 30, "› 6 Zahlenrätsel in der Klasse sammeln und vergleichen.")
    c.drawRightString(width - 34, 30, "› zu Schulbuch-Seite 30")

    c.showPage()
    c.save()
    print(f"[ERFOLG] Arbeitsblatt-PDF erfolgreich generiert: {output_filename}")


def generate_universal_pdf_from_json(doc_data: Dict[str, Any], output_filename: str):
    """
    Erzeugt dynamisch ein sauberes DIN-A4 PDF aus der von Gemma-4 / LM Studio
    extrahierten JSON-Struktur eines beliebigen Arbeitsblatt-Scans.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors
    except ImportError:
        print("[FEHLER] reportlab nicht installiert: pip install reportlab")
        return

    c = canvas.Canvas(output_filename, pagesize=A4)
    width, height = A4

    title = str(doc_data.get("title", "Arbeitsblatt"))
    page_num = str(doc_data.get("pageNumber", ""))
    theme_hex = str(doc_data.get("themeColor", "#D66840"))
    if not theme_hex.startswith("#") or len(theme_hex) != 7:
        theme_hex = "#D66840"

    # Kopf-Banner
    c.setFillColor(colors.HexColor(theme_hex))
    c.rect(34, height - 60, width - 68, 38, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(54, height - 45, title)

    cur_y = height - 95
    tasks = doc_data.get("tasks", [])
    for idx, t in enumerate(tasks):
        if cur_y < 90:
            c.showPage()
            cur_y = height - 60

        num = str(t.get("taskNumber", idx + 1))
        c.setFillColor(colors.HexColor(theme_hex))
        c.rect(42, cur_y - 4, 18, 18, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(51, cur_y + 1, num)

        c.setFillColor(colors.HexColor("#1E293B"))
        c.setFont("Helvetica-Bold", 10)
        t_title = str(t.get("title", ""))
        if t_title:
            c.drawString(68, cur_y + 1, t_title)
            cur_y -= 16

        c.setFont("Helvetica", 10)
        for sub in t.get("subtasks", []) or []:
            lbl = str(sub.get("label", ""))
            lines = sub.get("storyLines", []) or []
            c.drawString(68, cur_y, f"{lbl} {' '.join(lines)}")
            cur_y -= 14
            if sub.get("question"):
                c.drawString(82, cur_y, str(sub["question"]))
                cur_y -= 14
            if sub.get("equationPrefix"):
                c.drawString(82, cur_y, f"{sub['equationPrefix']} ______ R ______")
                cur_y -= 14
            cur_y -= 4

        cols = t.get("equationColumns", []) or []
        if cols:
            max_rows = 0
            for c_idx, col in enumerate(cols[:3]):
                px = 68 + c_idx * 165
                c.drawString(px, cur_y, str(col.get("label", "")))
                items = col.get("items", []) or []
                if len(items) > max_rows:
                    max_rows = len(items)
                for r_idx, eq in enumerate(items):
                    ey = cur_y - (r_idx * 15)
                    expr = str(eq.get("expressionLeft", ""))
                    suffix = " ___ R ___" if eq.get("hasRemainder") else " ______"
                    c.drawString(px + 18, ey, f"{expr}{suffix}")
            cur_y -= (max_rows * 15 + 12)

        for rid in t.get("riddles", []) or []:
            c.drawString(68, cur_y, f"{rid.get('label', '')} {' '.join(rid.get('lines', []))}")
            cur_y -= 14
            c.drawString(82, cur_y, f"{rid.get('answerPrefix', 'Antwort:')} ____________.")
            cur_y -= 18

        cur_y -= 10

    if page_num:
        c.setFont("Helvetica-Bold", 11)
        c.drawString(34, 30, page_num)

    c.showPage()
    c.save()
    print(f"[ERFOLG] Universelles Arbeitsblatt-PDF gespeichert: {output_filename}")


def main():
    parser = argparse.ArgumentParser(
        description="Offline-Tool für Mathe-Arbeitsblätter & Gemma-4 (LM Studio)"
    )
    parser.add_argument(
        "--generate-pdf",
        action="store_true",
        help="Erzeugt sofort die bereinigte PDF 'Arbeitsblatt_Dividieren_mit_Rest_S22.pdf'"
    )
    parser.add_argument(
        "--output",
        default="Arbeitsblatt_Bereinigt.pdf",
        help="Dateiname für den PDF-Export"
    )
    parser.add_argument(
        "--analyze-page",
        type=str,
        help="Pfad zu einem beliebigen Scan/Foto zur Analyse & PDF-Erzeugung via LM Studio / Gemma-4"
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Modell-Identifier in LM Studio (Standard: {DEFAULT_MODEL} oder google/gemma-4-e2b)"
    )
    parser.add_argument(
        "--url",
        default=LM_STUDIO_URL,
        help="Lokaler API-Endpoint von LM Studio"
    )

    args = parser.parse_args()

    print("===================================================================")
    print("  MatheBlatt & Vision Studio (Offline LM Studio + Gemma 4 Runner)  ")
    print("===================================================================")

    if args.analyze_page:
        print(f"[1/2] Sende Scan '{args.analyze_page}' an LM Studio ({args.model})...")
        prompt = (
            "Extrahiere alle Aufgaben dieser Buchseite ohne handschriftliche Loesungen als JSON "
            "mit den Schluesseln: title, pageNumber, themeColor, tasks (taskNumber, title, type, "
            "subtasks, equationColumns, riddles). Antworte NUR mit validem JSON."
        )
        result = query_lm_studio(
            prompt=prompt,
            image_path=args.analyze_page,
            server_url=args.url,
            model_name=args.model
        )
        print("\\n--- Antwort von Gemma-4 (LM Studio) ---")
        print(result)
        print("---------------------------------------")
        try:
            cleaned = result.strip().removeprefix("\`\`\`json").removeprefix("\`\`\`").removesuffix("\`\`\`").strip()
            parsed = json.loads(cleaned)
            print("[2/2] Erzeuge universelles DIN-A4 PDF aus dem analysierten Scan...")
            generate_universal_pdf_from_json(parsed, args.output)
        except Exception:
            print("[Hinweis] Fallback auf Standard-PDF-Generator...")
            generate_clean_worksheet_pdf(args.output)
    elif args.generate_pdf or len(sys.argv) == 1:
        print("[1/1] Erzeuge bereinigtes Arbeitsblatt DIN-A4 PDF (Seite 22)...")
        generate_clean_worksheet_pdf(args.output)


if __name__ == "__main__":
    main()
`;

export const OfflineRunnerPanel: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(OFFLINE_PYTHON_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([OFFLINE_PYTHON_SCRIPT], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matheblatt_gemma4_runner.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-orange-100 text-orange-700">
              <Cpu className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-display font-bold text-slate-900">
              Offline-Ausführung: Python-Tool & LM Studio (Gemma-4)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Du kannst dieses vollständige Python-Skript direkt auf deinem Rechner ausführen.
            Es kommuniziert lokal mit <strong>LM Studio</strong> über das Modell{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">google/gemma-4-e4b</code> oder{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">google/gemma-4-e2b</code> und
            erzeugt 100 % offline bereinigte DIN-A4 PDFs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Kopiert!' : 'Code kopieren'}
          </button>
          <button
            type="button"
            onClick={handleDownloadPy}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            matheblatt_gemma4_runner.py herunterladen
          </button>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white inline-flex items-center justify-center text-[10px]">
              1
            </span>
            LM Studio starten
          </span>
          <p className="leading-relaxed">
            In LM Studio <strong>gemma-4-e4b</strong> oder <strong>gemma-4-e2b</strong> laden, links auf den Reiter{' '}
            <em>&lt;-&gt; Local Server</em> wechseln und auf <strong>Start Server</strong> (Port 1234) klicken.
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white inline-flex items-center justify-center text-[10px]">
              2
            </span>
            Python-Pakete
          </span>
          <p className="leading-relaxed font-mono text-[11px] bg-white p-1 rounded border border-slate-200 select-all">
            pip install requests reportlab pillow
          </p>
          <p className="text-[11px] text-slate-500">Für lokale PDF-Generierung und Bildverarbeitung.</p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-orange-600 text-white inline-flex items-center justify-center text-[10px]">
              3
            </span>
            Skript ausführen
          </span>
          <p className="leading-relaxed font-mono text-[11px] bg-white p-1 rounded border border-slate-200 select-all">
            python matheblatt_gemma4_runner.py --generate-pdf
          </p>
          <p className="text-[11px] text-slate-500">Erstellt sofort die bereinigte PDF auf deiner Festplatte.</p>
        </div>
      </div>

      {/* Code Preview Box */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 text-slate-200 text-xs font-mono">
        <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-400 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-orange-400" />
            matheblatt_gemma4_runner.py (Eigenständiges Python-Programm)
          </span>
          <span className="text-[10px] text-emerald-400 font-sans font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Offline & Lokal
          </span>
        </div>
        <pre className="p-3.5 max-h-72 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          <code>{OFFLINE_PYTHON_SCRIPT}</code>
        </pre>
      </div>
    </div>
  );
};
