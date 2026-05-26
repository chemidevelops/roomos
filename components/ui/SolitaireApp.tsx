"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
type Suit = "♠" | "♣" | "♥" | "♦";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: [Card[], Card[], Card[], Card[]];
  tableau: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]];
  moves: number;
  won: boolean;
}

type PileLocation =
  | { type: "stock" }
  | { type: "waste" }
  | { type: "foundation"; index: number }
  | { type: "tableau"; index: number; cardIndex: number };

interface DragState {
  cards: Card[];
  source: PileLocation;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  cardWidth: number;
  cardHeight: number;
}

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────── */
const SUITS: Suit[] = ["♠", "♣", "♥", "♦"];
const RED_SUITS: Suit[] = ["♥", "♦"];
const RANK_LABELS: Record<Rank, string> = {
  1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
  8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function isRed(suit: Suit) {
  return RED_SUITS.includes(suit);
}

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank: rank as Rank, faceUp: false });
    }
  }
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
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      tableau[col].push({ ...deck[idx++], faceUp: row === col });
    }
  }

  const stock = deck.slice(idx).map((c) => ({ ...c, faceUp: false }));

  return {
    stock,
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
  if (!top.faceUp) return false;
  return isRed(card.suit) !== isRed(top.suit) && card.rank === top.rank - 1;
}

function checkWin(state: GameState): boolean {
  return state.foundations.every((f) => f.length === 13);
}

/* ─────────────────────────────────────────────────────────────
   Card visual component
───────────────────────────────────────────────────────────── */
interface CardViewProps {
  card: Card;
  width: number;
  height: number;
  selected?: boolean;
  style?: React.CSSProperties;
}

function CardView({ card, width, height, selected, style }: CardViewProps) {
  const red = isRed(card.suit);
  const rankLabel = RANK_LABELS[card.rank];

  if (!card.faceUp) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius: "2px",
          border: "2px solid #1a1a1a",
          background: "#e8e2d5",
          boxShadow: "2px 2px 0px #1a1a1a",
          flexShrink: 0,
          position: "relative",
          overflow: "hidden",
          ...style,
        }}
      >
        {/* Cross-hatch pattern */}
        <div
          style={{
            position: "absolute",
            inset: 3,
            backgroundImage:
              "repeating-linear-gradient(45deg, #c8c2b5 0px, #c8c2b5 1px, transparent 1px, transparent 6px), repeating-linear-gradient(-45deg, #c8c2b5 0px, #c8c2b5 1px, transparent 1px, transparent 6px)",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height,
        borderRadius: "2px",
        border: selected ? "2px solid #f5c800" : "2px solid #1a1a1a",
        background: "#ffffff",
        boxShadow: selected
          ? "0 0 0 2px #f5c800, 2px 2px 0px #1a1a1a"
          : "2px 2px 0px #1a1a1a",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "2px 3px",
        userSelect: "none",
        cursor: "grab",
        ...style,
      }}
    >
      <div
        style={{
          fontSize: Math.floor(width * 0.2),
          fontWeight: 700,
          lineHeight: 1,
          color: red ? "#dc2626" : "#1a1a1a",
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}
      >
        {rankLabel}
        <br />
        <span style={{ fontSize: Math.floor(width * 0.22) }}>{card.suit}</span>
      </div>
      <div
        style={{
          fontSize: Math.floor(width * 0.22),
          alignSelf: "flex-end",
          transform: "rotate(180deg)",
          color: red ? "#dc2626" : "#1a1a1a",
          lineHeight: 1,
          fontFamily: "var(--font-space-grotesk), sans-serif",
        }}
      >
        {rankLabel}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Empty pile placeholder
───────────────────────────────────────────────────────────── */
function EmptyPile({
  width,
  height,
  label,
  dashed,
}: {
  width: number;
  height: number;
  label?: string;
  dashed?: boolean;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: "2px",
        border: dashed ? "2px dashed #1a1a1a" : "2px solid #1a1a1a",
        background: "rgba(26,26,26,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.floor(width * 0.33),
        color: "#1a1a1a",
        opacity: 0.4,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Solitaire Component
───────────────────────────────────────────────────────────── */
export default function SolitaireApp() {
  const [game, setGame] = useState<GameState>(() => newGame());
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardW, setCardW] = useState(60);
  const cardH = Math.round(cardW * 1.4);
  const faceDownOverlap = Math.round(cardW * 0.33);
  const faceUpOverlap = Math.round(cardW * 0.47);

  /* Responsive card size */
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const vw = containerRef.current.clientWidth;
        // 7 columns + 6 gaps (8px each) + 24px padding
        const available = vw - 24 - 6 * 8;
        const w = Math.max(40, Math.min(60, Math.floor(available / 7)));
        setCardW(w);
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  /* ── Pointer event handlers ── */
  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = { ...dragRef.current, currentX: e.clientX, currentY: e.clientY };
    setDrag({ ...dragRef.current });
  }, []);

  const handlePointerUp = useCallback(
    (e: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      const current = dragRef.current;
      dragRef.current = null;
      setDrag(null);

      if (!current) return;

      // Find drop target using element from point
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el) return;

      const target = el.closest("[data-pile]");
      if (!target) return;

      const pileStr = (target as HTMLElement).dataset.pile;
      if (!pileStr) return;

      let dest: PileLocation | null = null;
      if (pileStr === "foundation-0") dest = { type: "foundation", index: 0 };
      else if (pileStr === "foundation-1") dest = { type: "foundation", index: 1 };
      else if (pileStr === "foundation-2") dest = { type: "foundation", index: 2 };
      else if (pileStr === "foundation-3") dest = { type: "foundation", index: 3 };
      else if (pileStr.startsWith("tableau-")) {
        const i = parseInt(pileStr.split("-")[1]);
        dest = { type: "tableau", index: i, cardIndex: 0 };
      }

      if (!dest) return;

      setGame((prev) => applyMove(prev, current.source, dest!, current.cards));
    },
    [handlePointerMove]
  );

  function startDrag(
    e: React.PointerEvent,
    cards: Card[],
    source: PileLocation
  ) {
    e.preventDefault();
    e.stopPropagation();
    const state: DragState = {
      cards,
      source,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      cardWidth: cardW,
      cardHeight: cardH,
    };
    dragRef.current = state;
    setDrag(state);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  /* ── Apply move logic ── */
  function applyMove(
    prev: GameState,
    source: PileLocation,
    dest: PileLocation,
    cards: Card[]
  ): GameState {
    if (!cards.length) return prev;

    const g = deepClone(prev);
    const topCard = cards[0];

    // Validate destination
    if (dest.type === "foundation") {
      if (cards.length !== 1) return prev;
      if (!canPlaceOnFoundation(topCard, g.foundations[dest.index])) return prev;
    } else if (dest.type === "tableau") {
      if (!canPlaceOnTableau(topCard, g.tableau[dest.index])) return prev;
    } else {
      return prev;
    }

    // Check source matches actual cards
    if (source.type === "waste") {
      if (g.waste.length === 0 || g.waste[g.waste.length - 1].suit !== topCard.suit || g.waste[g.waste.length - 1].rank !== topCard.rank) return prev;
      g.waste.pop();
    } else if (source.type === "foundation") {
      const f = g.foundations[source.index];
      if (f.length === 0 || f[f.length - 1].suit !== topCard.suit || f[f.length - 1].rank !== topCard.rank) return prev;
      f.pop();
    } else if (source.type === "tableau") {
      const col = g.tableau[source.index];
      const startIdx = source.cardIndex;
      if (startIdx < 0 || startIdx >= col.length) return prev;
      const removed = col.splice(startIdx);
      if (removed.length !== cards.length) return prev;
      // Flip top card if any
      if (col.length > 0 && !col[col.length - 1].faceUp) {
        col[col.length - 1].faceUp = true;
      }
    } else {
      return prev;
    }

    // Place cards at destination
    if (dest.type === "foundation") {
      g.foundations[dest.index].push({ ...topCard, faceUp: true });
    } else if (dest.type === "tableau") {
      g.tableau[dest.index].push(...cards.map((c) => ({ ...c, faceUp: true })));
    }

    g.moves += 1;
    g.won = checkWin(g);
    return g;
  }

  /* ── Stock click ── */
  function handleStockClick() {
    setGame((prev) => {
      const g = deepClone(prev);
      if (g.stock.length === 0) {
        // Reset waste back to stock
        g.stock = g.waste.reverse().map((c) => ({ ...c, faceUp: false }));
        g.waste = [];
      } else {
        const card = g.stock.pop()!;
        g.waste.push({ ...card, faceUp: true });
      }
      g.moves += 1;
      return g;
    });
  }

  /* ── Auto-move to foundation ── */
  function autoMoveToFoundation(source: PileLocation, card: Card) {
    setGame((prev) => {
      for (let i = 0; i < 4; i++) {
        if (canPlaceOnFoundation(card, prev.foundations[i])) {
          return applyMove(prev, source, { type: "foundation", index: i }, [card]);
        }
      }
      return prev;
    });
  }

  /* ── Render ── */
  const gap = 8;

  return (
    <div
      ref={containerRef}
      style={{
        background: "#f0ebe0",
        minHeight: "100%",
        padding: "12px",
        fontFamily: "var(--font-space-grotesk), sans-serif",
        position: "relative",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#6b6560",
          }}
        >
          Moves:{" "}
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              color: "#1a1a1a",
            }}
          >
            {game.moves}
          </span>
        </div>
        <button
          onClick={() => setGame(newGame())}
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "4px 12px",
            background: "#f5c800",
            border: "2px solid #1a1a1a",
            boxShadow: "2px 2px 0px #1a1a1a",
            borderRadius: "2px",
            cursor: "pointer",
            fontFamily: "var(--font-space-grotesk), sans-serif",
          }}
        >
          New Game
        </button>
      </div>

      {/* Top row: stock/waste + foundations */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap,
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Stock */}
        <div
          onClick={handleStockClick}
          style={{ cursor: "pointer", flexShrink: 0 }}
          data-pile="stock"
        >
          {game.stock.length > 0 ? (
            <CardView card={{ suit: "♠", rank: 1, faceUp: false }} width={cardW} height={cardH} />
          ) : (
            <EmptyPile width={cardW} height={cardH} label="↺" />
          )}
        </div>

        {/* Waste */}
        <div data-pile="waste" style={{ flexShrink: 0, position: "relative" }}>
          {game.waste.length > 0 ? (
            <div
              onPointerDown={(e) => {
                const top = game.waste[game.waste.length - 1];
                startDrag(e, [top], { type: "waste" });
              }}
              onDoubleClick={() => {
                const top = game.waste[game.waste.length - 1];
                if (top) autoMoveToFoundation({ type: "waste" }, top);
              }}
              style={{ cursor: "grab" }}
            >
              <CardView
                card={game.waste[game.waste.length - 1]}
                width={cardW}
                height={cardH}
                selected={drag?.source.type === "waste"}
                style={{
                  opacity:
                    drag?.source.type === "waste" ? 0 : 1,
                }}
              />
            </div>
          ) : (
            <EmptyPile width={cardW} height={cardH} dashed />
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minWidth: cardW }} />

        {/* Foundations */}
        {(["♠", "♥", "♣", "♦"] as Suit[]).map((suit, i) => (
          <div
            key={i}
            data-pile={`foundation-${i}`}
            style={{ flexShrink: 0, position: "relative" }}
          >
            {game.foundations[i].length > 0 ? (
              <div
                onPointerDown={(e) => {
                  const top = game.foundations[i][game.foundations[i].length - 1];
                  startDrag(e, [top], { type: "foundation", index: i });
                }}
                style={{ cursor: "grab" }}
              >
                <CardView
                  card={game.foundations[i][game.foundations[i].length - 1]}
                  width={cardW}
                  height={cardH}
                  selected={
                    drag?.source.type === "foundation" && drag.source.index === i
                  }
                  style={{
                    opacity:
                      drag?.source.type === "foundation" && drag.source.index === i
                        ? 0
                        : 1,
                  }}
                />
              </div>
            ) : (
              <EmptyPile width={cardW} height={cardH} label={suit} dashed />
            )}
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div style={{ display: "flex", gap, alignItems: "flex-start" }}>
        {game.tableau.map((col, colIdx) => {
          const isDragSource =
            drag?.source.type === "tableau" && drag.source.index === colIdx;
          const dragStartCardIndex =
            isDragSource && drag ? (drag.source as { type: "tableau"; index: number; cardIndex: number }).cardIndex : -1;

          return (
            <div
              key={colIdx}
              data-pile={`tableau-${colIdx}`}
              style={{
                flex: 1,
                position: "relative",
                minWidth: cardW,
                minHeight: cardH,
              }}
            >
              {col.length === 0 ? (
                <EmptyPile width={cardW} height={cardH} label="K" dashed />
              ) : (
                <div style={{ position: "relative" }}>
                  {col.map((card, cardIdx) => {
                    const overlap = card.faceUp ? faceUpOverlap : faceDownOverlap;
                    const isBeingDragged =
                      isDragSource && cardIdx >= dragStartCardIndex;
                    // Calculate top offset
                    let top = 0;
                    for (let k = 0; k < cardIdx; k++) {
                      top += col[k].faceUp ? faceUpOverlap : faceDownOverlap;
                    }

                    return (
                      <div
                        key={`${card.suit}-${card.rank}`}
                        data-pile={`tableau-${colIdx}`}
                        style={{
                          position: "absolute",
                          top,
                          left: 0,
                          zIndex: cardIdx,
                          opacity: isBeingDragged ? 0 : 1,
                        }}
                        onPointerDown={
                          card.faceUp
                            ? (e) => {
                                const cards = col.slice(cardIdx);
                                startDrag(e, cards, {
                                  type: "tableau",
                                  index: colIdx,
                                  cardIndex: cardIdx,
                                });
                              }
                            : undefined
                        }
                        onDoubleClick={
                          card.faceUp && cardIdx === col.length - 1
                            ? () => autoMoveToFoundation({ type: "tableau", index: colIdx, cardIndex: cardIdx }, card)
                            : undefined
                        }
                      >
                        <CardView card={card} width={cardW} height={cardH} />
                      </div>
                    );
                  })}
                  {/* Spacer to make column take proper height */}
                  <div
                    style={{
                      height: (() => {
                        let h = 0;
                        col.forEach((c, k) => {
                          h += c.faceUp ? faceUpOverlap : faceDownOverlap;
                        });
                        return h + cardH;
                      })(),
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Drag Ghost */}
      {drag && (
        <div
          style={{
            position: "fixed",
            left: drag.currentX - drag.cardWidth / 2,
            top: drag.currentY - drag.cardHeight / 4,
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {drag.cards.map((card, i) => (
            <div
              key={`ghost-${card.suit}-${card.rank}`}
              style={{
                position: i === 0 ? "relative" : "absolute",
                top: i === 0 ? 0 : i * faceUpOverlap,
                left: 0,
                zIndex: i,
              }}
            >
              <CardView card={card} width={drag.cardWidth} height={drag.cardHeight} />
            </div>
          ))}
          {/* Spacer for ghost stack height */}
          {drag.cards.length > 1 && (
            <div style={{ height: (drag.cards.length - 1) * faceUpOverlap + drag.cardHeight }} />
          )}
        </div>
      )}

      {/* Win Overlay */}
      {game.won && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(240,235,224,0.92)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            gap: "16px",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-space-grotesk), sans-serif",
              fontSize: "36px",
              fontWeight: 900,
              color: "#1a1a1a",
              textAlign: "center",
              border: "3px solid #1a1a1a",
              background: "#f5c800",
              padding: "20px 32px",
              boxShadow: "6px 6px 0px #1a1a1a",
            }}
          >
            YOU WIN 🎉
          </div>
          <div
            style={{
              fontSize: "14px",
              color: "#1a1a1a",
              fontFamily: "var(--font-jetbrains-mono), monospace",
            }}
          >
            {game.moves} moves
          </div>
          <button
            onClick={() => setGame(newGame())}
            style={{
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "10px 24px",
              background: "#1a1a1a",
              color: "#f5c800",
              border: "2px solid #1a1a1a",
              boxShadow: "3px 3px 0px #f5c800",
              borderRadius: "2px",
              cursor: "pointer",
              fontFamily: "var(--font-space-grotesk), sans-serif",
            }}
          >
            New Game
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Deep clone helper (simple, for plain objects/arrays)
───────────────────────────────────────────────────────────── */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
