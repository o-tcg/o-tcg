import { Hono } from "hono"
import { setCookie } from "hono/cookie"
import { cors } from "hono/cors"
import { sign } from "hono/jwt"

type Bindings = {
  OSU_CLIENT_ID: string
  OSU_CLIENT_SECRET: string
  REDIRECT_URI: string
  FRONTEND_URL: string
  osu_tcg_db: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

app.get("/auth/osu", (c) => {
  const url = `https://osu.ppy.sh/oauth/authorize?client_id=${c.env.OSU_CLIENT_ID}&redirect_uri=${c.env.REDIRECT_URI}&response_type=code&scope=identify`
  return c.redirect(url)
})

app.get("/auth/callback", async (c) => {
  const code = c.req.query("code")
  if (!code) return c.text("Auth failed", 400)

  const tokenResponse = await fetch("https://osu.ppy.sh/oauth/token", {
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

  const tokens: any = await tokenResponse.json()

  const userResponse = await fetch("https://osu.ppy.sh/api/v2/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const osuUser: any = await userResponse.json()

  await c.env.osu_tcg_db
    .prepare(
      `
    INSERT INTO users (id, username, avatar_url, access_token)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      avatar_url = excluded.avatar_url,
      access_token = excluded.access_token
  `
    )
    .bind(
      String(osuUser.id),
      osuUser.username,
      osuUser.avatar_url,
      tokens.access_token
    )
    .run()

  const payload = {
    id: String(osuUser.id),
    username: osuUser.username,
    avatar_url: osuUser.avatar_url,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }

  const token = await sign(payload, c.env.JWT_SECRET || "top-secret-key")

  setCookie(
    c,
    "osu_user",
    JSON.stringify({
      username: osuUser.username,
      avatar_url: osuUser.avatar_url,
    }),
    {
      path: "/",
      maxAge: 60 * 60 * 24,
      httpOnly: false,
    }
  )

  return c.redirect(`${c.env.FRONTEND_URL}/home`)
})

export default app
