import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import rvgData from "./rvg.json";

const THEMES = {
  light: { bg: "#F5F0E8", surface: "#EDE8DC", card: "#D9CFC0", accent: "#6B3D2E", text: "#3B2519", muted: "#8C6E58", border: "#C4B49A" },
  dark:  { bg: "#1E120C", surface: "#2A1A10", card: "#3B2519", accent: "#C8956C", text: "#F5F0E8", muted: "#A08070", border: "#4A3020" }
};

export default function App() {
  const [themeMode, setThemeMode]       = useState("light");
  const [tab, setTab]                   = useState("home");
  const [lookupStep, setLookupStep]     = useState("book");
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerses, setSelectedVerses]   = useState([]);
  const [verseIdx, setVerseIdx]         = useState(0);

  const T = THEMES[themeMode];

  // ── Bible engine ────────────────────────────────────────────────────────────
  const bibleMenu = useMemo(() => {
    if (!rvgData || !Array.isArray(rvgData.verses)) return [];
    const booksMap = {};
    rvgData.verses.forEach(v => {
      if (!booksMap[v.book_name]) booksMap[v.book_name] = new Set();
      booksMap[v.book_name].add(v.chapter);
    });
    return Object.keys(booksMap).map(bookName => ({
      name: bookName,
      chaptersCount: booksMap[bookName].size
    }));
  }, []);

  const currentChapterVerses = useMemo(() => {
    if (!selectedBook || !rvgData || !Array.isArray(rvgData.verses)) return [];
    return rvgData.verses.filter(
      v => v.book_name === selectedBook && v.chapter === selectedChapter
    );
  }, [selectedBook, selectedChapter]);

  const getLocalVerseText = (verseNum) => {
    const match = currentChapterVerses.find(v => v.verse === Number(verseNum));
    return match ? match.text : `[Versículo ${verseNum} no disponible]`;
  };

  const toggleVerseSelection = (vNum) => {
    setSelectedVerses(prev =>
      prev.includes(vNum) ? prev.filter(x => x !== vNum) : [...prev, vNum].sort((a, b) => a - b)
    );
  };

  const F = {
    body:    "clamp(20px, 7vw, 32px)",   // main reading / button text
    small:   "clamp(14px, 4.5vw, 22px)", // labels, counter, nav labels
    heading: "clamp(22px, 7.5vw, 34px)", // page headings
    verseRef:"clamp(18px, 6vw, 30px)",   // "Book Ch:V" header in display
    verse:   "clamp(20px, 7vw, 32px)",   // verse body text
    gridNum: "clamp(16px, 5.5vw, 26px)", // chapter/verse number grid
    bookBtn: "clamp(17px, 5.5vw, 26px)",   // book name buttons (long names, 2-col)
  };

  const s = {
    app: {
      background: T.bg,
      color: T.text,
      fontFamily: "'Ribeye', sans-serif",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      margin: 0,
      position: "relative",
      boxSizing: "border-box",
      overflowX: "hidden",
    },
    screen: {
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      padding: "16px 10px 90px",
      boxSizing: "border-box",
      width: "100%",
    },
    card: {
      background: T.surface,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: "14px 12px",
      marginBottom: 12,
      fontFamily: "inherit",
      boxSizing: "border-box",
    },

    bookBtn: (active) => ({
      background: active ? T.accent : T.card,
      color: active ? "#FFF5EC" : T.text,
      border: `1px solid ${active ? T.accent : T.border}`,
      borderRadius: 12,
      padding: "14px 6px",
      fontSize: F.bookBtn,
      cursor: "pointer",
      fontWeight: active ? "700" : "400",
      boxSizing: "border-box",
      fontFamily: "inherit",
      width: "100%",
      lineHeight: 1.3,
      wordBreak: "break-word",
    }),

    numBtn: (active) => ({
      background: active ? T.accent : T.card,
      color: active ? "#FFF5EC" : T.text,
      border: `1px solid ${active ? T.accent : T.border}`,
      borderRadius: 10,
      padding: "12px 2px",
      fontSize: F.gridNum,
      cursor: "pointer",
      fontWeight: active ? "700" : "400",
      boxSizing: "border-box",
      fontFamily: "inherit",
      width: "100%",
      textAlign: "center",
    }),
    btn: (variant = "primary") => ({
      background: variant === "primary" ? T.accent : T.surface,
      color: variant === "primary" ? "#FFF5EC" : T.text,
      border: `1px solid ${variant === "primary" ? T.accent : T.border}`,
      borderRadius: 12,
      padding: "14px 12px",
      fontSize: F.body,
      cursor: "pointer",
      fontWeight: 600,
      width: "100%",
      marginBottom: 10,
      boxSizing: "border-box",
      fontFamily: "inherit",
    }),
    backBtn: {
      marginBottom: 16,
      background: "none",
      border: `2px solid ${T.accent}`,
      color: T.accent,
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: F.body,
      padding: "8px 18px",
      borderRadius: "12px",
      fontFamily: "inherit",
    },
    heading: {
      fontSize: F.heading,
      fontWeight: 700,
      marginBottom: 14,
      fontFamily: "inherit",
      textAlign: "center",
    },
    navBar: {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: T.surface,
      borderTop: `1px solid ${T.border}`,
      display: "flex",
      justifyContent: "space-around",
      padding: "10px 0",
      zIndex: 100,
    },
    navItem: (active) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
      color: active ? T.accent : T.muted,
      fontSize: F.small,
      gap: 4,
      fontFamily: "inherit",
    }),
  };

  return (
    <div style={s.app}>
      <div style={s.screen}>

        {/* ── HOME TAB ── */}
        {tab === "home" && (
          <>
            {/* STEP 1: BOOK */}
            {lookupStep === "book" && (
              <div>
                <div style={s.heading}>Selecciona un Libro</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {bibleMenu.map(b => (
                    <button key={b.name} style={s.bookBtn(false)}
                      onClick={() => { setSelectedBook(b.name); setLookupStep("chapter"); }}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: CHAPTER */}
            {lookupStep === "chapter" && (
              <div>
                <button style={s.backBtn} onClick={() => setLookupStep("book")}>← Libros</button>
                <div style={s.heading}>{selectedBook}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {Array.from({ length: bibleMenu.find(b => b.name === selectedBook)?.chaptersCount || 1 }, (_, i) => i + 1).map(ch => (
                    <button key={ch} style={s.numBtn(false)}
                      onClick={() => { setSelectedChapter(ch); setSelectedVerses([]); setLookupStep("verse"); }}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: VERSES */}
            {lookupStep === "verse" && (
              <div>
                <button style={s.backBtn} onClick={() => setLookupStep("chapter")}>← Capítulos</button>
                <div style={s.heading}>{selectedBook} {selectedChapter}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
                  {currentChapterVerses.map(v => (
                    <button key={v.verse} style={s.numBtn(selectedVerses.includes(v.verse))}
                      onClick={() => toggleVerseSelection(v.verse)}>
                      {v.verse}
                    </button>
                  ))}
                </div>
                <button style={{ ...s.btn(), opacity: selectedVerses.length === 0 ? 0.4 : 1 }}
                  disabled={selectedVerses.length === 0}
                  onClick={() => { setVerseIdx(0); setLookupStep("display"); }}>
                  Leer {selectedVerses.length > 0 ? `${selectedVerses.length} Versículo(s)` : "Versículos"}
                </button>
              </div>
            )}

            {/* STEP 4: DISPLAY */}
            {lookupStep === "display" && (
              <div>
                {/* Header row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <button style={s.backBtn} onClick={() => setLookupStep("book")}>✕ Cerrar</button>
                  <div style={{ fontWeight: "700", fontSize: F.verseRef, flex: 1, textAlign: "center" }}>
                    {selectedBook} {selectedChapter}:{selectedVerses[verseIdx]}
                  </div>
                  <div style={{ minWidth: 70 }} />
                </div>

                {/* Verse text */}
                <div style={{
                  ...s.card,
                  fontSize: F.verse,
                  minHeight: 180,
                  display: "flex",
                  alignItems: "center",
                  lineHeight: 1.65,
                  textAlign: "left",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}>
                  {getLocalVerseText(selectedVerses[verseIdx])}
                </div>

                {/* Nav arrows */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button style={{ ...s.btn("secondary"), opacity: verseIdx === 0 ? 0.4 : 1 }}
                    disabled={verseIdx === 0} onClick={() => setVerseIdx(v => v - 1)}>
                    ← Anterior
                  </button>
                  <button style={{ ...s.btn(), opacity: verseIdx === selectedVerses.length - 1 ? 0.4 : 1 }}
                    disabled={verseIdx === selectedVerses.length - 1} onClick={() => setVerseIdx(v => v + 1)}>
                    Siguiente →
                  </button>
                </div>

                {/* Counter */}
                <div style={{ textAlign: "center", color: T.muted, fontSize: F.small, marginTop: 4 }}>
                  Versículo {verseIdx + 1} de {selectedVerses.length}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── SETTINGS TAB ── */}
        {tab === "settings" && (
          <div>
            <div style={s.heading}>Configuración</div>
            <div style={s.card}>
              <div style={{ marginBottom: 12, fontSize: F.small, color: T.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Apariencia del Tema
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button style={s.numBtn(themeMode === "light")} onClick={() => setThemeMode("light")}>☀ Claro</button>
                <button style={s.numBtn(themeMode === "dark")}  onClick={() => setThemeMode("dark")}>☾ Oscuro</button>
              </div>
            </div>
            <div style={s.card}>
              <div style={{ fontSize: F.body, fontWeight: "bold" }}>Estructura de Datos Local</div>
              <div style={{ fontSize: F.small, color: T.muted, marginTop: 4 }}>
                {rvgData?.metadata?.name || "Cargada"} ({rvgData?.metadata?.year || "2023"})
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── NAV BAR ── */}
      <div style={s.navBar}>
        <div style={s.navItem(tab === "home")} onClick={() => { setTab("home"); setLookupStep("book"); }}>
          <span style={{ fontSize: F.body }}>⌂</span>
          <span style={{ fontSize: F.small }}>Lectura</span>
        </div>
        <div style={s.navItem(tab === "settings")} onClick={() => setTab("settings")}>
          <span style={{ fontSize: F.body }}>⚙</span>
          <span style={{ fontSize: F.small }}>Ajustes</span>
        </div>
      </div>
    </div>
  );
}