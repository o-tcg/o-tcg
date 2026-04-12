"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "components/ui/button"
import { RevealCard } from "./reveal-card"
import { PlayerCardUI } from "./player-card-ui"

export function PackOpener({ pack, userId, onOpenComplete }: any) {
  const [isOpening, setIsOpening] = useState(false)
  const [revealedCards, setRevealedCards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const openPack = async () => {
    setIsOpening(true)
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/open-pack`,
      {
        method: "POST",
        body: JSON.stringify({ packId: pack.id, userId }),
      }
    )
    const data = await res.json()
    setRevealedCards(data.cards)
    onOpenComplete()
    setIsOpening(false)
  }

  const nextCard = () => {
    if (currentIndex < revealedCards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  return (
    <div className="flex min-h-125 w-full flex-col items-center justify-center overflow-hidden">
      {!revealedCards.length ? (
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-9xl"
          >
            📦
          </motion.div>
          <Button
            onClick={openPack}
            disabled={isOpening}
            className="bg-pink-500 px-12 py-6 text-xl font-black uppercase italic hover:bg-pink-600"
          >
            {isOpening ? "Opening..." : "Rip Open"}
          </Button>
        </div>
      ) : (
        <div className="relative flex h-112.5 w-full items-center justify-center">
          {/* Revealed Stack (The cards you already flipped) */}
          <div className="absolute right-10 flex items-center">
            {revealedCards.slice(0, currentIndex).map((card, i) => (
              <motion.div
                key={`stack-${i}`}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: i * 15, opacity: 1, rotate: i * 2 }}
                className="absolute h-48 w-32"
              >
                <div className="origin-left scale-50">
                  <PlayerCardUI player={card} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Current Active Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: -500, opacity: 0, scale: 0.5 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 300, opacity: 0, scale: 0.5 }}
              className="z-50"
            >
              <RevealCard card={revealedCards[currentIndex]} />
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-0 flex w-full justify-between px-4">
            <p className="font-bold tracking-widest text-zinc-500 uppercase">
              Card {currentIndex + 1} of 8
            </p>
            {currentIndex < 7 ? (
              <Button
                onClick={nextCard}
                className="bg-white text-black hover:bg-zinc-200"
              >
                Next Card →
              </Button>
            ) : (
              <Button
                onClick={() => window.location.reload()}
                className="bg-green-500"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
