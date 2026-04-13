"use client"

import { useEffect, useState } from "react"
import { getCookie, deleteCookie } from "cookies-next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { XCircle, InfoIcon, Package, Layers, ShoppingCart } from "lucide-react"

import { Button } from "components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs"
import { Card, CardHeader, CardTitle } from "components/ui/card"
import { Badge } from "components/ui/badge"
import { Dialog, DialogContent } from "components/ui/dialog"

import { PackOpener } from "components/pack-opener"
import { PlayerCardUI } from "components/player-card-ui"
import { DetailedCardView } from "components/detailed-card-view"
import { GAME_DATA } from "server/src/gameData"

// --- TYPES ---
interface User {
  id: string
  username: string
  avatar_url: string
  pp: number
}

interface InventoryItem {
  id: string
  card_id?: string
  is_sealed: number
  pack_type?: string
  pack_weight?: number
  security_score?: number
  is_graded?: boolean
  grade_value?: number | string | null // Added null here for safety
}
export default function Page() {
  const router = useRouter()

  // States with proper typing instead of 'any'
  const [selectedPack, setSelectedPack] = useState<InventoryItem | null>(null)
  const [selectedCard, setSelectedCard] = useState<any>(null) // DetailedCardView usually takes a combined type
  const [user, setUser] = useState<User | null>(null)
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshInventory = () => {
    if (user) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory?userId=${user.id}`
      )
        .then((res) => res.json())
        .then((data) => {
          const items = data.results || data || []
          setInventory(Array.isArray(items) ? items : [])
        })
        .catch((err) => console.error("Inventory fetch error:", err))
    }
  }

  useEffect(() => {
    const session = getCookie("osu_user")
    if (session) {
      try {
        const userData = JSON.parse(session as string) as User
        setUser(userData)
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/inventory?userId=${userData.id}`
        )
          .then((res) => res.json())
          .then((data) => {
            const items = data.results || data || []
            setInventory(Array.isArray(items) ? items : [])
          })
      } catch (e) {
        console.error("Session parse error", e)
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogout = () => {
    deleteCookie("osu_user")
    setUser(null)
    router.push("/")
  }

  if (isLoading) return null
  if (!user) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
        <XCircle className="h-24 w-24 text-destructive opacity-80" />
        <h1 className="text-4xl font-extrabold tracking-tighter text-white">
          Access Denied
        </h1>
        <Link href="/">
          <Button
            size="lg"
            className="rounded-2xl bg-[#ff66aa] font-bold text-white"
          >
            Go back to Login
          </Button>
        </Link>
      </div>
    )
  }

  // Filter logic with Typed items
  const packs = inventory.filter((item) => item.is_sealed === 1)
  const cards = inventory.filter(
    (item) => item.is_sealed === 0 && (item.card_id || item.id)
  )

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col items-stretch gap-8 p-6">
      <nav className="flex w-full items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter text-[#ff66aa]">
          o!tcg
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right text-white sm:block">
            <p className="text-sm font-bold">{user.username}</p>
            <p className="text-xs text-pink-500">
              {user.pp?.toLocaleString()} PP
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-2 border-transparent transition-all hover:border-[#ff66aa]">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className="bg-zinc-800 text-white">
                  {user.username[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl border-zinc-800 bg-zinc-950 text-white"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="cursor-pointer rounded-xl">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-xl">
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-zinc-800" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer rounded-xl text-red-500"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <Alert className="rounded-2xl border-none bg-yellow-50 dark:bg-yellow-950/20">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle className="font-bold">Alpha Version</AlertTitle>
        <AlertDescription>
          Inventory synced for {user.username}. Good luck!
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="packs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 rounded-2xl bg-muted/50 p-1">
          <TabsTrigger value="packs" className="gap-2 rounded-xl">
            <Package className="h-4 w-4" /> Packs ({packs.length})
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-2 rounded-xl">
            <Layers className="h-4 w-4" /> Cards ({cards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packs" className="mt-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packs.map((pack) => (
              <Card
                key={pack.id}
                className="group overflow-hidden rounded-3xl border-2 border-zinc-800 bg-zinc-900/50 transition-all hover:border-[#ff66aa]"
              >
                <div
                  onClick={() => setSelectedPack(pack)}
                  className="relative flex aspect-3/4 cursor-pointer flex-col items-center justify-center bg-zinc-900 p-6 text-center"
                >
                  <div className="mb-4 text-6xl transition-transform group-hover:scale-110">
                    📦
                  </div>
                  <Badge variant="secondary" className="rounded-lg font-mono">
                    {pack.pack_weight}g
                  </Badge>
                  <div className="mt-4 text-center">
                    <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                      Trust Score
                    </p>
                    <p className="text-sm font-black text-green-500">
                      {Math.round((pack.security_score || 0) * 100)}%
                    </p>
                  </div>
                </div>
                <CardHeader className="flex flex-row items-center justify-between bg-black/20 p-4 text-white">
                  <CardTitle className="truncate text-xs font-black tracking-tight uppercase">
                    {pack.pack_type?.replace("_", " ") || "Standard Pack"}
                  </CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-zinc-500 hover:text-[#ff66aa]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {cards.map((item) => {
              const cardId = item.card_id || item.id
              const playerInfo = GAME_DATA.sets.genesis.cards.find(
                (c) => String(c.id) === String(cardId)
              )
              if (!playerInfo) return null

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCard({ ...playerInfo, ...item })}
                  className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <PlayerCardUI
                    player={playerInfo}
                    grade={item.is_graded ? Number(item.grade_value) : null}
                  />
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="max-w-[95vw] overflow-hidden rounded-[2.5rem] border-zinc-800 bg-[#050505] p-0 outline-none sm:max-w-2xl">
          {selectedPack && (
            <div className="flex w-full items-center justify-center">
              <PackOpener
                pack={selectedPack}
                userId={user.id}
                onOpenComplete={() => refreshInventory()}
                onClose={() => setSelectedPack(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-[95vw] overflow-hidden rounded-[2.5rem] border-zinc-800 bg-zinc-950 p-0 outline-none lg:max-w-[1050px]">
          <div className="flex min-h-[500px] w-full items-center justify-center">
            {selectedCard && <DetailedCardView card={selectedCard} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
