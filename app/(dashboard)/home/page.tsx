"use client"

import { useEffect, useState } from "react"
import { getCookie, deleteCookie } from "cookies-next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { XCircle, InfoIcon, Package, Layers } from "lucide-react"

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
import { GAME_DATA } from "../../../server/src/gameData"

export default function Page() {
  const router = useRouter()
  const [selectedPack, setSelectedPack] = useState<any>(null)
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const [user, setUser] = useState<{
    id: string
    username: string
    avatar_url: string
    pp: number
  } | null>(null)
  const [inventory, setInventory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshInventory = () => {
    if (user) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/inventory?userId=${user.id}`
      )
        .then((res) => res.json())
        .then((data) => setInventory(data.results || data || []))
        .catch((err) => console.error("Inventory fetch error:", err))
    }
  }

  useEffect(() => {
    const session = getCookie("osu_user")
    if (session) {
      try {
        const userData = JSON.parse(session as string)
        setUser(userData)
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/inventory?userId=${userData.id}`
        )
          .then((res) => res.json())
          .then((data) => setInventory(data.results || data || []))
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
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tighter">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need to be connected with osu! to play.
          </p>
        </div>
        <Link href="/">
          <Button
            size="lg"
            className="rounded-xl bg-[#ff66aa] font-bold text-white"
          >
            Go back to Login
          </Button>
        </Link>
      </div>
    )
  }

  const inventoryArray = Array.isArray(inventory)
    ? inventory
    : (inventory as any).results || []
  const packs = inventoryArray.filter((item: any) => item.is_sealed === 1)
  const cards = inventoryArray.filter(
    (item: any) => item.is_sealed === 0 && item.card_id
  )

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col items-stretch gap-8 p-6">
      {/* Navbar */}
      <nav className="flex w-full items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter text-[#ff66aa]">
          o!tcg
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm leading-none font-bold">{user.username}</p>
            <p className="text-xs font-medium text-pink-500">
              {user.pp?.toLocaleString()} PP
            </p>
          </div>

          <DropdownMenu>
            {/* Using asChild on the Avatar directly to prevent <button> inside <button> */}
            <DropdownMenuTrigger>
              <Avatar className="h-10 w-10 cursor-pointer border-2 border-transparent transition-all hover:border-[#ff66aa] focus:outline-none">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer font-medium text-red-500"
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Alpha Alert */}
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Alpha Version</AlertTitle>
        <AlertDescription>
          Inventory synced for <strong>{user.username}</strong>. Good luck with
          your pulls!
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="packs" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50">
          <TabsTrigger value="packs" className="gap-2">
            <Package className="h-4 w-4" /> Packs ({packs.length})
          </TabsTrigger>
          <TabsTrigger value="cards" className="gap-2">
            <Layers className="h-4 w-4" /> Cards ({cards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packs" className="mt-8">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-8">
            {packs.map((pack) => (
              <Card
                key={pack.id}
                onClick={() => setSelectedPack(pack)}
                className="group cursor-pointer overflow-hidden border-2 bg-card transition-all hover:border-[#ff66aa]"
              >
                <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center bg-zinc-900 p-6 text-center">
                  {pack.pack_cover ? (
                    <img
                      src={pack.pack_cover}
                      className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-60"
                      alt=""
                    />
                  ) : (
                    <div className="mb-4 text-6xl transition-transform group-hover:scale-110">
                      📦
                    </div>
                  )}
                  <Badge variant="secondary" className="z-10 font-mono">
                    {pack.pack_weight}g
                  </Badge>
                  <div className="z-10 mt-4 space-y-1">
                    <p className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                      Security Score
                    </p>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${pack.security_score * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <CardHeader className="border-t p-4">
                  <CardTitle className="truncate text-sm tracking-tight uppercase">
                    {pack.pack_type.replace("_", " ")}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
            {packs.length === 0 && (
              <div className="col-span-full rounded-2xl border-2 border-dashed py-20 text-center opacity-50">
                <p>No packs found. Gain medals to earn more!</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cards" className="mt-8">
          {/* Using auto-fill with a min-width of 280px ensures cards have enough space to not overflow art */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] justify-items-center gap-8">
            {cards.map((item) => {
              const playerInfo = GAME_DATA.sets.genesis.cards.find(
                (c) => c.id === item.card_id
              )
              if (!playerInfo) return null
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedCard({ ...playerInfo, ...item })}
                  className="w-full max-w-[320px] cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  <PlayerCardUI
                    player={playerInfo}
                    grade={item.is_graded ? item.grade_value : null}
                  />
                </div>
              )
            })}
            {cards.length === 0 && (
              <div className="col-span-full rounded-2xl border-2 border-dashed py-20 text-center opacity-50">
                <p>
                  Your collection is empty. Open a pack to reveal player cards!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="border-zinc-800 bg-zinc-950 p-0 text-white outline-none sm:max-w-4xl">
          {selectedPack && (
            <PackOpener
              pack={selectedPack}
              userId={user.id}
              onOpenComplete={() => {
                refreshInventory()
                setSelectedPack(null)
              }}
              onClose={() => setSelectedPack(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent
          /* 1. sm:max-w-none overrides the default shadcn modal width limits.
       2. w-[95vw] ensures it takes up 95% of the screen width.
       3. flex items-center justify-center centers your card inside the modal.
    */
          className="flex h-[90vh] w-[95vw] max-w-[1400px] items-center justify-center overflow-hidden border-zinc-800 bg-zinc-950 p-6 text-white outline-none sm:max-w-none"
        >
          {selectedCard && (
            <div className="flex h-full w-full items-center justify-center">
              {/* We wrap it in a container that scales to fit the modal height */}
              <div className="h-full max-h-full w-full">
                <DetailedCardView card={selectedCard} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
