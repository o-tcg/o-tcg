"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "components/ui/button"
import { RevealCard } from "./reveal-card"

export function PackOpener({ pack, userId, onOpenComplete, onClose }: any) {
  const [revealedCards, setRevealedCards] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isOpening, setIsOpening] = useState(true)

  useEffect(() => {
    const openPack = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/open-pack`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, packId: pack.id }),
          }
        )
        const data = await res.json()

        if (data.cards) {
          setRevealedCards(data.cards)
        }
        setIsOpening(false)
        onOpenComplete()
      } catch (err) {
        console.error("Failed to open pack:", err)
      }
    }
    openPack()
  }, [pack.id, userId])

  const handleNext = () => {
    if (currentIndex < revealedCards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      onClose()
    }
  }

  if (isOpening)
    return (
      <div className="flex h-96 animate-pulse items-center justify-center font-black text-white italic">
        DECRYPTING PACK...
      </div>
    )

  return (
    <div className="flex h-[80vh] w-full flex-col bg-black">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, x: -100 }}
            className="z-10"
          >
            {revealedCards[currentIndex] && (
              <RevealCard card={revealedCards[currentIndex]} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex h-20 shrink-0 items-center justify-between border-t border-zinc-900 bg-zinc-950 px-8">
        <p className="font-mono text-[10px] text-zinc-500 uppercase">
          Card {currentIndex + 1} / {revealedCards.length}
        </p>
        <Button
          onClick={handleNext}
          className="h-10 skew-x-[-12deg] rounded-none bg-white px-8 text-sm font-black text-black uppercase italic"
        >
          <span className="skew-x-[12deg]">
            {currentIndex < revealedCards.length - 1 ? "Next" : "Finish"}
          </span>
        </Button>
      </div>
    </div>
  )
}
