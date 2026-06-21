import { Link, useLocation } from "wouter";
import {
  CheckCircle2,
  CircleUserRound,
  Download,
  ExternalLink,
  Gamepad2,
  KeyRound,
  MessageCircle,
  Monitor,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  {
    number: "01",
    icon: KeyRound,
    title: "Receba seu código beta",
    description: "Entre no Discord oficial e acompanhe a distribuição de acessos para os testes.",
  },
  {
    number: "02",
    icon: CircleUserRound,
    title: "Crie sua conta",
    description: "Use o código beta e defina também os 7 números usados para excluir personagens.",
  },
  {
    number: "03",
    icon: Download,
    title: "Baixe o cliente",
    description: "Quando o download for liberado, baixe o cliente somente pelo site oficial.",
  },
  {
    number: "04",
    icon: Gamepad2,
    title: "Entre no Aura 2",
    description: "Abra o patcher, aguarde a atualização e use o mesmo login criado no site.",
  },
];

export default function ComeceAJogar() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  function handleAccount() {
    if (user) {
      navigate("/conta");
      return;
    }
    window.dispatchEvent(new Event("aura2:open-register"));
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <section className="relative min-h-[620px] overflow-hidden border-b border-primary/20 flex items-center">
        <img
          src="/reinos.png"
          alt="Mapa dos reinos do Aura 2"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,7,4,0.98)_0%,rgba(8,7,4,0.78)_45%,rgba(8,7,4,0.32)_100%)]" />

        <div className="container relative z-10 mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-primary/40 bg-black/60 px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-4 w-4" /> Guia de acesso ao beta
            </div>
            <h1 className="font-display text-5xl font-bold uppercase leading-tight text-white sm:text-6xl lg:text-7xl">
              Comece sua <span className="text-primary">jornada</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Do código beta ao primeiro login: siga as etapas para preparar sua conta e entrar no Aura 2.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={handleAccount}
                className="h-12 bg-primary px-7 font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                {user ? "Acessar minha conta" : "Criar conta"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-black/40 px-7 font-bold uppercase tracking-wider text-white hover:bg-white/10"
                asChild
              >
                <Link href="/download">
                  <Download className="mr-2 h-4 w-4" /> Ver download
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 border-y border-white/15 bg-black/35 sm:grid-cols-3">
              <div className="flex min-h-20 items-center gap-3 px-4 py-4">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                <div>
                  <p className="text-xs uppercase text-white/45">Site</p>
                  <p className="font-semibold text-white">Online</p>
                </div>
              </div>
              <div className="flex min-h-20 items-center gap-3 border-white/15 px-4 py-4 sm:border-l">
                <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(212,160,23,0.8)]" />
                <div>
                  <p className="text-xs uppercase text-white/45">Acesso</p>
                  <p className="font-semibold text-white">Beta fechado</p>
                </div>
              </div>
              <div className="flex min-h-20 items-center gap-3 border-white/15 px-4 py-4 sm:border-l">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]" />
                <div>
                  <p className="text-xs uppercase text-white/45">Cliente</p>
                  <p className="font-semibold text-white">Em breve</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">Passo a passo</p>
            <h2 className="mt-2 font-display text-4xl font-bold uppercase text-white">Pronto em quatro etapas</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article key={number} className="min-h-64 rounded-md border border-white/10 bg-white/[0.035] p-6 transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between">
                  <span className="font-display text-3xl font-bold text-primary/65">{number}</span>
                  <Icon className="h-6 w-6 text-white/55" />
                </div>
                <h3 className="mt-12 text-xl font-bold text-white">{title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-black/20 py-20">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <Monitor className="h-6 w-6 text-sky-400" />
              <h2 className="font-display text-3xl font-bold uppercase text-white">Requisitos básicos</h2>
            </div>
            <dl className="mt-8 divide-y divide-white/10 border-y border-white/10">
              {[
                ["Sistema", "Windows 7, 8, 10 ou 11"],
                ["Memória", "2 GB de RAM (4 GB recomendado)"],
                ["Processador", "Intel Dual Core ou AMD equivalente"],
                ["Armazenamento", "5 GB de espaço livre"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[120px_1fr] gap-4 py-4">
                  <dt className="text-sm font-semibold uppercase text-white/45">{label}</dt>
                  <dd className="text-white/85">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <h2 className="font-display text-3xl font-bold uppercase text-white">Antes de entrar</h2>
            </div>
            <ul className="mt-8 space-y-5">
              <li className="flex gap-3 text-white/80">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                O login e a senha criados no site são os mesmos usados no jogo.
              </li>
              <li className="flex gap-3 text-white/80">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                A senha de exclusão tem exatamente 7 números. Escolha uma sequência segura e guarde-a.
              </li>
              <li className="flex gap-3 text-white/80">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                Baixe arquivos somente em aura2.com.br e nunca compartilhe sua senha com outras pessoas.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="mx-auto h-9 w-9 text-[#5865f2]" />
          <h2 className="mt-5 font-display text-4xl font-bold uppercase text-white">Ainda precisa de ajuda?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Fale com a comunidade no Discord ou consulte os sistemas, itens e progressão na Wiki.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button className="bg-[#5865f2] font-bold uppercase tracking-wider text-white hover:bg-[#4752c4]" asChild>
              <a href="https://discord.gg/BN6XbbqsM" target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Entrar no Discord
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
              <Link href="/wiki">Abrir Wiki</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
