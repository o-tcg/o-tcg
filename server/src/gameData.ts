export type Rarity = "Common" | "Rare" | "Ultra Rare" | "Holo"

export interface PlayerCard {
  id: string
  playerId: string
  name: string
  rarity: Rarity
  baseStats: {
    ppRank: number
    nerves: number // 0-100
    aim: number // 0-100
    tapping: number // 0-100
  }
  slots: {
    nm: number[] // [nm1, nm2, nm3, nm4, nm5, nm6]
    hd: number[] // [hd1, hd2, hd3, hd4]
    hr: number[] // [hr1, hr2, hr3, hr4]
    dt: number[] // [dt1, dt2, dt3, dt4]
    fm: number[] // [fm1, fm2, fm3, fm4]
    tb: number // Tiebreaker score
  }
  description: string
}

export const GAME_DATA = {
  sets: {
    genesis: {
      name: "Genesis Set",
      packs: [
        { id: "std_blue", cover: "blue_osu_std.png", chance: 0.499975 },
        { id: "std_pink", cover: "pink_osu_std.png", chance: 0.499975 },
        { id: "ultra_rare_cover", cover: "golden_pippi.png", chance: 0.00005 },
      ],
      cards: [
        {
          id: "p1",
          playerId: "2",
          name: "peppy",
          rarity: "Ultra Rare",
          baseStats: { ppRank: 1, nerves: 100, aim: 100, tapping: 100 },
          slots: {
            nm: [999999, 999999, 999999, 999999, 999999, 999999],
            hd: [999999, 999999, 999999, 999999],
            hr: [999999, 999999, 999999, 999999],
            dt: [999999, 999999, 999999, 999999],
            fm: [999999, 999999, 999999, 999999],
            tb: 999999,
          },
          description: "The creator. Flawless in every slot.",
        },
        {
          id: "p2",
          playerId: "124493",
          name: "BTMC",
          rarity: "Rare",
          baseStats: { ppRank: 500, nerves: 45, aim: 88, tapping: 82 },
          slots: {
            nm: [985000, 970000, 920000, 910000, 890000, 850000],
            hd: [940000, 910000, 880000, 850000],
            hr: [990000, 980000, 950000, 920000],
            dt: [850000, 820000, 780000, 750000],
            fm: [960000, 940000, 910000, 880000],
            tb: 955000,
          },
          description: "Inconsistent nerves but god-tier HR consistency.",
        },
      ] as PlayerCard[],
    },
  },
  weightTiers: [
    {
      min: 26.0,
      name: "Holy",
      guaranteedRare: 3,
      otherCardRareChance: 0.15,
      weightRoll: () => 26.0 + Math.random(),
    },
    {
      min: 24.5,
      name: "Rare",
      guaranteedRare: 1,
      otherCardRareChance: 0.025,
      weightRoll: () => 24.5 + Math.random() * 0.5,
    },
    {
      min: 24.2,
      name: "Normal+",
      guaranteedRare: 0,
      otherCardRareChance: 0.025,
      weightRoll: () => 24.2 + Math.random() * 0.3,
    },
    {
      min: 24.0,
      name: "Normal",
      guaranteedRare: 0,
      otherCardRareChance: 0,
      weightRoll: () => 24.0,
    },
  ],
}
