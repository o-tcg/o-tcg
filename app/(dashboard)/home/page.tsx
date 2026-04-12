"use client"

import { useEffect, useState } from "react"
import { getCookie, deleteCookie } from "cookies-next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { XCircle, InfoIcon } from "lucide-react"
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

export default function Page() {
  const router = useRouter()
  const handleLogout = () => {
    deleteCookie("osu_user")
    setUser(null)
    router.push("/")
  }
  const [user, setUser] = useState<{
    username: string
    avatar_url: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const session = getCookie("osu_user")
    if (session) {
      try {
        setUser(JSON.parse(session as string))
      } catch (e) {
        console.error("Session parse error", e)
      }
    }
    setIsLoading(false)
  }, [])

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

  return (
    <div className="flex min-h-svh flex-col items-stretch gap-12 p-6">
      <nav className="flex w-full items-center justify-between">
        <div className="text-2xl font-bold tracking-tighter text-[#ff66aa]">
          o!tcg
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">
            {user.username}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent transition-all hover:border-[#ff66aa]">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback>{user.username[0]}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Collection</DropdownMenuItem>
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

      <Alert className="max-w-2xl self-center border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/20">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          This website is still in <strong>alpha version</strong>. Things might
          break!
        </AlertDescription>
      </Alert>
    </div>
  )
}
