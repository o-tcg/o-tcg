import { Hono } from "hono"
import { setCookie } from "hono/cookie"
import { cors } from "hono/cors"
import { sign } from "hono/jwt"
import { GAME_DATA, Rarity } from "./gameData"
type D1Database = any
type Bindings = {
  OSU_CLIENT_ID: string
  OSU_CLIENT_SECRET: string
  REDIRECT_URI: string
  FRONTEND_URL: string
  osu_tcg_db: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use("*", cors({ origin: "http://localhost:3000", credentials: true }))

const generatePackMetadata = () => {
  const roll = Math.random() * 100
  let tier = GAME_DATA.weightTiers[3]
  if (roll > 99.9) tier = GAME_DATA.weightTiers[0]
  else if (roll > 90) tier = GAME_DATA.weightTiers[1]
  else if (roll > 70) tier = GAME_DATA.weightTiers[2]

  const coverRoll = Math.random()
  let cumulative = 0
  let selectedCover = GAME_DATA.sets.genesis.packs[0]
  for (const p of GAME_DATA.sets.genesis.packs) {
    cumulative += p.chance
    if (coverRoll < cumulative) {
      selectedCover = p
      break
    }
  }

  return {
    weight: tier.weightRoll().toFixed(2),
    cover: selectedCover.cover,
    pack_type: selectedCover.id,
  }
}

app.get("/auth/osu", (c) => {
  const url = `https://osu.ppy.sh/oauth/authorize?client_id=${c.env.OSU_CLIENT_ID}&redirect_uri=${c.env.REDIRECT_URI}&response_type=code&scope=identify`
  return c.redirect(url)
})

app.get("/auth/callback", async (c) => {
  const code = c.req.query("code")
  const tokenResponse = await fetch("https://osu.ppy.sh/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.env.OSU_CLIENT_ID,
      client_secret: c.env.OSU_CLIENT_SECRET,
      code: code!,
      grant_type: "authorization_code",
      redirect_uri: c.env.REDIRECT_URI,
    }),
  })
  const tokens: any = await tokenResponse.json()
  const userRes = await fetch("https://osu.ppy.sh/api/v2/me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const osuUser: any = await userRes.json()

  const existingUser = await c.env.osu_tcg_db
    .prepare("SELECT id FROM users WHERE id = ?")
    .bind(String(osuUser.id))
    .first()

  await c.env.osu_tcg_db
    .prepare(
      `
    INSERT INTO users (id, username, avatar_url, access_token)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET username = excluded.username, avatar_url = excluded.avatar_url
  `
    )
    .bind(
      String(osuUser.id),
      osuUser.username,
      osuUser.avatar_url,
      tokens.access_token
    )
    .run()

  if (!existingUser) {
    const extraPacks =
      Math.floor((osuUser.user_achievements?.length || 0) / 10) + 5
    for (let i = 0; i < extraPacks; i++) {
      const meta = generatePackMetadata()
      await c.env.osu_tcg_db
        .prepare(
          `
        INSERT INTO user_inventory (user_id, is_sealed, pack_weight, pack_cover, pack_type, security_score, is_resealed) 
        VALUES (?, 1, ?, ?, ?, 1.0, 0)
      `
        )
        .bind(String(osuUser.id), meta.weight, meta.cover, meta.pack_type)
        .run()
    }
  }

  setCookie(
    c,
    "osu_user",
    JSON.stringify({
      id: String(osuUser.id),
      username: osuUser.username,
      avatar_url: osuUser.avatar_url,
      pp: osuUser.statistics.pp,
    }),
    { path: "/", maxAge: 60 * 60 * 24, httpOnly: false }
  )

  return c.redirect(`${c.env.FRONTEND_URL}/home`)
})

app.post("/api/open-pack", async (c) => {
  try {
    const { packId, userId } = await c.req.json()

    const pack: any = await c.env.osu_tcg_db
      .prepare(
        "SELECT * FROM user_inventory WHERE id = ? AND user_id = ? AND is_sealed = 1"
      )
      .bind(packId, userId)
      .first()

    if (!pack) return c.json({ error: "Pack not found or already opened" }, 404)

    const pulledCards = []
    const cardPool = GAME_DATA.sets.genesis.cards

    for (let i = 0; i < 8; i++) {
      const rarity = Math.random() > 0.9 ? "Rare" : "Common"
      let possible = cardPool.filter((c) => c.rarity === rarity)
      if (possible.length === 0) possible = cardPool

      const selection = possible[Math.floor(Math.random() * possible.length)]
      if (selection) pulledCards.push(selection)
    }

    const batch = [
      c.env.osu_tcg_db
        .prepare("UPDATE user_inventory SET is_sealed = 0 WHERE id = ?")
        .bind(packId),
    ]

    for (const card of pulledCards) {
      batch.push(
        c.env.osu_tcg_db
          .prepare(
            "INSERT INTO user_inventory (user_id, card_id, is_sealed, is_graded, security_score, is_resealed) VALUES (?, ?, 0, 0, 1.0, 0)"
          )
          .bind(userId, card.id)
      )
    }

    await c.env.osu_tcg_db.batch(batch)
    return c.json({ cards: pulledCards })
  } catch (err: any) {
    console.error("CRITICAL BACKEND ERROR:", err.message)
    return c.json({ error: "Internal Server Error", message: err.message }, 500)
  }
})
app.post("/api/reseal-pack", async (c) => {
  const { packId, userId } = await c.req.json()
  const penalty = 0.6 + Math.random() * 0.3
  await c.env.osu_tcg_db
    .prepare(
      "UPDATE user_inventory SET is_resealed = 1, security_score = security_score * ? WHERE id = ? AND user_id = ?"
    )
    .bind(penalty, packId, userId)
    .run()
  return c.json({ success: true })
})

app.post("/api/grade-card", async (c) => {
  const { cardId, userId } = await c.req.json()
  const grade = (Math.random() * 10).toFixed(1)
  await c.env.osu_tcg_db
    .prepare(
      "UPDATE user_inventory SET is_graded = 1, grade_value = ? WHERE id = ? AND user_id = ?"
    )
    .bind(grade, cardId, userId)
    .run()
  return c.json({ grade })
})
app.get("/api/inventory", async (c) => {
  const userId = c.req.query("userId")

  if (!userId) {
    return c.json({ error: "userId is required" }, 400)
  }

  try {
    const data = await c.env.osu_tcg_db
      .prepare("SELECT * FROM user_inventory WHERE user_id = ?")
      .bind(String(userId))
      .all()

    return c.json(data)
  } catch (err: any) {
    return c.json({ error: "Database error", message: err.message }, 500)
  }
})
app.notFound((c) => {
  return c.json(
    {
      error: "Not Found",
      message: "Hono worker is live but route doesn't exist",
    },
    404
  )
})
export default app
