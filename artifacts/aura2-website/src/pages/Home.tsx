import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Download, MessagesSquare, ExternalLink, X, Tv, Radio } from "lucide-react";

const CLASSES = [
  {
    id: "guerreiro",
    name: "Guerreiro",
    portrait: { M: "/classes/guerreiro_m.png", F: "/classes/guerreiro_f.png" },
    accentHex: "#B41E1E",
    glowHex: "#ff4444",
    accentRgb: "180,30,30",
    videoSrc: { M: "/guerreiro.mp4", F: "/guerreiro_f.mp4" },
  },
  {
    id: "ninja",
    name: "Ninja",
    portrait: { M: "/classes/ninja_m.png", F: "/classes/ninja_f.png" },
    accentHex: "#14A078",
    glowHex: "#00ffcc",
    accentRgb: "20,160,120",
    videoSrc: { M: "/ninja.mp4", F: "/ninja_f.mp4" },
  },
  {
    id: "shura",
    name: "Shura",
    portrait: { M: "/classes/shura_m.png", F: "/classes/shura_f.png" },
    accentHex: "#8228C8",
    glowHex: "#cc44ff",
    accentRgb: "130,40,200",
    videoSrc: { M: "/shura.mp4", F: "/shura_f.mp4" },
  },
  {
    id: "shaman",
    name: "Shaman",
    portrait: { M: "/classes/shaman_m.png", F: "/classes/shaman_f.png" },
    accentHex: "#2882DC",
    glowHex: "#44aaff",
    accentRgb: "40,130,220",
    videoSrc: { M: "/shaman.mp4", F: "/shaman_f.mp4" },
  },
] as const;

type ClassId = (typeof CLASSES)[number]["id"];
type Gender = "M" | "F";
type VideoKey = `${ClassId}-${"M" | "F"}`;

type HomeRankedPlayer = {
  rank: number;
  id?: number;
  name: string;
  class: string;
  level: number;
  guild?: string;
  kingdom?: string;
};

const HOME_CLASS_ICONS: Record<string, string> = {
  Guerreiro: "/classes/guerreiro_m.png",
  Ninja: "/classes/ninja_m.png",
  Shura: "/classes/shura_m.png",
  Shaman: "/classes/shaman_m.png",
};

const HOME_KINGDOM_FLAGS: Record<string, string> = {
  Chunjo: "/kingdoms/chunjo.webp",
  Jinno: "/kingdoms/shinsoo.webp",
  Shinsoo: "/kingdoms/jinno.webp",
};

const ALL_VIDEOS: { key: VideoKey; src: string }[] = CLASSES.flatMap((cls) =>
  (["M", "F"] as Gender[]).map((g) => ({
    key: `${cls.id}-${g}` as VideoKey,
    src: cls.videoSrc[g],
  })),
);

const TABS = ["Fase Beta", "Notícias", "Atualizações"] as const;
type Tab = (typeof TABS)[number];

type Post = {
  id: number;
  category: string;
  categoryColor: string;
  title: string;
  ago: string;
  gradient: string;
  image?: string;
  desc?: string;
  badge?: string;
  featured?: boolean;
  fullContent: string;
};

type ApiNewsItem = {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
};

function newsToPost(item: ApiNewsItem): Post {
  const fullContent = item.content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  const plainContent = fullContent.replace(/\s+/g, " ").trim();
  const createdAt = new Date(item.createdAt);
  const ago = Number.isNaN(createdAt.getTime())
    ? "recente"
    : new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(createdAt);

  return {
    id: item.id,
    category: "Notícias",
    categoryColor: "#2471a3",
    title: item.title,
    ago,
    gradient: "linear-gradient(135deg, #071426 0%, #123b66 55%, #071426 100%)",
    image: item.imageUrl || undefined,
    desc: plainContent.slice(0, 180),
    fullContent,
  };
}

const POSTS: Record<Tab, Post[]> = {
  "Fase Beta": [
    {
      id: 1,
      category: "Fase Beta",
      categoryColor: "#b8860b",
      title: "Beta Fechado — 15 Dias de Testes",
      ago: "hoje",
      image: "/posts/shura-patchnotes.png",
      gradient: "linear-gradient(135deg, #8a5200ee 0%, #d48000dd 60%, #a06000ee 100%)",

      desc: "Beta fechado com 15 a 20 testadores selecionados a dedo. Durante 15 dias, a equipe avalia cada sistema antes do lançamento oficial.",
      badge: "⚡ ACONTECENDO AGORA",
      featured: true,
      fullContent: `O Aura2 entra oficialmente na sua Fase Beta Fechada! Durante 15 dias, entre 15 e 20 testadores selecionados pela equipe terão acesso exclusivo ao servidor para avaliar todos os sistemas antes do lançamento oficial.\n\nEste é um beta FECHADO — o acesso não é público e não há inscrições abertas. Os testadores foram convidados diretamente pela equipe.\n\nO que será testado:\n• Sistema de combate PvP e PvE\n• Balanceamento das 4 classes (Guerreiro, Ninja, Shura e Shaman)\n• Sistema de itens, drops e dungeons\n• Economia do servidor e loja de Cash\n• Estabilidade e performance geral\n\nPara os testadores selecionados:\nUse o cliente disponível na página de Download e entre com sua conta de testador. Qualquer bug ou problema encontrado deve ser reportado no Discord oficial. Cada reporte conta para o prêmio de Cash no lançamento!\n\nApós o encerramento da Fase Beta, o servidor oficial será aberto ao público geral.`,
    },
    {
      id: 2,
      category: "Recompensa",
      categoryColor: "#c0860a",
      title: "Cash de Recompensa no Lançamento Oficial",
      ago: "hoje",
      gradient: "linear-gradient(135deg, #7a4800ee 0%, #c07000dd 60%, #8a5000ee 100%)",

      desc: "Cada testador selecionado receberá Moedas no lançamento oficial como agradecimento pela participação no Beta Fechado.",
      badge: "🎁 RECOMPENSA",
      fullContent: `Para agradecer aos testadores que ajudaram a construir o Aura2 durante a Fase Beta Fechada, preparamos recompensas especiais para o lançamento oficial!\n\nComo funciona:\nCada testador convidado receberá Moedas creditados automaticamente na sua conta assim que o servidor oficial abrir, com base na sua participação durante os 15 dias de beta.\n\nQuantidade de Moedas por participação:\n• Jogou pelo menos 5 horas durante o beta: 5.000 Moedas\n• Reportou pelo menos 1 bug confirmado: +25.000 Moedas bônus\n• Jogou até o final do beta (15 dias completos): 50.000 Moedas\n\nAtenção importante:\nAs recompensas são rastreadas por IP — criar múltiplas contas não vai adiantar. A Fase Beta é FECHADA: apenas os 15 a 20 testadores selecionados a dedo pela equipe têm acesso. Não há vagas abertas ao público.\n\nQuando recebo?\nAs recompensas serão creditadas automaticamente nas primeiras 24 horas após a abertura oficial do servidor. Nenhuma ação é necessária — a conta do testador já está registrada.\n\nObrigado a cada testador por dedicar seu tempo para tornar o Aura2 o melhor servidor possível!`,
    },
    {
      id: 3,
      category: "Fase Beta",
      categoryColor: "#b8860b",
      title: "Reporte de Bugs — Como Participar",
      ago: "hoje",
      gradient: "linear-gradient(135deg, #6a4000ee 0%, #a86000dd 100%)",

      desc: "Encontrou algo errado? Reporte pelo Discord com prints e descrição detalhada. Bugs confirmados garantem recompensas extras no lançamento.",
      fullContent: `Como testador selecionado, reportar bugs é uma das suas responsabilidades mais importantes durante a Fase Beta Fechada.\n\nComo reportar um bug:\n1. Acesse o canal #reporte-bugs no Discord oficial do Aura2\n2. Use o template disponível no canal (Nome, Classe, Descrição do bug, Print/vídeo)\n3. Aguarde a confirmação da equipe\n\nO que reportar:\n• Crashes e desconexões inesperadas\n• Itens com stats incorretos ou duplicados\n• Habilidades que não funcionam corretamente\n• Exploits ou brechas que permitem vantagem injusta\n• Problemas visuais no mapa ou personagens\n\nO que NÃO é um bug:\n• Mecânicas intencionais do servidor (verifique no Wiki primeiro)\n• Lag causado pela sua própria conexão\n\nRecompensa por bug confirmado:\nCada bug reportado e confirmado pela equipe garante +25.000 Moedas extras no lançamento oficial. Bugs críticos podem garantir recompensas ainda maiores a critério da equipe!\n\nObrigado por dedicar seu tempo e ajudar a tornar o Aura2 o melhor servidor possível.`,
    },
    {
      id: 4,
      category: "Fase Beta",
      categoryColor: "#b8860b",
      title: "Regras e Conduta na Fase Beta",
      ago: "hoje",
      gradient: "linear-gradient(135deg, #5a3200ee 0%, #904e00dd 100%)",

      desc: "Respeite os outros testadores, não explore bugs intencionalmente e colabore com a equipe. Violações podem resultar em exclusão e perda da recompensa.",
      fullContent: `Para garantir que a Fase Beta Fechada seja produtiva e justa, todos os testadores selecionados devem seguir as regras abaixo.\n\nRegras obrigatórias:\n• Não explore bugs intencionalmente para obter vantagem sobre outros testadores\n• Reporte qualquer exploit encontrado imediatamente no Discord\n• Respeite todos os outros testadores — sem ofensas, racismo ou toxicidade\n• Não utilize programas externos (bots, hacks, speed hacks)\n• Não compartilhe o cliente ou acesso do servidor com terceiros — o beta é fechado\n• Não faça spam no chat do servidor ou no Discord\n\nConsequências de violações:\n• Aviso: infrações leves (primeira vez)\n• Exclusão do beta: exploits intencionais ou comportamento tóxico grave\n• Banimento permanente: uso de hacks ou exploits que prejudiquem outros\n• Perda da recompensa de Cash: qualquer violação das regras\n\nNossa missão na Fase Beta Fechada é simples: testar, reportar e colaborar. Cada testador foi escolhido a dedo — honre essa confiança!\n\nEm caso de dúvidas sobre as regras, fale com um membro da equipe no Discord.`,
    },
  ],
  "Notícias": [
    {
      id: 9,
      category: "Notícias",
      categoryColor: "#2471a3",
      title: "Patch Notes 13.05",
      ago: "há 2 semanas",
      gradient: "linear-gradient(135deg, #0c2a7aee 0%, #1858c8dd 60%, #1040a0ee 100%)",
      image: "/posts/patch-notes.png",

      desc: "Correções de balanceamento, novos itens na loja e melhorias de performance.",
      fullContent: `Atualização 13.05 — lançada em 13 de Maio\n\nBalanceamento de Classes:\n• Guerreiro (Tank/DPS): resistência física ajustada para equilíbrio no PvP\n• Ninja (DPS/Suporte): velocidade de ataque e precisão levemente aumentadas\n• Shura (DPS/Mago): custo de mana das magias elementais reduzido em 15%\n• Shaman (Suporte/Buff): eficiência de cura e buffs de grupo aumentada em 10%\n\nNovos Itens na Loja:\n• Brinco do Tigre (7 dias)\n• Brinco do Dragão (7 dias)\n• Montaria PvM (7 dias)\n• Livro do Sábio x5\n\nCorreções de Bugs:\n• Corrigido crash ao entrar na Torre Sakita com grupo completo\n• Corrigido problema onde poções de EXP não funcionavam na Caverna Demoníaca\n• Corrigida animação quebrada do Shura feminino ao usar teleporte\n• Corrigido drop incorreto de Yang em Metins de nível 75+\n• Corrigido Filtro de Drop não salvando configurações após reconexão\n\nMelhorias de Performance:\n• Redução de 20% no uso de memória do servidor\n• Otimização do sistema de carregamento de mapas\n• Melhoria no tempo de resposta durante spawn de World Bosses\n\nPróxima atualização prevista para 20 de Maio.`,
    },
    {
      id: 10,
      category: "Notícias",
      categoryColor: "#2471a3",
      title: "Sistema de Doação PIX Ativo",
      ago: "há 3 dias",
      gradient: "linear-gradient(135deg, #0a2888ee 0%, #1552c0dd 100%)",

      desc: "Agora é possível comprar Moedas via PIX diretamente pelo site com confirmação automática.",
      fullContent: `O sistema de doação via PIX está oficialmente ativo no Aura2!\n\nComo funciona:\n1. Acesse a página de Doação no menu do site\n2. Faça login na sua conta\n3. Escolha o pacote de Moedas desejado\n4. Escaneie o QR Code PIX ou copie a chave\n5. Realize o pagamento no seu banco\n6. O Cash é creditado automaticamente em até 5 minutos!\n\nPacotes disponíveis:\nTemos opções a partir de R$ 10,00 até R$ 1.000,00, com bônus de até 500.000 Moedas nos pacotes maiores.\n→LINK:/loja Acessar página de Doação\n\nConfirmação automática:\nO sistema usa a API do Mercado Pago com webhook de confirmação instantânea. Assim que o PIX é processado pelo banco, o servidor recebe a confirmação e credita o Cash automaticamente — sem precisar enviar comprovante!\n\nProblemas com o pagamento?\nSe o Cash não for creditado em 15 minutos, entre em contato pelo Discord com o ID da transação.`,
    },
    {
      id: 11,
      category: "Notícias",
      categoryColor: "#2471a3",
      title: "Discord Oficial Aberto",
      ago: "há 4 dias",
      gradient: "linear-gradient(135deg, #081a78ee 0%, #1240b0dd 100%)",

      desc: "O Discord oficial do Aura2 está aberto. Junte-se à comunidade e fique por dentro de tudo.",
      fullContent: `O Discord oficial do Aura2 está aberto para todos os jogadores!\n\nO que você encontra no Discord:\n• #anúncios — Atualizações, eventos e novidades oficiais\n• #reporte-bugs — Canal para reportar problemas durante a Fase Beta\n• #suporte — Atendimento da equipe para dúvidas e problemas\n• #builds-e-dicas — Compartilhe estratégias e builds com a comunidade\n• #offtopic — Bate-papo geral\n• #procuro-grupo — Encontre parceiros para dungeons e guerras\n\nCanais de voz:\n• Salas separadas por reino (Vermelho, Amarelo, Azul)\n• Sala de coordenação para Guerra de Reinos\n• Sala geral de voz\n\nBenefícios de entrar no Discord:\n• Ser o primeiro a saber sobre eventos e atualizações\n• Acesso a sorteios e giveaways exclusivos para membros\n• Contato direto com a equipe do servidor\n\nAcesse o link de convite fixado no site e entre agora! A comunidade do Aura2 te aguarda.`,
    },
    {
      id: 12,
      category: "Notícias",
      categoryColor: "#2471a3",
      title: "Suporte via Tickets no Site",
      ago: "hoje",
      gradient: "linear-gradient(135deg, #061468ee 0%, #0e309add 100%)",

      desc: "Agora você pode abrir tickets de suporte diretamente pela sua conta no site.",
      fullContent: `O sistema de suporte via tickets está disponível diretamente no site do Aura2!\n\nComo abrir um ticket:\n1. Faça login na sua conta no site\n2. Acesse "Minha Conta" no menu\n3. Clique em "Abrir Ticket de Suporte"\n4. Selecione a categoria do problema\n5. Descreva o problema com detalhes\n6. Aguarde a resposta da equipe\n\nCategorias disponíveis:\n• Problema técnico (não consigo entrar, crash, bug)\n• Conta (senha, e-mail, dados)\n• Pagamento (Cash não creditado, cobrança indevida)\n• Denúncia (hack, exploit, comportamento abusivo)\n• Outros\n\nTempo de resposta:\n• Problemas de pagamento: até 2 horas\n• Problemas técnicos: até 24 horas\n• Outros: até 48 horas\n\nAtenção: Para emergências urgentes (conta hackeada, perda de itens), use o canal #suporte-urgente no Discord para atendimento imediato.\n\nO sistema de tickets substitui o antigo método de suporte por e-mail e é muito mais rápido e eficiente.`,
    },
  ],
  "Atualizações": [
    {
      id: 13,
      category: "Update",
      categoryColor: "#1a7a4a",
      title: "Servidor Atualizado para v3.4",
      ago: "há 3 dias",
      gradient: "linear-gradient(135deg, #0a5a25ee 0%, #14a040dd 100%)",

      desc: "Atualização de estabilidade, correção de crashes e melhorias no sistema de PvP.",
      fullContent: `Versão 3.4 — lançada em 24 de Maio\n\nPrincipais mudanças:\n\nEstabilidade:\n• Melhorado sistema de gerenciamento de memória — menos desconexões inesperadas\n• Atualizado motor de física do servidor para reduzir lag em combates com muitos jogadores\n• Otimização do sistema de spawn de mobs e bosses\n\nSistemas:\n• Filtro de Drop: adicionadas novas categorias de itens para filtragem\n• Loja Offline: corrigido bug onde itens não apareciam após reconexão do vendedor\n• Detalhes do Personagem: agora exibe resistências elementais corretamente\n• Corrigido bug onde ataques à distância atravessavam obstáculos\n\nInterface:\n• Melhorada a leitura de dano nos números flutuantes\n• Indicador de buffs ativos mais visível\n• Teletransporte entre mapas com animação mais suave\n\nOutras correções:\n• Corrigida sincronização de animações em grupos grandes\n• Normalizado o spawn de Metins após reinicialização do servidor\n• Corrigido drop incorreto de Moedas da Conquista em Metins de nível 45–60\n• Set Inicial +9 sendo entregue corretamente para todos os novos personagens\n\nA equipe continua trabalhando para entregar um servidor cada vez mais estável. Obrigado pelo feedback de todos!`,
    },
    {
      id: 14,
      category: "Update",
      categoryColor: "#1a7a4a",
      title: "Dungeon: Caverna Demoníaca — Lord Gahnasel",
      ago: "há 1 semana",
      gradient: "linear-gradient(135deg, #0a3a10ee 0%, #187030dd 100%)",

      desc: "A Caverna Demoníaca é a dungeon de alto nível do Aura2. Boss final: Lord Gahnasel, com drops exclusivos e cosméticos únicos.",
      fullContent: `A Caverna Demoníaca é uma das duas dungeons do Aura2 — e a mais desafiadora para jogadores de alto nível!\n\nBoss Final — Lord Gahnasel:\nUm dos inimigos mais temidos do servidor. Lord Gahnasel guarda tesouros exclusivos que não aparecem em nenhum outro lugar do jogo.\n\nDrops do Lord Gahnasel:\n• Tesouro do Lord Gahnasel\n• Moedas da Conquista x15\n• Esfera da Benção x2\n• Soro da Persuasão x2\n• Livro do Sábio x2\n• Máscara da Fortuna\n• Pergaminho da Paz x5\n\nO que há no Tesouro do Lord Gahnasel (aleatório):\n• Máscara da Fortuna x2\n• Benção de Helong (G) ou Yoora (G)\n• Chifres de Ghanasel (Feminino ou Masculino) — 7 dias\n• Traje Ghanasel (Feminino ou Masculino) — 7 dias\n• Pedra Arco-Íris\n• Pet Lord Ghanasel — 7 dias\n• Coração do Ghanasel (item exclusivo)\n\nDicas:\n• Leve poção regeneradora e mantos em abundância\n• O tesouro final contém cosméticos exclusivos que não existem em nenhum outro lugar\n• Forme grupo para maximizar eficiência e chances de drop\n\nBoa sorte na Caverna Demoníaca!`,
    },
    {
      id: 15,
      category: "Update",
      categoryColor: "#1a7a4a",
      title: "Classe Shaman Rebalanceada",
      ago: "há 1 semana",
      gradient: "linear-gradient(135deg, #0a4018ee 0%, #18903add 100%)",

      desc: "Habilidades de cura e suporte da Shaman foram ajustadas para melhor equilíbrio no PvP.",
      fullContent: `Com base no feedback da comunidade e nos dados de balanceamento coletados, realizamos ajustes significativos na classe Shaman.\n\nSobre a Shaman no Aura2:\nA Shaman é a única classe de Suporte/Buff do servidor. Seu papel é curar aliados e amplificar o poder do grupo — indispensável em dungeons e combates em grupo.\n\nMudanças no PvP:\n• Poder de cura individual reduzido em 12% (era muito forte em duelos prolongados)\n• Buffs defensivos com duração levemente reduzida\n• Dano mágico aumentado em 10% para compensar a redução defensiva\n\nMudanças no PvE (dungeons Torre Sakita e Caverna Demoníaca):\n• Eficiência de cura em área aumentada em 20%\n• Duração dos buffs de grupo aumentada de 15 para 20 minutos\n• Mana base aumentada em 8% para suportar combates mais longos\n\nMudanças gerais:\n• Velocidade de cast levemente aumentada (+5%)\n• Animações de habilidades suavizadas\n• Correção: buffs de grupo não desapareciam corretamente ao trocar de mapa\n\nObjetivo do rebalanceamento:\nO Shaman deve ser essencial no PvE e competitiva no PvP, sem dominar duelos individuais. Continuaremos monitorando as estatísticas durante a Fase Beta.\n\nFeedback? Participe da discussão no canal #balanceamento do Discord.`,
    },
    {
      id: 16,
      category: "Update",
      categoryColor: "#1a7a4a",
      title: "Anti-Cheat Atualizado",
      ago: "há 2 semanas",
      gradient: "linear-gradient(135deg, #103010ee 0%, #205828dd 100%)",

      desc: "Sistema anti-cheat foi reforçado para garantir uma experiência justa para todos.",
      fullContent: `O sistema anti-cheat do Aura2 foi completamente renovado para garantir um ambiente de jogo justo para todos os jogadores!\n\nO que mudou:\n• Novo sistema de detecção de speed hacks com precisão melhorada em 40%\n• Detecção de bots e macros de automação aprimorada\n• Sistema de análise de padrões de movimento suspeitos\n• Integração com banco de dados de hacks conhecidos para Metin2\n\nO que o sistema detecta:\n• Speed hacks (movimentação além da velocidade normal)\n• Damage hacks (dano além do máximo permitido)\n• Bots de farm automático\n• Duplicação de itens\n• Modificações no cliente do jogo\n\nConsequências para cheaters:\n• 1ª detecção: banimento temporário de 7 dias + perda de todos os itens obtidos durante o uso\n• 2ª detecção: banimento permanente\n• Banimentos são revisáveis via ticket de suporte com comprovação\n\nNota importante:\nSe você receber um banimento indevido (falso positivo), abra um ticket imediatamente com prints e detalhes. Nossa equipe revisa em até 24 horas.\n\nO Aura2 é um servidor focado em jogo limpo e competição justa. Tolerância zero com trapaças!`,
    },
  ],
};

// ─── Edite aqui para trocar o canal em destaque ───────────────────────────────
const FEATURED_PARTNER = {
  name: "NomeDoCanal",
  platform: "twitch" as "twitch" | "youtube" | "kick",
  url: "https://twitch.tv/nomeDoCanal",
  viewers: "120",
  description: "O melhor conteúdo de Aura2 ao vivo. Não perde!",
  live: true,
};
// ──────────────────────────────────────────────────────────────────────────────

function VideoControls({ hidden }: { hidden: boolean }) {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);

  function getVideo() {
    return document.getElementById("hero-video") as HTMLVideoElement | null;
  }

  function toggleMute() {
    const v = getVideo();
    if (!v) return;
    const next = !isMuted;
    v.muted = next;
    if (!next) v.volume = volume;
    setIsMuted(next);
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    const v = getVideo();
    if (v) {
      v.volume = val;
      v.muted = val === 0;
    }
    setVolume(val);
    setIsMuted(val === 0);
  }

  return (
    <div
      className="absolute bottom-4 right-4 z-20 flex items-center gap-3 bg-black/60 border border-primary/30 px-4 py-2 rounded-xl backdrop-blur-sm transition-opacity duration-300"
      style={{
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? "none" : "auto",
      }}
    >
      <button
        onClick={toggleMute}
        className="text-white text-xl hover:scale-110 transition-transform"
        title={isMuted ? "Ativar som" : "Silenciar"}
      >
        {isMuted ? "🔇" : "🔊"}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={isMuted ? 0 : volume}
        onChange={handleVolume}
        className="w-24 accent-yellow-500 cursor-pointer"
      />
    </div>
  );
}

export default function Home() {
  const [selected, setSelected] = useState<ClassId | null>(null);
  const [gender, setGender] = useState<Gender>("M");
  const [activeTab, setActiveTab] = useState<Tab>("Fase Beta");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [liveNewsPosts, setLiveNewsPosts] = useState<Post[]>([]);
  const [topPlayers, setTopPlayers] = useState<HomeRankedPlayer[]>([]);
  const [topPlayersLoading, setTopPlayersLoading] = useState(true);
  const [topPlayersError, setTopPlayersError] = useState(false);
  const videoRefs = useRef<Partial<Record<VideoKey, HTMLVideoElement>>>({});

  useEffect(() => {
    const controller = new AbortController();

    setTopPlayersLoading(true);
    fetch("/api/ranking/players?limit=5", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("ranking");
        return res.json();
      })
      .then((data: { players?: HomeRankedPlayer[] }) => {
        setTopPlayers((data.players ?? []).slice(0, 5));
        setTopPlayersError(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setTopPlayers([]);
        setTopPlayersError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setTopPlayersLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/news", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("news");
        return res.json();
      })
      .then((data: { news?: ApiNewsItem[] }) => {
        setLiveNewsPosts((data.news ?? []).slice(0, 4).map(newsToPost));
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setLiveNewsPosts([]);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedPost(null); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [selectedPost]);

  const activeClass = CLASSES.find((c) => c.id === selected) ?? null;
  const activeKey: VideoKey | null = selected ? `${selected}-${gender}` : null;
  const visiblePosts =
    activeTab === "Notícias" && liveNewsPosts.length > 0
      ? liveNewsPosts
      : POSTS[activeTab];

  function showVideo(key: VideoKey) {
    for (const [k, v] of Object.entries(videoRefs.current)) {
      if (!v) continue;
      if (k === key) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else v.pause();
    }
  }

  function handleClassClick(cls: (typeof CLASSES)[number]) {
    const heroVideo = document.getElementById("hero-video") as HTMLVideoElement;
    if (selected === cls.id) {
      setSelected(null);
      Object.values(videoRefs.current).forEach((v) => v?.pause());
      if (heroVideo) heroVideo.play().catch(() => {});
      return;
    }
    setSelected(cls.id);
    if (heroVideo) heroVideo.pause();
    showVideo(`${cls.id}-${gender}`);
  }

  function handleGenderChange(g: Gender) {
    setGender(g);
    if (selected) showVideo(`${selected}-${g}`);
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      {/* HERO */}
      <div className="relative flex flex-col">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {ALL_VIDEOS.map(({ key, src }) => (
            <video
              key={key}
              ref={(el) => {
                if (el) videoRefs.current[key] = el;
              }}
              src={src}
              muted
              loop
              playsInline
              preload="none"
              className="absolute w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: activeKey === key ? 0.85 : 0 }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(8,5,2,0.92) 30%, rgba(8,5,2,0.3) 100%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <video
            id="hero-video"
            src="/trailer-metin2.mp4"
            autoPlay
            loop
            playsInline
            muted
            className="absolute w-full h-full object-cover transition-opacity duration-500"
            style={{ opacity: activeClass ? 0 : 0.5 }}
          />
          <div
            className="absolute inset-0 bg-background/60 transition-opacity duration-500"
            style={{ opacity: activeClass ? 0 : 1 }}
          />
        </div>

        <VideoControls hidden={!!activeClass} />

        <div className="container mx-auto px-4 pt-10 lg:pt-16 flex flex-col lg:flex-row items-start gap-8">
          <div className="flex-1 max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold text-primary backdrop-blur-sm">
              <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              Temporada 1 — Beta Fechado
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight">
              <span className="text-white">UMA NOVA LENDA</span>
              <br />
              <span className="text-primary animate-amber-pulse inline-block">
                NASCE
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
              Reviva a verdadeira experiência do Metin2 clássico com guerras
              épicas, PvP competitivo, farm balanceado e uma comunidade ativa.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(212,160,23,0.3)] hover:shadow-[0_0_40px_rgba(212,160,23,0.5)] transition-all"
              >
                <Link href="/download">
                  <Download className="w-5 h-5 mr-2" /> Download em breve
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto h-14 px-8 border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-wider backdrop-blur-sm"
              >
                <a href="https://discord.gg/BN6XbbqsM" target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.031.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg> Entrar no Discord
                </a>
              </Button>
            </div>
            <div>
              <div className="inline-flex items-center bg-black/40 border border-primary/20 rounded-lg p-4 backdrop-blur-sm gap-4">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  Servidor
                </p>
                <p className="text-2xl font-display text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />{" "}
                  Beta Fechado
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-10 mt-10">
          <div className="flex flex-col gap-3">
            <div
              className="flex items-center gap-2"
              style={{
                opacity: selected ? 1 : 0,
                transition: "opacity 0.3s ease",
                pointerEvents: selected ? "auto" : "none",
              }}
            >
              {(["M", "F"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleGenderChange(g)}
                  className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all"
                  style={{
                    background:
                      gender === g
                        ? (activeClass?.accentHex ?? "#D4A017")
                        : "rgba(255,255,255,0.08)",
                    color: gender === g ? "#fff" : "rgba(255,255,255,0.4)",
                    border:
                      gender === g
                        ? "none"
                        : "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {g === "M" ? "Masculino" : "Feminino"}
                </button>
              ))}
            </div>
            <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 overflow-x-auto pb-2">
              {CLASSES.map((cls) => {
                const isActive = selected === cls.id;
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleClassClick(cls)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 focus:outline-none"
                  >
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden transition-all duration-300"
                      style={{
                        border: isActive
                          ? `2px solid ${cls.accentHex}`
                          : "2px solid rgba(255,255,255,0.15)",
                        boxShadow: isActive
                          ? `0 0 22px ${cls.glowHex}99, 0 0 44px ${cls.glowHex}44`
                          : "none",
                        transform: isActive ? "scale(1.12)" : "scale(1)",
                      }}
                    >
                      <img
                        src={cls.portrait[gender]}
                        alt={cls.name}
                        className="w-full h-full object-cover"
                        style={{
                          filter: isActive
                            ? `brightness(1.15) contrast(1.1)`
                            : "brightness(0.75) contrast(1.05)",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs sm:text-sm font-semibold uppercase tracking-wider transition-colors duration-300"
                      style={{
                        color: isActive
                          ? cls.accentHex
                          : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {cls.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CRÔNICAS DO SERVIDOR */}
      <section className="relative z-30 py-14" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.4) 70%, transparent 100%)" }}>
        <div className="container mx-auto px-4">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] mb-2" style={{ color: "#D4A017" }}>— Temporada 1</p>
              <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-wide">
                Notícias & Atualizações
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="text-xs font-bold px-4 py-2 rounded-lg transition-all duration-200 uppercase tracking-wider"
                  style={{
                    background: activeTab === tab ? "rgba(212,160,23,0.18)" : "transparent",
                    color: activeTab === tab ? "#D4A017" : "rgba(255,255,255,0.4)",
                    boxShadow: activeTab === tab ? "0 0 12px rgba(212,160,23,0.15)" : "none",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Posts grid — featured left + 3 compact right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Featured post */}
            {(() => {
              const featured = visiblePosts[0];
              return (
                <div
                  key={featured.id}
                  onClick={() => setSelectedPost(featured)}
                  className="lg:col-span-3 group relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    minHeight: "360px",
                    backgroundImage: featured.image ? `url(${featured.image})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundColor: "#1a1000",
                    boxShadow: "0 0 40px rgba(212,160,23,0.12), 0 4px 32px rgba(0,0,0,0.6)",
                  }}
                >
                  {/* Overlay: image = dark bottom fade only; no image = vivid gradient */}
                  <div className="absolute inset-0" style={{ background: featured.image ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)" : featured.gradient }} />

                  {/* Badge */}
                  {featured.badge && (
                    <div className="absolute top-5 left-5 z-10">
                      <span className="text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg"
                        style={{ background: "rgba(0,0,0,0.7)", color: "#D4A017", border: "1px solid rgba(212,160,23,0.5)", backdropFilter: "blur(8px)" }}>
                        {featured.badge}
                      </span>
                    </div>
                  )}

                  {/* Content bottom */}
                  <div className="absolute inset-x-0 bottom-0 p-6" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)" }}>
                    <span className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-3"
                      style={{ background: featured.categoryColor + "33", color: featured.categoryColor, border: `1px solid ${featured.categoryColor}66` }}>
                      {featured.category}
                    </span>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors duration-200">
                      {featured.title}
                    </h3>
                    {featured.desc && (
                      <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-3">{featured.desc}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold">{featured.ago}</span>
                      <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200" style={{ color: "#D4A017" }}>
                        Ler mais <span>→</span>
                      </span>
                    </div>
                  </div>

                  {/* Hover glow border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/40 transition-all duration-300 pointer-events-none" />
                </div>
              );
            })()}

            {/* 3 compact posts */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              {visiblePosts.slice(1, 4).map((post) => (
                <div
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group flex gap-4 items-start rounded-xl p-4 cursor-pointer transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(212,160,23,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden relative"
                    style={{ background: post.image ? "#0d0a06" : post.gradient }}>
                    {post.image && (
                      <img src={post.image} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded mb-1.5"
                      style={{ background: post.categoryColor + "22", color: post.categoryColor }}>
                      {post.category}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-snug mb-1 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">{post.ago}</p>
                  </div>

                  <div className="flex-shrink-0 text-gray-700 group-hover:text-primary transition-colors duration-200 mt-1">
                    <span className="text-sm">→</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* PARCEIRO EM DESTAQUE */}
      {(() => {
        const PLATFORM_COLORS = { twitch: "#9146ff", youtube: "#ff0000", kick: "#53fc18" };
        const PLATFORM_LABELS = { twitch: "Twitch", youtube: "YouTube", kick: "Kick" };
        const color = PLATFORM_COLORS[FEATURED_PARTNER.platform];
        const label = PLATFORM_LABELS[FEATURED_PARTNER.platform];
        return (
          <section className="container mx-auto px-4 py-10">
            <a
              href={FEATURED_PARTNER.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #0d0a06 0%, #1a1208 60%, #0d0a06 100%)",
                  border: `1px solid ${color}33`,
                  boxShadow: `0 0 40px ${color}18, 0 4px 32px rgba(0,0,0,0.5)`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 60px ${color}30, 0 4px 40px rgba(0,0,0,0.7)`; (e.currentTarget as HTMLDivElement).style.borderColor = `${color}66`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 40px ${color}18, 0 4px 32px rgba(0,0,0,0.5)`; (e.currentTarget as HTMLDivElement).style.borderColor = `${color}33`; }}
              >
                {/* Subtle glow bg */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 20% 50%, ${color}0d, transparent 60%)` }} />

                <div className="relative flex flex-col sm:flex-row items-center gap-6 px-7 py-6">
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black select-none"
                    style={{ background: `${color}22`, border: `2px solid ${color}66`, color }}
                  >
                    {FEATURED_PARTNER.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    {/* Top row: label + live badge */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
                        <Tv className="inline w-3 h-3 mr-1 -mt-0.5" />{label}
                      </span>
                      {FEATURED_PARTNER.live && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-red-600/20 text-red-400 border border-red-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> AO VIVO
                        </span>
                      )}
                      <span className="text-xs text-gray-500">~{FEATURED_PARTNER.viewers} viewers</span>
                    </div>

                    <p className="font-display text-xl font-black text-white group-hover:text-primary transition-colors duration-200 truncate">
                      {FEATURED_PARTNER.name}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{FEATURED_PARTNER.description}</p>
                  </div>

                  {/* Section label (left, outside) - shown on left on desktop */}
                  <div className="hidden lg:flex flex-col items-end gap-1 mr-2 flex-shrink-0">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-[0.25em] font-semibold">Parceiro em</span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-[0.25em] font-semibold">Destaque</span>
                    <Radio className="w-4 h-4 text-muted-foreground/40 mt-1" />
                  </div>

                  {/* CTA */}
                  <div className="flex-shrink-0">
                    <div
                      className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-xl transition-all duration-200"
                      style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}
                    >
                      Assistir Agora <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </section>
        );
      })()}

      {/* TOP PLAYERS */}
      <section className="container mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">
              Hall da Fama
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-wide">
              Top Players
            </h2>
          </div>
          <Link href="/ranking">
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary border border-white/10 hover:border-primary/40 rounded-lg px-4 py-2 transition-all"
            >
              Ver Ranking <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
        <div className="bg-black/40 border border-primary/20 rounded-xl overflow-hidden backdrop-blur-sm">
          <table className="w-full">
            <thead className="bg-primary/5">
              <tr className="border-b border-primary/20">
                <th className="w-16 text-center text-primary font-bold py-3 px-4">
                  #
                </th>
                <th className="text-primary font-bold py-3 px-4 text-left">
                  Nome
                </th>
                <th className="text-primary font-bold py-3 px-4 text-center">
                  Classe
                </th>
                <th className="text-primary font-bold py-3 px-4 text-center">
                  Nível
                </th>
                <th className="text-primary font-bold py-3 px-4 text-left">
                  Guild
                </th>
                <th className="text-primary font-bold py-3 px-4 text-center">
                  Reino
                </th>
              </tr>
            </thead>
            <tbody>
              {topPlayersLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground">
                    Carregando Hall da Fama...
                  </td>
                </tr>
              ) : topPlayersError ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-red-400">
                    Nao foi possivel carregar os top players agora.
                  </td>
                </tr>
              ) : topPlayers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center text-muted-foreground">
                    Nenhum personagem no ranking ainda.
                  </td>
                </tr>
              ) : (
                topPlayers.map((player) => {
                  const classIcon = HOME_CLASS_ICONS[player.class];
                  const kingdomFlag = player.kingdom ? HOME_KINGDOM_FLAGS[player.kingdom] : null;

                  return (
                    <tr
                  key={player.id ?? `${player.rank}-${player.name}`}
                  className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                    >
                  <td className="text-center py-4 px-4 font-bold text-lg">
                    {player.rank === 1 ? (
                      "🥇"
                    ) : player.rank === 2 ? (
                      "🥈"
                    ) : player.rank === 3 ? (
                      "🥉"
                    ) : (
                      <span className="text-muted-foreground">
                        {player.rank}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">
                    {player.name}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {classIcon ? (
                      <img
                        src={classIcon}
                        alt={player.class}
                        className="w-9 h-9 rounded-lg object-cover mx-auto"
                        style={{
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                      />
                    ) : (
                      <span className="text-sm text-gray-300">
                        {player.class}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-primary font-bold">
                    {player.level}
                  </td>
                  <td className="py-4 px-4 text-gray-300">
                    {player.guild && player.guild !== "-"
                      ? player.guild
                      : "-"}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {kingdomFlag ? (
                      <img
                        src={kingdomFlag}
                        alt={player.kingdom}
                        className="h-5 rounded-sm object-cover shadow-sm mx-auto"
                        style={{ width: "2.25rem" }}
                      />
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CTA — PRONTO PARA JOGAR */}
      <section className="container mx-auto px-4 py-16">
        <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-black/60 p-12 md:p-20 text-center backdrop-blur-xl">
          {/* Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,160,23,0.08),transparent_70%)]" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 80%, rgba(180,30,30,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,160,23,0.08) 0%, transparent 50%)",
            }}
          />

          <div className="relative z-10 space-y-6">
            <p className="font-display text-4xl md:text-6xl font-black text-white">
              PRONTO PARA JOGAR?
            </p>
            <h2 className="text-xs text-primary uppercase tracking-[0.3em] font-semibold">
              JUNTE SE A NÓS
            </h2>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-4 opacity-40">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary" />
              <span className="text-primary text-lg">⚔</span>
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary" />
            </div>

            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Baixe agora e entre em uma experiência única inspirada nos
              melhores tempos do Metin2.
            </p>

            <Button
              size="lg"
              asChild
              className="h-14 px-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-lg shadow-[0_0_40px_rgba(212,160,23,0.4)] hover:shadow-[0_0_60px_rgba(212,160,23,0.6)] transition-all"
            >
              <Link href="/download" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                <Download className="w-5 h-5 mr-2" /> Download em breve
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* POST MODAL */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10"
            style={{ background: "linear-gradient(160deg, #0f0c06 0%, #1a1408 100%)", boxShadow: "0 0 60px rgba(212,160,23,0.15), 0 4px 40px rgba(0,0,0,0.8)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner */}
            <div className="h-24 rounded-t-2xl" style={{ background: selectedPost.gradient }} />

            {/* Close button */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 pt-5">
              {/* Category badge */}
              <span
                className="inline-block text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md mb-3"
                style={{ background: selectedPost.categoryColor + "33", color: selectedPost.categoryColor, border: `1px solid ${selectedPost.categoryColor}55` }}
              >
                {selectedPost.badge ?? selectedPost.category}
              </span>

              <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-2 leading-tight">
                {selectedPost.title}
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-5">
                {selectedPost.ago}
              </p>

              <div className="border-t border-white/8 pt-5">
                {selectedPost.fullContent.split("\n").map((line, i) => (
                  line === "" ? (
                    <div key={i} className="h-3" />
                  ) : line.startsWith("→LINK:") ? (() => {
                    const [, href, label] = line.match(/^→LINK:(\S+)\s+(.+)$/) ?? [];
                    return href ? (
                      <Link key={i} href={href}>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors cursor-pointer">
                          {label} →
                        </span>
                      </Link>
                    ) : null;
                  })() : (
                    <p
                      key={i}
                      className={`text-sm leading-relaxed ${line.startsWith("•") ? "text-gray-300 pl-3" : line.match(/^[A-ZÁÉÍÓÚÀÃÕÂÊÔ].*:$/) ? "text-white font-semibold mt-1" : "text-gray-400"}`}
                    >
                      {line}
                    </p>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
