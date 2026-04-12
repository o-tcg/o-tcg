"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { PlayerCardUI } from "./player-card-ui"

export function RevealCard({ card, index, total }: any) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="perspective-1000 relative h-96 w-64">
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
        {/* Front of Card (Face Down initially) */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-xl border-4 border-white bg-[#ff66aa] shadow-2xl backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-6xl font-black text-white italic">o!</div>
        </div>

        {/* Back of Card (The actual Player Card) */}
        <div
          className="absolute inset-0 h-full w-full rounded-xl shadow-xl"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <PlayerCardUI player={card} />
        </div>
      </motion.div>
    </div>
  )
}
