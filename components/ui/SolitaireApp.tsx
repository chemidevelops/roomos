"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Types ─── */
type Suit = "♠" | "♣" | "♥" | "♦";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card { suit: Suit; rank: Rank; faceUp: boolean; }

interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: [Card[], Card[], Card[], Card[]];
  tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]];
  moves: number;
  won: boolean;
}

type PileId =
  | "stock" | "waste"
  | "foundation-0" | "foundation-1" | "foundation-2" | "foundation-3"
  | "tableau-0" | "tableau-1" | "tableau-2" | "tableau-3" | "tableau-4" | "tableau-5" | "tableau-6";

type PileLocation =
  | { type: "stock" }
  | { type: "waste" }
  | { type: "foundation"; index: number }
  | { type: "tableau"; index: number; cardIndex: number };

interface DragState {
  cards: Card[];
  source: PileLocation;
  offsetX: number;
  offsetY: number;
  currentX: number;
  currentY: number;
  cardWidth: number;
  cardHeight: number;
}

/* ─── Constants ─── */
const SUITS: Suit[] = ["♠", "♣", "♥", "♦"];
const RED_SUITS: Suit[] = ["♥", "♦"];
const RANK_LABELS: Record<Rank, string> = {
  1:"A",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",10:"10",11:"J",12:"Q",13:"K",
};

const isRed = (suit: Suit) => RED_SUITS.includes(suit);

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS)
    for (let rank = 1; rank <= 13; rank++)
      deck.push({ suit, rank: rank as Rank, faceUp: false });
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function newGame(): GameState {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  let idx = 0;
  for (let col = 0; col < 7; col++)
    for (let row = 0; row <= col; row++)
      tableau[col].push({ ...deck[idx++], faceUp: row === col });
  return {
    stock: deck.slice(idx).map(c => ({ ...c, faceUp: false })),
    waste: [],
    foundations: [[], [], [], []],
    tableau: tableau as GameState["tableau"],
    moves: 0,
    won: false,
  };
}

function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

function canPlaceOnTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) return card.rank === 13;
  const top = column[column.length - 1];
  return top.faceUp && isRed(card.suit) !== isRed(top.suit) && card.rank === top.rank - 1;
}

function checkWin(g: GameState): boolean {
  return g.foundations.every(f => f.length === 13);
}

function deepClone<T>(obj: T): T { return JSON.parse(JSON.stringify(obj)); }

/* ─── Card visual ─── */
function CardBack({ w, h, style }: { w: number; h: number; style?: React.CSSProperties }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 2, border: "2px solid #1a1a1a", background: "#e8e2d5", boxShadow: "2px 2px 0px #1a1a1a", flexShrink: 0, position: "relative", overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", inset: 3, backgroundImage: "repeating-linear-gradient(45deg,#c8c2b5 0,#c8c2b5 1px,transparent 1px,transparent 6px),repeating-linear-gradient(-45deg,#c8c2b5 0,#c8c2b5 1px,transparent 1px,transparent 6px)" }} />
    </div>
  );
}

function CardFace({ card, w, h, highlighted, style }: { card: Card; w: number; h: number; highlighted?: boolean; style?: React.CSSProperties }) {
  const red = isRed(card.suit);
  const lbl = RANK_LABELS[card.rank];
  const fs = Math.floor(w * 0.21);
  return (
    <div style={{ width: w, height: h, borderRadius: 2, border: highlighted ? "2px solid #f5c800" : "2px solid #1a1a1a", background: "#fff", boxShadow: highlighted ? "0 0 0 2px #f5c800,2px 2px 0px #1a1a1a" : "2px 2px 0px #1a1a1a", flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "2px 3px", userSelect: "none", ...style }}>
      <div style={{ fontSize: fs, fontWeight: 700, lineHeight: 1.1, color: red ? "#dc2626" : "#1a1a1a", fontFamily: "var(--font-space-grotesk),sans-serif" }}>
        {lbl}<br /><span style={{ fontSize: Math.floor(w * 0.23) }}>{card.suit}</span>
      </div>
      <div style={{ fontSize: Math.floor(w * 0.23), alignSelf: "flex-end", transform: "rotate(180deg)", color: red ? "#dc2626" : "#1a1a1a", lineHeight: 1, fontFamily: "var(--font-space-grotesk),sans-serif" }}>{lbl}</div>
    </div>
  );
}

function EmptySlot({ w, h, label }: { w: number; h: number; label?: string }) {
  return (
    <div style={{ width: w, height: h, borderRadius: 2, border: "2px dashed rgba(26,26,26,0.3)", background: "rgba(26,26,26,0.04)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: Math.floor(w * 0.33), color: "rgba(26,26,26,0.3)", flexShrink: 0 }}>
      {label}
    </div>
  );
}

/* ─── Main component ─── */
export default function SolitaireApp() {
  const [game, setGame] = useState<GameState>(() => newGame());
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const hoveredPileRef = useRef<PileId | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(58);
  const cardH = Math.round(cardW * 1.4);
  const fdOverlap = Math.round(cardH * 0.2);   // face-down overlap
  const fuOverlap = Math.round(cardH * 0.3);   // face-up overlap

  /* Responsive sizing */
  useEffect(() => {
    function measure() {
      if (!containerRef.current) return;
      const vw = containerRef.current.clientWidth;
      const w = Math.max(36, Math.min(58, Math.floor((vw - 24 - 48) / 7)));
      setCardW(w);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* Global pointer handlers during drag */
  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = { ...dragRef.current, currentX: e.clientX, currentY: e.clientY };
    setDrag({ ...dragRef.current });
  }, []);

  const onPointerUp = useCallback(() => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);

    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);

    const targetPile = hoveredPileRef.current;
    hoveredPileRef.current = null;
    if (!current || !targetPile) return;

    let dest: PileLocation | null = null;
    if (targetPile.startsWith("foundation-")) {
      dest = { type: "foundation", index: parseInt(targetPile.split("-")[1]) };
    } else if (targetPile.startsWith("tableau-")) {
      dest = { type: "tableau", index: parseInt(targetPile.split("-")[1]), cardIndex: 0 };
    }
    if (!dest) return;
    setGame(prev => applyMove(prev, current.source, dest!, current.cards));
  }, [onPointerMove]);

  function startDrag(e: React.PointerEvent, cards: Card[], source: PileLocation) {
    if (!cards[0]?.faceUp) return;
    e.preventDefault();
    e.stopPropagation();

    // Get offset from top-left of the element being dragged
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const state: DragState = {
      cards, source,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      currentX: e.clientX,
      currentY: e.clientY,
      cardWidth: cardW,
      cardHeight: cardH,
    };
    dragRef.current = state;
    setDrag(state);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  }

  /* Apply a validated move */
  function applyMove(prev: GameState, source: PileLocation, dest: PileLocation, cards: Card[]): GameState {
    if (!cards.length) return prev;
    const g = deepClone(prev);
    const topCard = cards[0];

    // Validate
    if (dest.type === "foundation") {
      if (cards.length !== 1 || !canPlaceOnFoundation(topCard, g.foundations[dest.index])) return prev;
    } else if (dest.type === "tableau") {
      if (!canPlaceOnTableau(topCard, g.tableau[dest.index])) return prev;
    } else return prev;

    // Remove from source
    if (source.type === "waste") {
      if (!g.waste.length || g.waste[g.waste.length - 1].rank !== topCard.rank || g.waste[g.waste.length - 1].suit !== topCard.suit) return prev;
      g.waste.pop();
    } else if (source.type === "foundation") {
      const f = g.foundations[source.index];
      if (!f.length || f[f.length - 1].rank !== topCard.rank) return prev;
      f.pop();
    } else if (source.type === "tableau") {
      const col = g.tableau[source.index];
      if (source.cardIndex < 0 || source.cardIndex >= col.length) return prev;
      col.splice(source.cardIndex);
      if (col.length > 0 && !col[col.length - 1].faceUp) col[col.length - 1].faceUp = true;
    } else return prev;

    // Place at destination
    if (dest.type === "foundation") g.foundations[dest.index].push({ ...topCard, faceUp: true });
    else if (dest.type === "tableau") g.tableau[dest.index].push(...cards.map(c => ({ ...c, faceUp: true })));

    g.moves += 1;
    g.won = checkWin(g);
    return g;
  }

  function autoMove(source: PileLocation, card: Card) {
    setGame(prev => {
      for (let i = 0; i < 4; i++) {
        if (canPlaceOnFoundation(card, prev.foundations[i]))
          return applyMove(prev, source, { type: "foundation", index: i }, [card]);
      }
      return prev;
    });
  }

  /* Drop zone props — pile registers hover via pointer enter/leave */
  function dropZone(pileId: PileId) {
    return {
      onPointerOver: (e: React.PointerEvent) => {
        e.stopPropagation();
        if (dragRef.current) hoveredPileRef.current = pileId;
      },
      onPointerLeave: () => {
        if (hoveredPileRef.current === pileId) hoveredPileRef.current = null;
      },
    };
  }

  const isDraggingFrom = (loc: PileLocation) => {
    if (!drag) return false;
    const s = drag.source;
    if (s.type !== loc.type) return false;
    if (s.type === "foundation" && loc.type === "foundation") return s.index === loc.index;
    if (s.type === "tableau" && loc.type === "tableau") return s.index === loc.index;
    return true;
  };

  const gap = 6;

  return (
    <div
      ref={containerRef}
      style={{ background: "#f0ebe0", minHeight: "100%", padding: "10px 12px", fontFamily: "var(--font-space-grotesk),sans-serif", position: "relative", userSelect: "none", touchAction: "none" }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6560" }}>
          Moves: <span style={{ fontFamily: "var(--font-jetbrains-mono),monospace", color: "#1a1a1a" }}>{game.moves}</span>
        </div>
        <button onClick={() => setGame(newGame())} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "4px 12px", background: "#f5c800", border: "2px solid #1a1a1a", boxShadow: "2px 2px 0px #1a1a1a", borderRadius: 2, cursor: "pointer" }}>
          New Game
        </button>
      </div>

      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap, marginBottom: 10 }}>
        {/* Stock */}
        <div onClick={() => setGame(prev => {
          const g = deepClone(prev);
          if (g.stock.length === 0) {
            g.stock = g.waste.reverse().map(c => ({ ...c, faceUp: false }));
            g.waste = [];
          } else {
            const c = g.stock.pop()!;
            g.waste.push({ ...c, faceUp: true });
          }
          g.moves += 1;
          return g;
        })} style={{ cursor: "pointer", flexShrink: 0 }}>
          {game.stock.length > 0
            ? <CardBack w={cardW} h={cardH} />
            : <EmptySlot w={cardW} h={cardH} label="↺" />}
        </div>

        {/* Waste */}
        <div style={{ flexShrink: 0, ...dropZone("waste") }}>
          {game.waste.length > 0 ? (
            <div
              style={{ cursor: "grab", touchAction: "none" }}
              onPointerDown={e => {
                const top = game.waste[game.waste.length - 1];
                startDrag(e, [top], { type: "waste" });
              }}
              onDoubleClick={() => {
                const top = game.waste[game.waste.length - 1];
                if (top) autoMove({ type: "waste" }, top);
              }}
            >
              <CardFace
                card={game.waste[game.waste.length - 1]}
                w={cardW} h={cardH}
                highlighted={isDraggingFrom({ type: "waste" })}
                style={{ opacity: isDraggingFrom({ type: "waste" }) ? 0.3 : 1 }}
              />
            </div>
          ) : <EmptySlot w={cardW} h={cardH} />}
        </div>

        <div style={{ flex: 1 }} />

        {/* Foundations */}
        {(["♠", "♥", "♣", "♦"] as Suit[]).map((suit, i) => {
          const pile = game.foundations[i];
          const pileId = `foundation-${i}` as PileId;
          const dragging = isDraggingFrom({ type: "foundation", index: i });
          return (
            <div key={i} style={{ flexShrink: 0, ...dropZone(pileId) }}>
              {pile.length > 0 ? (
                <div style={{ cursor: "grab", touchAction: "none" }}
                  onPointerDown={e => startDrag(e, [pile[pile.length - 1]], { type: "foundation", index: i })}
                >
                  <CardFace card={pile[pile.length - 1]} w={cardW} h={cardH} highlighted={dragging} style={{ opacity: dragging ? 0.3 : 1 }} />
                </div>
              ) : <EmptySlot w={cardW} h={cardH} label={suit} />}
            </div>
          );
        })}
      </div>

      {/* Tableau */}
      <div style={{ display: "flex", gap, alignItems: "flex-start" }}>
        {game.tableau.map((col, colIdx) => {
          const pileId = `tableau-${colIdx}` as PileId;
          const srcIdx = drag?.source.type === "tableau" && drag.source.index === colIdx
            ? (drag.source as Extract<PileLocation, { type: "tableau" }>).cardIndex
            : -1;

          return (
            <div
              key={colIdx}
              style={{ flex: 1, minWidth: cardW, minHeight: cardH, position: "relative", ...dropZone(pileId) }}
            >
              {col.length === 0
                ? <EmptySlot w={cardW} h={cardH} label="K" />
                : (
                  <div style={{ position: "relative", height: (() => { let h = 0; col.forEach(c => { h += c.faceUp ? fuOverlap : fdOverlap; }); return h + cardH; })() }}>
                    {col.map((card, ci) => {
                      const top = col.slice(0, ci).reduce((acc, c) => acc + (c.faceUp ? fuOverlap : fdOverlap), 0);
                      const beingDragged = srcIdx >= 0 && ci >= srcIdx;
                      return (
                        <div
                          key={`${card.suit}${card.rank}`}
                          style={{ position: "absolute", top, left: 0, zIndex: ci, opacity: beingDragged ? 0.3 : 1, touchAction: "none" }}
                          onPointerDown={card.faceUp ? e => startDrag(e, col.slice(ci), { type: "tableau", index: colIdx, cardIndex: ci }) : undefined}
                          onDoubleClick={card.faceUp && ci === col.length - 1 ? () => autoMove({ type: "tableau", index: colIdx, cardIndex: ci }, card) : undefined}
                        >
                          {card.faceUp
                            ? <CardFace card={card} w={cardW} h={cardH} style={{ cursor: "grab" }} />
                            : <CardBack w={cardW} h={cardH} />}
                        </div>
                      );
                    })}
                  </div>
                )
              }
            </div>
          );
        })}
      </div>

      {/* Drag ghost */}
      {drag && (
        <div style={{ position: "fixed", left: drag.currentX - drag.offsetX, top: drag.currentY - drag.offsetY, zIndex: 9999, pointerEvents: "none" }}>
          {drag.cards.map((card, i) => (
            <div key={`g${card.suit}${card.rank}`} style={{ position: i === 0 ? "relative" : "absolute", top: i === 0 ? 0 : i * fuOverlap, left: 0, zIndex: i }}>
              <CardFace card={card} w={drag.cardWidth} h={drag.cardHeight} />
            </div>
          ))}
          {drag.cards.length > 1 && <div style={{ height: (drag.cards.length - 1) * fuOverlap + drag.cardHeight }} />}
        </div>
      )}

      {/* Win overlay */}
      {game.won && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(240,235,224,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10000, gap: 16 }}>
          <div style={{ fontFamily: "var(--font-space-grotesk),sans-serif", fontSize: 36, fontWeight: 900, color: "#1a1a1a", border: "3px solid #1a1a1a", background: "#f5c800", padding: "20px 32px", boxShadow: "6px 6px 0px #1a1a1a" }}>YOU WIN 🎉</div>
          <div style={{ fontSize: 14, color: "#1a1a1a", fontFamily: "var(--font-jetbrains-mono),monospace" }}>{game.moves} moves</div>
          <button onClick={() => setGame(newGame())} style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "10px 24px", background: "#1a1a1a", color: "#f5c800", border: "2px solid #1a1a1a", boxShadow: "3px 3px 0px #f5c800", borderRadius: 2, cursor: "pointer" }}>
            New Game
          </button>
        </div>
      )}
    </div>
  );
}
