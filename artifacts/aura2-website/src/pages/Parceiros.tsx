import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Tv, Trophy, Gift, Star, Users, Zap } from "lucide-react";

const BENEFITS = [
  {
    icon: Gift,
    title: "Cash Exclusivo",
    desc: "Receba Moedas mensalmente para usar ou sortear entre os seus viewers.",
    color: "#D4A017",
  },
  {
    icon: Star,
    title: "Badge no Jogo",
    desc: "Badge exclusivo de Parceiro no seu personagem, visível por todos os jogadores.",
    color: "#9b59b6",
  },
  {
    icon: Users,
    title: "Destaque no Site",
    desc: "Seu canal aparece na página oficial do Aura2, trazendo novos viewers para a sua stream.",
    color: "#2471a3",
  },
  {
    icon: Zap,
    title: "Acesso Antecipado",
    desc: "Primeiros a testar novas atualizações e eventos antes do lançamento público.",
    color: "#1a7a4a",
  },
  {
    icon: Trophy,
    title: "Eventos Exclusivos",
    desc: "Participe de eventos especiais criados para streams — boss raids ao vivo, PvP com viewers, etc.",
    color: "#c0392b",
  },
  {
    icon: Tv,
    title: "Suporte Prioritário",
    desc: "Canal direto com a equipe para suporte técnico e sugestões de conteúdo.",
    color: "#b8860b",
  },
];

const PARTNERS: { name: string; platform: string; url: string; viewers: string; platformColor: string; platformLabel: string }[] = [];

const PLATFORMS = [
  { value: "twitch", label: "Twitch" },
  { value: "youtube", label: "YouTube" },
  { value: "kick", label: "Kick" },
  { value: "other", label: "Outro" },
];

export default function Parceiros() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    channelName: "",
    platform: "twitch",
    channelUrl: "",
    avgViewers: "",
    schedule: "",
    motivation: "",
    discordTag: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        setSent(true);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível enviar a candidatura.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex-1 flex flex-col">

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,160,23,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(180,30,30,0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 pt-20 pb-16 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary mb-6 backdrop-blur-sm">
            <Tv className="w-4 h-4" />
            Programa de Parceiros — Temporada 1
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-tight mb-4">
            SEJA UM<br />
            <span className="text-primary" style={{ textShadow: "0 0 40px rgba(212,160,23,0.5)" }}>
              PARCEIRO
            </span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Você streama Metin2 e quer crescer junto com o Aura2? Junte-se ao nosso programa de parceiros e leve a melhor experiência do servidor para os seus viewers — com benefícios exclusivos para você e para o seu chat.
          </p>
          <a
            href="#candidatura"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold uppercase tracking-wider px-8 py-4 rounded-xl text-base shadow-[0_0_30px_rgba(212,160,23,0.35)] hover:shadow-[0_0_50px_rgba(212,160,23,0.55)] hover:bg-primary/90 transition-all"
          >
            <Star className="w-5 h-5" /> Quero ser Parceiro
          </a>
        </div>
      </div>

      {/* REQUISITOS */}
      <section className="container mx-auto px-4 py-10">
        <div className="bg-black/40 border border-primary/20 rounded-2xl p-8 backdrop-blur-sm max-w-3xl mx-auto">
          <h2 className="font-display text-xl font-bold text-white mb-5 text-center tracking-wide uppercase">
            Requisitos Mínimos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { value: "50+", label: "Viewers médios por stream" },
              { value: "Metin2", label: "Conteúdo principal do canal" },
              { value: "2x/sem", label: "Frequência mínima de streams" },
            ].map((r) => (
              <div key={r.label} className="flex flex-col items-center gap-2">
                <span className="font-display text-4xl font-black text-primary">{r.value}</span>
                <span className="text-sm text-gray-400">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="container mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">O que você ganha</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide">Benefícios do Parceiro</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="group bg-black/40 border border-white/10 hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:bg-black/60"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${b.color}22`, border: `1px solid ${b.color}44` }}
              >
                <b.icon className="w-6 h-6" style={{ color: b.color }} />
              </div>
              <h3 className="font-bold text-white text-lg mb-2 group-hover:text-primary transition-colors">{b.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARCEIROS ATIVOS */}
      {PARTNERS.length > 0 && (
        <section className="container mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Nossa família</p>
            <h2 className="font-display text-3xl font-bold text-white tracking-wide">Parceiros Ativos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PARTNERS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-black/40 border border-white/10 hover:border-primary/30 rounded-2xl p-5 transition-all duration-300"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.1)" }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white group-hover:text-primary transition-colors truncate">{p.name}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: p.platformColor + "33", color: p.platformColor }}
                    >
                      {p.platformLabel}
                    </span>
                    <span className="text-xs text-gray-500">~{p.viewers} viewers</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* FORMULÁRIO */}
      <section id="candidatura" className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Junte-se a nós</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-wide">Candidatura</h2>
          <p className="text-sm text-gray-400 mt-3">Preencha o formulário abaixo e entraremos em contato pelo Discord em até 48 horas.</p>
        </div>

        {sent ? (
          <div className="bg-black/40 border border-primary/30 rounded-2xl p-10 text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h3 className="font-display text-2xl font-bold text-primary">Candidatura Enviada!</h3>
            <p className="text-gray-300 max-w-md mx-auto">
              Recebemos a sua candidatura! Vamos analisar e entrar em contato pelo Discord em até 48 horas. Obrigado pelo interesse em ser parceiro do Aura2!
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-black/40 border border-white/10 rounded-2xl p-8 space-y-5 backdrop-blur-sm"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="channelName">Nome do Canal *</Label>
                <Input
                  id="channelName"
                  name="channelName"
                  placeholder="NomeDoSeuCanal"
                  value={form.channelName}
                  onChange={handleChange}
                  className="bg-black/50 border-white/15 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Plataforma *</Label>
                <select
                  id="platform"
                  name="platform"
                  value={form.platform}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-white/15 bg-black/50 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelUrl">Link do Canal *</Label>
              <Input
                id="channelUrl"
                name="channelUrl"
                placeholder="https://twitch.tv/seucanal"
                value={form.channelUrl}
                onChange={handleChange}
                className="bg-black/50 border-white/15 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="avgViewers">Média de Viewers *</Label>
                <Input
                  id="avgViewers"
                  name="avgViewers"
                  placeholder="Ex: 80"
                  value={form.avgViewers}
                  onChange={handleChange}
                  className="bg-black/50 border-white/15 focus-visible:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discordTag">Discord *</Label>
                <Input
                  id="discordTag"
                  name="discordTag"
                  placeholder="usuario#0000 ou @usuario"
                  value={form.discordTag}
                  onChange={handleChange}
                  className="bg-black/50 border-white/15 focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Horário e Frequência de Streams *</Label>
              <Input
                id="schedule"
                name="schedule"
                placeholder="Ex: Seg/Qua/Sex às 20h"
                value={form.schedule}
                onChange={handleChange}
                className="bg-black/50 border-white/15 focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">Por que quer ser parceiro do Aura2? *</Label>
              <textarea
                id="motivation"
                name="motivation"
                placeholder="Conte um pouco sobre o seu canal e por que o Aura2 faz sentido para o seu conteúdo..."
                value={form.motivation}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-md border border-white/15 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider text-base shadow-[0_0_20px_rgba(212,160,23,0.3)] hover:shadow-[0_0_35px_rgba(212,160,23,0.5)] transition-all"
            >
              {loading ? "Enviando..." : "Enviar Candidatura"}
            </Button>

            <p className="text-xs text-center text-gray-600">
              Ao enviar, você concorda com os termos do programa de parceiros do Aura2.
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
