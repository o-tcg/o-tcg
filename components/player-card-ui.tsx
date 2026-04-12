import { Badge } from "components/ui/badge"

export function PlayerCardUI({ player, grade }: any) {
  const rarityColors: any = {
    "Ultra Rare": "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
    Rare: "border-zinc-300",
    Common: "border-zinc-800",
  }

  return (
    <div
      className={`group relative aspect-2.5/3.5 overflow-hidden rounded-xl border-2 bg-zinc-900 transition-all hover:scale-105 ${rarityColors[player.rarity]}`}
    >
      {/* Top Header: Grade & Rarity */}
      <div className="absolute top-2 right-2 left-2 z-10 flex items-center justify-between">
        <Badge className="border-zinc-700 bg-black/60 text-[8px] backdrop-blur-md">
          {player.rarity}
        </Badge>
        {grade && (
          <div className="rounded bg-yellow-500 px-1.5 py-0.5 text-xs font-black text-black shadow-lg">
            {grade}
          </div>
        )}
      </div>

      {/* Player Avatar */}
      <div className="absolute inset-0 z-0">
        <img
          src={`https://a.ppy.sh/${player.playerId}`}
          alt={player.name}
          className="h-full w-full object-cover opacity-60 grayscale-[0.3] transition-all group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute right-0 bottom-0 left-0 z-10 space-y-2 p-3">
        <div>
          <h4 className="text-sm leading-none font-black tracking-tighter text-white uppercase italic">
            {player.name}
          </h4>
          <p className="text-[10px] font-medium text-zinc-400">
            Rank #{player.baseStats.ppRank}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="rounded bg-white/10 p-1 backdrop-blur-md">
            <p className="text-[7px] font-bold text-zinc-400 uppercase">Aim</p>
            <p className="text-[10px] font-black text-white">
              {player.baseStats.aim}
            </p>
          </div>
          <div className="rounded bg-white/10 p-1 backdrop-blur-md">
            <p className="text-[7px] font-bold text-zinc-400 uppercase">Tap</p>
            <p className="text-[10px] font-black text-white">
              {player.baseStats.tapping}
            </p>
          </div>
        </div>

        {/* Nerves Bar */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[7px] font-bold text-zinc-400 uppercase">
            <span>Nerves</span>
            <span>{player.baseStats.nerves}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full bg-pink-500"
              style={{ width: `${player.baseStats.nerves}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
