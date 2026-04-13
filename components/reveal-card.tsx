"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { PlayerCardUI } from "./player-card-ui"

export function RevealCard({ card }: any) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    // FIX: Adjusted dimensions to match PlayerCardUI aspect ratio better
    <div className="perspective-1000 relative h-100 w-70">
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="h-full w-full cursor-pointer"
        onClick={() => setIsFlipped(true)}
      >
        {/* Front of Card (Face Down) */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl border-[6px] border-white/20 bg-[#ff66aa] shadow-2xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex flex-col items-center">
            <div className="text-7xl font-black text-white italic drop-shadow-lg">
              o!
            </div>
            <div className="mt-2 h-1 w-12 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Back of Card (The Player Card) */}
        <div
          className="absolute inset-0 h-full w-full rounded-2xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {/* FIX: Ensure card exists before rendering to prevent blinking skeleton */}
          {card ? (
            <PlayerCardUI player={card} />
          ) : (
            <div className="h-full w-full animate-pulse rounded-2xl bg-zinc-900" />
          )}
        </div>
      </motion.div>
    </div>
  )
}
