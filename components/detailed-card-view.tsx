"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { PlayerCardUI } from "./player-card-ui"
import { Badge } from "components/ui/badge"
import { Button } from "components/ui/button"
import { GAME_DATA } from "server/src/gameData"

export function DetailedCardView({ card }: { card: any }) {
  const [showBack, setShowBack] = useState(false)
  const nerveConsistency = (100 - 20 / (card.baseStats.nerves / 10)).toFixed(1)

  const slots = [
    { label: "NM", value: card.slots.nm[0] },
    { label: "HD", value: card.slots.hd[0] },
    { label: "HR", value: card.slots.hr[0] },
    { label: "DT", value: card.slots.dt[0] },
    { label: "FM", value: card.slots.fm[0] },
    { label: "TB", value: card.slots.tb },
  ]

  return (
    <div className="flex h-full max-h-[90vh] w-full flex-col overflow-hidden bg-zinc-950 md:flex-row">
      {/* LEFT: Visual Area (Fixed width, fits card perfectly) */}
      <div className="flex w-full shrink-0 items-center justify-center border-r border-zinc-800 bg-zinc-900/50 p-12 md:w-[450px]">
        <motion.div
          className="perspective-1000 relative h-[380px] w-64 cursor-pointer"
          animate={{ rotateY: showBack ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          onClick={() => setShowBack(!showBack)}
        >
          {/* Front */}
          <div
            className="absolute inset-0"
            style={{ backfaceVisibility: "hidden" }}
          >
            <PlayerCardUI player={card} grade={card.grade_value} />
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-4 border-zinc-800 bg-black"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-8xl font-black text-[#ff66aa] italic">o!</div>
            <p className="mt-4 font-mono text-[10px] tracking-[0.4em] text-zinc-500">
              GENESIS SET
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Stats Area (Wide and scrollable if needed) */}
      <div className="custom-scrollbar flex flex-1 flex-col overflow-y-auto p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-6xl leading-none font-black tracking-tighter text-white uppercase italic">
                {card.name}
              </h2>
              <div className="mt-2 flex items-center gap-4 font-mono text-xs tracking-widest text-zinc-500 uppercase">
                <span>Rank #{card.baseStats.ppRank}</span>
                <span className="opacity-30">|</span>
                <span>ID: {card.playerId}</span>
              </div>
            </div>
            <Badge className="bg-pink-600 px-3 py-1 font-bold tracking-tighter text-white italic">
              GENESIS
            </Badge>
          </div>

          {/* Core Attributes - Flex row to save height */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="mb-1 text-[10px] font-bold text-zinc-500 uppercase">
                Aim
              </p>
              <p className="text-5xl font-black text-sky-400 italic tabular-nums">
                {card.baseStats.aim}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="mb-1 text-[10px] font-bold text-zinc-500 uppercase">
                Tapping
              </p>
              <p className="text-5xl font-black text-orange-400 italic tabular-nums">
                {card.baseStats.tapping}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="mb-1 text-[10px] font-bold text-zinc-500 uppercase">
                Nerves %
              </p>
              <p className="text-5xl font-black text-green-400 italic tabular-nums">
                {nerveConsistency}
              </p>
            </div>
          </div>

          {/* Tournament Efficiency - Single Row to prevent cutoff */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
              Tournament Efficiency
            </p>
            <div className="grid grid-cols-6 gap-2">
              {slots.map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg border border-zinc-800 bg-black px-1 py-3 text-center"
                >
                  <p className="text-[10px] font-black text-pink-500">
                    {s.label}
                  </p>
                  <p className="truncate font-mono text-xs text-zinc-300">
                    {s.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quote / Lore */}
          <div className="border-l-4 border-zinc-800 py-2 pl-6 text-sm text-zinc-400 italic">
            "{card.description}"
          </div>
        </div>

        {/* Action Buttons - Fixed at bottom of column */}
        <div className="mt-12 flex shrink-0 gap-4 pb-4">
          <Button className="h-14 flex-1 rounded-full bg-[#ff66aa] text-xl font-black tracking-tighter text-black uppercase italic transition-transform hover:bg-[#ff88bb] active:scale-95">
            Lock Player
          </Button>
          <Button
            variant="outline"
            className="h-14 flex-1 rounded-full border-zinc-800 font-bold tracking-widest text-zinc-400 uppercase hover:bg-zinc-900"
          >
            Marketplace
          </Button>
        </div>
      </div>
    </div>
  )
}
