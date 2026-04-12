"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "components/ui/button"
import { Badge } from "components/ui/badge"
import { RevealCard } from "./reveal-card"

export function PackOpener({ pack, userId, onOpenComplete, onClose }: any) {
  const [revealedCards, setRevealedCards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    if (currentIndex < 7) setCurrentIndex((prev) => prev + 1)
    else onClose()
  }

  return (
    <div className="flex h-[85vh] w-full flex-col bg-[#050505]">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1.1, opacity: 1, y: 0 }} // Slightly enlarged reveal
            exit={{ scale: 0.9, opacity: 0, x: -100 }}
            className="z-10"
          >
            <RevealCard card={revealedCards[currentIndex]} />
          </motion.div>
        </AnimatePresence>

        {/* Background glow based on card rarity could go here */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-transparent to-transparent opacity-50" />
      </div>

      {/* Control Bar - Completely separate from the card area */}
      <div className="flex h-32 shrink-0 items-center justify-between border-t border-zinc-900 bg-zinc-950 px-12">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
              Card {currentIndex + 1} / 8
            </span>
            {pack.is_resealed === 1 && (
              <Badge className="h-4 border-none bg-red-500/20 px-1.5 text-[9px] font-black text-red-500 uppercase">
                Resealed
              </Badge>
            )}
          </div>
          <p className="text-xs font-bold text-green-500">
            TRUST: {Math.round(pack.security_score * 100)}%
          </p>
        </div>

        <Button
          onClick={handleNext}
          className="h-14 skew-x-[-12deg] rounded-none bg-white px-12 text-xl font-black tracking-tighter text-black uppercase italic hover:bg-zinc-200"
        >
          <span className="skew-x-[12deg]">
            {currentIndex < 7 ? "Next Card →" : "Finish Pull"}
          </span>
        </Button>
      </div>
    </div>
  )
}
