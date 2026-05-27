import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import rvgData from "./rvg.json"; 

const THEMES = {
  light: { bg: "#F5F0E8", surface: "#EDE8DC", card: "#D9CFC0", accent: "#6B3D2E", text: "#3B2519", muted: "#8C6E58", border: "#C4B49A" },
  dark: { bg: "#1E120C", surface: "#2A1A10", card: "#3B2519", accent: "#C8956C", text: "#F5F0E8", muted: "#A08070", border: "#4A3020" }
};

export default function App() {
  const [themeMode, setThemeMode] = useState("light");
  const [tab, setTab] = useState("home");
  const [lookupStep, setLookupStep] = useState("book"); // book | chapter | verse | display
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [verseIdx, setVerseIdx] = useState(0);

  const T = THEMES[themeMode];

  // 1. DYNAMIC BIBLE ENGINE: Auto-scans file structure to generate book indices and true counts
  const bibleMenu = useMemo(() => {
    if (!rvgData || !Array.isArray(rvgData.verses)) return [];
    
    const booksMap = {};
    rvgData.verses.forEach(v => {
      if (!booksMap[v.book_name]) {
        booksMap[v.book_name] = new Set();
      }
      booksMap[v.book_name].add(v.chapter);
    });

    return Object.keys(booksMap).map(bookName => ({
      name: bookName,
      chaptersCount: booksMap[bookName].size
    }));
  }, []);

  // 2. DYNAMIC VERSE COUNTER: Extracts exactly how many verses exist in the selected target chapter
  const currentChapterVerses = useMemo(() => {
    if (!selectedBook || !rvgData || !Array.isArray(rvgData.verses)) return [];
    return rvgData.verses.filter(
      v => v.book_name === selectedBook && v.chapter === selectedChapter
    );
  }, [selectedBook, selectedChapter]);

  // 3. SECURE LOCAL LOOKUP ENGINE
  const getLocalVerseText = (bookName, chapterNum, verseNum) => {
    const match = currentChapterVerses.find(v => v.verse === Number(verseNum));
    return match ? match.text : `[Versículo ${verseNum} no disponible]`;
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
      overflowX: "hidden" ,
      maxWidth: "100%"
    },
    screen: { 
      flex: 1, 
      overflowY: "auto", 
      overflowX: "hidden",
      padding: "16px 8px 90px",
      boxSizing: "border-box",
      width: "100%"
    },
    card: { 
      background: T.surface, 
      border: `1px solid ${T.border}`, 
      borderRadius: 16, 
      padding: 15, 
      marginBottom: 12, 
      fontFamily: "inherit",
      boxSizing: "border-box" 
    },
    gridBtn: (active) => ({ 
      background: active ? T.accent : T.card, 
      color: active ? "#FFF5EC" : T.text, 
      border: `1px solid ${active ? T.accent : T.border}`, 
      borderRadius: 12, 
      padding: "16px 4px", 
      fontSize: "2rem", 
      cursor: "pointer", 
      fontWeight: active ? "700" : "400", 
      boxSizing: "border-box",
      fontFamily: "inherit",
      width: "100%"
    }),
    btn: (variant = "primary") => ({ 
      background: variant === "primary" ? T.accent : T.surface, 
      color: variant === "primary" ? "#FFF5EC" : T.text, 
      border: `1px solid ${variant === "primary" ? T.accent : T.border}`, 
      borderRadius: 12, 
      padding: "16px", 
      fontSize: "2rem", 
      cursor: "pointer", 
      fontWeight: 600, 
      width: "100%", 
      marginBottom: 10,
      boxSizing: "border-box",
      fontFamily: "inherit" 
    }),
    heading: { 
      fontSize: "2rem", 
      fontWeight: 700, 
      marginBottom: 12, 
      fontFamily: "inherit",
      textAlign: "center" 
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
      zIndex: 100 
    },
    navItem: (active) => ({ 
      display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", color: active ? T.accent : T.muted, fontSize: "2rem", gap: 4, fontFamily: "inherit" 
    })
  };

  const toggleVerseSelection = (vNum) => {
    setSelectedVerses(prev => 
      prev.includes(vNum) ? prev.filter(x => x !== vNum) : [...prev, vNum].sort((a, b) => a - b)
    );
  };

  return (
    <div style={s.app}>
      <div style={s.screen}>
        
        {tab === "home" && (
          <>
            {/* STEP 1: CHOOSE BOOK */}
            {lookupStep === "book" && (
              <div>
                <div style={s.heading}>Selecciona un Libro</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {bibleMenu.map(b => (
                    <button key={b.name} style={s.gridBtn(false)} onClick={() => { setSelectedBook(b.name); setLookupStep("chapter"); }}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: CHOOSE CHAPTER */}
            {lookupStep === "chapter" && (
              <div>
                <button 
                  style={{ 
                    marginBottom: 20, 
                    background: "none", 
                    border: "2px solid", 
                    borderColor: T.accent, 
                    color: T.accent, 
                    cursor: "pointer", 
                    fontWeight: "bold", 
                    fontSize: "2rem", 
                    padding: "10px 20px",
                    borderRadius: "12px"
                  }} 
                  onClick={() => setLookupStep("book")}
                >
                  ← Libros
                </button>
                <div style={s.heading}>{selectedBook} - Capítulos</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                  {Array.from({ length: bibleMenu.find(b => b.name === selectedBook)?.chaptersCount || 1 }, (_, i) => i + 1).map(ch => (
                    <button key={ch} style={s.gridBtn(false)} onClick={() => { setSelectedChapter(ch); setSelectedVerses([]); setLookupStep("verse"); }}>
                      {ch}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: CHOOSE VERSES */}
            {lookupStep === "verse" && (
              <div>
                  <button 
                  style={{ 
                    marginBottom: 20, 
                    background: "none", 
                    border: "2px solid", 
                    borderColor: T.accent, 
                    color: T.accent, 
                    cursor: "pointer", 
                    fontWeight: "bold", 
                    fontSize: "2rem", 
                    padding: "10px 20px", 
                    borderRadius: "12px"
                  }} 
                  onClick={() => setLookupStep("book")}
                >
                  ← Capítulos
                </button>
                <div style={s.heading}>{selectedBook} {selectedChapter}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginBottom: 20 }}>
                  {currentChapterVerses.map(v => (
                    <button key={v.verse} style={s.gridBtn(selectedVerses.includes(v.verse))} onClick={() => toggleVerseSelection(v.verse)}>
                      {v.verse}
                    </button>
                  ))}
                </div>
                <button style={s.btn()} disabled={selectedVerses.length === 0} onClick={() => { setVerseIdx(0); setLookupStep("display"); }}>
                  Leer {selectedVerses.length} Versículo(s)
                </button>
              </div>
            )}

            {/* STEP 4: CAROUSEL DISPLAY */}
            {lookupStep === "display" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <button 
                    style={{ 
                      marginBottom: 20, 
                      background: "none", 
                      border: "2px solid", 
                      borderColor: T.accent, 
                      color: T.accent, 
                      cursor: "pointer", 
                      fontWeight: "bold", 
                      fontSize: "2rem", 
                      padding: "10px 20px", 
                      borderRadius: "12px"
                    }} 
                    onClick={() => setLookupStep("book")}
                  >
                    ✕ Cerrar
                  </button>
                  <div style={{ fontWeight: "700", fontSize: 32 }}>{selectedBook} {selectedChapter}:{selectedVerses[verseIdx]}</div>
                  <div style={{ width: 45 }}></div>
                </div>
                
                <div style={{ ...s.card, fontSize: 32, minHeight: 180, display: "flex", alignItems: "center", lineHeight: "1.6", textAlign: "left" }}>
                  {getLocalVerseText(selectedBook, selectedChapter, selectedVerses[verseIdx])}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button style={s.btn("secondary")} disabled={verseIdx === 0} onClick={() => setVerseIdx(v => v - 1)}>← Anterior</button>
                  <button style={s.btn()} disabled={verseIdx === selectedVerses.length - 1} onClick={() => setVerseIdx(v => v + 1)}>Siguiente →</button>
                </div>
                <div style={{ textAlign: "center", color: T.muted, fontSize: 32, marginTop: 4 }}>
                  Versículo {verseIdx + 1} de {selectedVerses.length}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: CONFIGURATION */}
        {tab === "settings" && (
          <div>
            <div style={s.heading}>Configuración</div>
            <div style={s.card}>
              <div style={{ marginBottom: 12, fontSize: 32, color: T.muted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Apariencia del Tema</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button style={s.gridBtn(themeMode === "light")} onClick={() => setThemeMode("light")}>☀ Claro</button>
                <button style={s.gridBtn(themeMode === "dark")} onClick={() => setThemeMode("dark")}>☾ Oscuro</button>
              </div>
            </div>
            <div style={s.card}>
              <div style={{ fontSize: 32, fontWeight: "bold" }}>Estructura de Datos Local</div>
              <div style={{ fontSize: 28, color: T.muted, marginTop: 4 }}>{rvgData?.metadata?.name || "Cargada"} ({rvgData?.metadata?.year || "2023"})</div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER BAR */}
      <div style={s.navBar}>
        <div style={s.navItem(tab === "home")} onClick={() => { setTab("home"); setLookupStep("book"); }}>
          <span style={{ fontSize: 32 }}>⌂</span>
          <span>Lectura</span>
        </div>
        <div style={s.navItem(tab === "settings")} onClick={() => setTab("settings")}>
          <span style={{ fontSize: 32 }}>⚙</span>
          <span>Ajustes</span>
        </div>
      </div>
    </div>
  );
}