import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";

const CLASS_ICONS: Record<string, string> = {
  Guerreiro: "/classes/guerreiro_m.png",
  Ninja: "/classes/ninja_m.png",
  Shura: "/classes/shura_m.png",
  Shaman: "/classes/shaman_m.png",
};

const KINGDOM_FLAGS: Record<string, string> = {
  Chunjo: "/kingdoms/chunjo.webp",
  Jinno: "/kingdoms/jinno.webp",
  Shinsoo: "/kingdoms/shinsoo.webp",
};

const MOCK_PLAYERS = [
  {
    rank: 1,
    name: "DarkLord",
    class: "Guerreiro",
    level: 105,
    guild: "Immortals",
    kingdom: "Jinno",
    kills: 4820,
  },
  {
    rank: 2,
    name: "ShadowStep",
    class: "Ninja",
    level: 104,
    guild: "Shadows",
    kingdom: "Shinsoo",
    kills: 4105,
  },
  {
    rank: 3,
    name: "MagicWeaver",
    class: "Shura",
    level: 104,
    guild: "Immortals",
    kingdom: "Jinno",
    kills: 3987,
  },
  {
    rank: 4,
    name: "HealMe",
    class: "Shaman",
    level: 102,
    guild: "Support",
    kingdom: "Chunjo",
    kills: 3540,
  },
  {
    rank: 5,
    name: "BladeMaster",
    class: "Guerreiro",
    level: 101,
    guild: "Warriors",
    kingdom: "Shinsoo",
    kills: 3210,
  },
  {
    rank: 6,
    name: "Assassin",
    class: "Ninja",
    level: 100,
    guild: "Shadows",
    kingdom: "Jinno",
    kills: 2980,
  },
  {
    rank: 7,
    name: "DarkMage",
    class: "Shura",
    level: 99,
    guild: "Magic",
    kingdom: "Chunjo",
    kills: 2750,
  },
  {
    rank: 8,
    name: "DragonSlayer",
    class: "Guerreiro",
    level: 98,
    guild: "Dragons",
    kingdom: "Jinno",
    kills: 2540,
  },
  {
    rank: 9,
    name: "SwiftStrike",
    class: "Ninja",
    level: 97,
    guild: "Shadows",
    kingdom: "Shinsoo",
    kills: 2310,
  },
  {
    rank: 10,
    name: "HolyLight",
    class: "Shaman",
    level: 96,
    guild: "Support",
    kingdom: "Jinno",
    kills: 2100,
  },
];

const MOCK_GUILDS = [
  {
    rank: 1,
    name: "Immortals",
    leader: "DarkLord",
    members: 48,
    kingdom: "Jinno",
    wins: 156,
    level: 20,
  },
  {
    rank: 2,
    name: "Shadows",
    leader: "ShadowStep",
    members: 45,
    kingdom: "Shinsoo",
    wins: 142,
    level: 19,
  },
  {
    rank: 3,
    name: "Warriors",
    leader: "BladeMaster",
    members: 42,
    kingdom: "Shinsoo",
    wins: 128,
    level: 18,
  },
  {
    rank: 4,
    name: "Support",
    leader: "HealMe",
    members: 38,
    kingdom: "Chunjo",
    wins: 115,
    level: 17,
  },
  {
    rank: 5,
    name: "Magic",
    leader: "DarkMage",
    members: 35,
    kingdom: "Chunjo",
    wins: 98,
    level: 16,
  },
  {
    rank: 6,
    name: "Dragons",
    leader: "DragonSlayer",
    members: 32,
    kingdom: "Jinno",
    wins: 87,
    level: 15,
  },
  {
    rank: 7,
    name: "Phoenix",
    leader: "FireBird",
    members: 30,
    kingdom: "Shinsoo",
    wins: 75,
    level: 14,
  },
  {
    rank: 8,
    name: "Titans",
    leader: "Thor",
    members: 28,
    kingdom: "Chunjo",
    wins: 63,
    level: 13,
  },
];

const MOCK_PVP = [
  {
    rank: 1,
    name: "DarkLord",
    class: "Guerreiro",
    kingdom: "Jinno",
    kills: 4820,
    deaths: 312,
    ratio: "15.4",
  },
  {
    rank: 2,
    name: "ShadowStep",
    class: "Ninja",
    kingdom: "Shinsoo",
    kills: 4105,
    deaths: 298,
    ratio: "13.8",
  },
  {
    rank: 3,
    name: "MagicWeaver",
    class: "Shura",
    kingdom: "Jinno",
    kills: 3987,
    deaths: 401,
    ratio: "9.9",
  },
  {
    rank: 4,
    name: "Assassin",
    class: "Ninja",
    kingdom: "Jinno",
    kills: 2980,
    deaths: 220,
    ratio: "13.5",
  },
  {
    rank: 5,
    name: "BladeMaster",
    class: "Guerreiro",
    kingdom: "Shinsoo",
    kills: 3210,
    deaths: 510,
    ratio: "6.3",
  },
  {
    rank: 6,
    name: "SwiftStrike",
    class: "Ninja",
    kingdom: "Shinsoo",
    kills: 2310,
    deaths: 189,
    ratio: "12.2",
  },
  {
    rank: 7,
    name: "DarkMage",
    class: "Shura",
    kingdom: "Chunjo",
    kills: 2750,
    deaths: 445,
    ratio: "6.2",
  },
  {
    rank: 8,
    name: "HolyLight",
    class: "Shaman",
    kingdom: "Jinno",
    kills: 2100,
    deaths: 310,
    ratio: "6.8",
  },
];

const MOCK_BOSSES = [
  {
    rank: 1,
    name: "DarkLord",
    class: "Guerreiro",
    kingdom: "Jinno",
    bosses: 1842,
  },
  {
    rank: 2,
    name: "DragonSlayer",
    class: "Guerreiro",
    kingdom: "Jinno",
    bosses: 1654,
  },
  {
    rank: 3,
    name: "MagicWeaver",
    class: "Shura",
    kingdom: "Jinno",
    bosses: 1521,
  },
  { rank: 4, name: "HealMe", class: "Shaman", kingdom: "Chunjo", bosses: 1398 },
  {
    rank: 5,
    name: "HolyLight",
    class: "Shaman",
    kingdom: "Jinno",
    bosses: 1287,
  },
  {
    rank: 6,
    name: "BladeMaster",
    class: "Guerreiro",
    kingdom: "Shinsoo",
    bosses: 1154,
  },
  {
    rank: 7,
    name: "DarkMage",
    class: "Shura",
    kingdom: "Chunjo",
    bosses: 1043,
  },
  {
    rank: 8,
    name: "ShadowStep",
    class: "Ninja",
    kingdom: "Shinsoo",
    bosses: 987,
  },
];

const RANK_MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

type RankedPlayer = {
  rank: number;
  id: number;
  name: string;
  class: string;
  level: number;
  guild: string;
  kingdom: string;
  playtime: number;
};

const TABS = ["Players"] as const;
type Tab = "Players" | "Guilds" | "PvP" | "Bosses";

function formatPlaytime(minutes: number) {
  if (!minutes) return "0h";
  const hours = Math.floor(minutes / 60);
  return `${hours.toLocaleString("pt-BR")}h`;
}

export default function Ranking() {
  const [activeTab, setActiveTab] = useState<Tab>("Players");
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<RankedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    params.set("limit", "100");
    if (search.trim()) params.set("search", search.trim());

    setLoading(true);
    setError(null);

    fetch(`/api/ranking/players?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data: { players?: RankedPlayer[] }) => setPlayers(data.players || []))
      .catch((err) => {
        if (err?.name !== "AbortError") setError("Nao foi possivel carregar o ranking agora.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search]);

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.guild.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredGuilds = MOCK_GUILDS.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.leader.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredPvP = MOCK_PVP.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredBosses = MOCK_BOSSES.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const SUBTITLES: Record<Tab, string> = {
    Players: "Os jogadores mais poderosos do Aura2.",
    Guilds: "As guildas que dominam os reinos.",
    PvP: "Os jogadores com mais vitórias em combate.",
    Bosses: "Os caçadores das criaturas mais perigosas.",
  };
  return (
    <div className="container mx-auto px-4 py-12 lg:py-24 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-wider">
            HALL DA FAMA
          </h1>
          <p className="text-muted-foreground text-lg transition-all duration-300">
            {SUBTITLES[activeTab]}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearch("");
                }}
                className={`px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,160,23,0.4)]"
                    : "bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "Guilds"
                  ? "Procurar guild..."
                  : "Procurar jogador..."
              }
              className="w-full bg-black/40 border border-primary/20 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-primary/50 transition"
            />
          </div>
        </div>

        {activeTab === "Players" && (
          <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="border-primary/20 hover:bg-transparent">
                  <TableHead className="w-16 text-center text-primary font-bold">
                    #
                  </TableHead>
                  <TableHead className="text-primary font-bold">Nome</TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Classe
                  </TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Nível
                  </TableHead>
                  <TableHead className="text-primary font-bold">
                    Guild
                  </TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Reino
                  </TableHead>
                  <TableHead className="text-primary font-bold text-right">
                    Tempo
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Carregando ranking...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-red-400 py-8"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                ) : filteredPlayers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum jogador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow
                      key={player.rank}
                      className="border-primary/10 hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="text-center font-display text-lg font-bold">
                        {RANK_MEDAL[player.rank] ? (
                          <span className="text-xl">
                            {RANK_MEDAL[player.rank]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {player.rank}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        {player.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={CLASS_ICONS[player.class]}
                            alt={player.class}
                            title={player.class}
                            className="w-9 h-9 rounded-lg object-cover"
                            style={{
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-mono text-primary font-bold">
                        {player.level}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {player.guild}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={KINGDOM_FLAGS[player.kingdom]}
                            alt={player.kingdom}
                            title={player.kingdom}
                            className="h-5 rounded-sm object-cover shadow-sm"
                            style={{ width: "2.25rem" }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-400 font-bold">
                        {formatPlaytime(player.playtime)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "Guilds" && (
          <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="border-primary/20 hover:bg-transparent">
                  <TableHead className="w-16 text-center text-primary font-bold">
                    #
                  </TableHead>
                  <TableHead className="text-primary font-bold">
                    Guild
                  </TableHead>
                  <TableHead className="text-primary font-bold">
                    Líder
                  </TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Membros
                  </TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Nível
                  </TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Reino
                  </TableHead>
                  <TableHead className="text-primary font-bold text-right">
                    Vitórias
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuilds.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhuma guild encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuilds.map((guild) => (
                    <TableRow
                      key={guild.rank}
                      className="border-primary/10 hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="text-center font-display text-lg font-bold">
                        {RANK_MEDAL[guild.rank] ? (
                          <span className="text-xl">
                            {RANK_MEDAL[guild.rank]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {guild.rank}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-white">
                        {guild.name}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {guild.leader}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {guild.members}
                      </TableCell>
                      <TableCell className="text-center font-mono text-primary font-bold">
                        {guild.level}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={KINGDOM_FLAGS[guild.kingdom]}
                            alt={guild.kingdom}
                            className="h-5 rounded-sm object-cover shadow-sm"
                            style={{ width: "2.25rem" }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-yellow-400 font-bold">
                        {guild.wins}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "PvP" && (
          <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="border-primary/20 hover:bg-transparent">
                  <TableHead className="w-16 text-center text-primary font-bold">
                    #
                  </TableHead>
                  <TableHead className="text-primary font-bold">Nome</TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Classe
                  </TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Reino
                  </TableHead>
                  <TableHead className="text-primary font-bold text-right">
                    Kills
                  </TableHead>
                  <TableHead className="text-primary font-bold text-right">
                    Mortes
                  </TableHead>
                  <TableHead className="text-primary font-bold text-right">
                    K/D
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPvP.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum jogador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPvP.map((player) => (
                    <TableRow
                      key={player.rank}
                      className="border-primary/10 hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="text-center font-display text-lg font-bold">
                        {RANK_MEDAL[player.rank] ? (
                          <span className="text-xl">
                            {RANK_MEDAL[player.rank]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {player.rank}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        {player.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={CLASS_ICONS[player.class]}
                            alt={player.class}
                            className="w-9 h-9 rounded-lg object-cover"
                            style={{
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={KINGDOM_FLAGS[player.kingdom]}
                            alt={player.kingdom}
                            className="h-5 rounded-sm object-cover shadow-sm"
                            style={{ width: "2.25rem" }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-red-400 font-bold">
                        {player.kills.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-gray-400">
                        {player.deaths}
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary font-bold">
                        {player.ratio}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "Bosses" && (
          <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden backdrop-blur-sm">
            <Table>
              <TableHeader className="bg-primary/5">
                <TableRow className="border-primary/20 hover:bg-transparent">
                  <TableHead className="w-16 text-center text-primary font-bold">
                    #
                  </TableHead>
                  <TableHead className="text-primary font-bold">Nome</TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Classe
                  </TableHead>
                  <TableHead className="text-primary font-bold text-center">
                    Reino
                  </TableHead>
                  <TableHead className="text-primary font-bold text-right">
                    Bosses Derrotados
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBosses.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum jogador encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBosses.map((player) => (
                    <TableRow
                      key={player.rank}
                      className="border-primary/10 hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="text-center font-display text-lg font-bold">
                        {RANK_MEDAL[player.rank] ? (
                          <span className="text-xl">
                            {RANK_MEDAL[player.rank]}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {player.rank}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        {player.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={CLASS_ICONS[player.class]}
                            alt={player.class}
                            className="w-9 h-9 rounded-lg object-cover"
                            style={{
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                          <img
                            src={KINGDOM_FLAGS[player.kingdom]}
                            alt={player.kingdom}
                            className="h-5 rounded-sm object-cover shadow-sm"
                            style={{ width: "2.25rem" }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-primary font-bold">
                        {player.bosses.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
