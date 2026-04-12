import { Hono } from "hono"
import { setCookie } from "hono/cookie"
import { cors } from "hono/cors"

// Define the shape of your environment variables
type Bindings = {
  OSU_CLIENT_ID: string
  OSU_CLIENT_SECRET: string
  REDIRECT_URI: string
  FRONTEND_URL: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Allow your Next.js frontend to talk to this API
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

// STEP 1: Send user to osu!
app.get("/auth/osu", (c) => {
  const url = `https://osu.ppy.sh/oauth/authorize?client_id=${c.env.OSU_CLIENT_ID}&redirect_uri=${c.env.REDIRECT_URI}&response_type=code&scope=identify`
  return c.redirect(url)
})

// STEP 2: osu! sends them back here with a ?code=...
app.get("/auth/callback", async (c) => {
  const code = c.req.query("code")

  if (!code) return c.text("No code provided", 400)

  // Exchange code for Access Token
  const response = await fetch("https://osu.ppy.sh/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.env.OSU_CLIENT_ID,
      client_secret: c.env.OSU_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: c.env.REDIRECT_URI,
    }),
  })

  const tokenData: any = await response.json()

  // Fetch user profile using the token
  const userRes = await fetch("https://osu.ppy.sh/api/v2/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })

  const userData: any = await userRes.json()

  // Save minimal info in a cookie (normally you'd use a JWT here)
  setCookie(
    c,
    "osu_user",
    JSON.stringify({
      username: userData.username,
      avatar_url: userData.avatar_url,
    }),
    {
      httpOnly: false, // Set to false so Next.js can read it for now
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    }
  )

  // Send them home!
  return c.redirect(`${c.env.FRONTEND_URL}/home`)
})

export default app
