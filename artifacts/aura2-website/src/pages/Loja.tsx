import { useState, useEffect } from "react";
import { Heart, Coins, Zap, Star, Lock, CreditCard, ArrowLeft, QrCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

const PACKAGES = [
  { amount: "10.000", coins: 10000, price: "R$ 10,00", value: 10 },
  { amount: "22.000", coins: 22000, price: "R$ 20,00", value: 20, bonus: "+2.000 bônus" },
  { amount: "65.000", coins: 65000, price: "R$ 50,00", value: 50, bonus: "+5.000 bônus", popular: true },
  { amount: "135.000", coins: 135000, price: "R$ 100,00", value: 100, bonus: "+10.000 bônus" },
  { amount: "275.000", coins: 275000, price: "R$ 200,00", value: 200, bonus: "+25.000 bônus" },
  { amount: "420.000", coins: 420000, price: "R$ 300,00", value: 300, bonus: "+45.000 bônus" },
  { amount: "700.000", coins: 700000, price: "R$ 500,00", value: 500, bonus: "+80.000 bônus" },
  { amount: "1.000.000", coins: 1000000, price: "R$ 700,00", value: 700, bonus: "+150.000 bônus" },
  { amount: "1.500.000", coins: 1500000, price: "R$ 1.000,00", value: 1000, bonus: "+500.000 bônus" },
];

type Package = (typeof PACKAGES)[number];
type Step = "method" | "pix" | "card";
type PixData = { donationId: number; qrCode: string; qrCodeBase64: string };
type PayStatus = "pending" | "approved" | "rejected" | "cancelled";

function PayModal({
  pkg,
  token,
  onClose,
}: {
  pkg: Package;
  token: string | null;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("method");
  const [agreed, setAgreed] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [payStatus, setPayStatus] = useState<PayStatus>("pending");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (step !== "pix" || !token) return;
    setPixLoading(true);
    setPixData(null);
    setPixError(null);
    setPayStatus("pending");

    fetch("/api/donations/create-pix", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        packageLabel: `${pkg.amount} Moedas Cash`,
        coinsAmount: pkg.coins,
        priceBrl: pkg.value,
      }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) { setPixError(d.error || "Erro ao gerar QR Code."); return; }
        setPixData({ donationId: d.donationId, qrCode: d.qrCode, qrCodeBase64: d.qrCodeBase64 });
      })
      .catch(() => setPixError("Erro de rede. Tenta novamente."))
      .finally(() => setPixLoading(false));
  }, [step, token, pkg]);

  useEffect(() => {
    if (!pixData || payStatus !== "pending" || !token) return;
    let polls = 0;
    const interval = setInterval(async () => {
      polls++;
      if (polls > 36) { clearInterval(interval); return; }
      try {
        const res = await fetch(`/api/donations/${pixData.donationId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json() as { status: string };
        if (data.status === "approved") {
          setPayStatus("approved");
          clearInterval(interval);
        } else if (data.status === "rejected" || data.status === "cancelled") {
          setPayStatus(data.status as "rejected" | "cancelled");
          clearInterval(interval);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [pixData, payStatus, token]);

  function handleCopy() {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  if (step === "method") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pacote selecionado</p>
            <p className="font-display font-black text-xl text-primary">{pkg.amount} Moedas Cash</p>
            {pkg.bonus && <p className="text-xs text-green-400 mt-0.5">{pkg.bonus}</p>}
          </div>
          <p className="text-2xl font-bold text-white">{pkg.price}</p>
        </div>

        <p className="text-sm font-semibold text-white">Escolha o método de pagamento</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => agreed && setStep("pix")}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              agreed
                ? "border-white/10 bg-black/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                : "border-white/5 bg-black/20 opacity-40 cursor-not-allowed"
            }`}
          >
            <QrCode className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-bold text-white">PIX</p>
              <p className="text-xs text-muted-foreground">Crédito imediato após confirmação</p>
            </div>
          </button>

          <button
            onClick={() => agreed && setStep("card")}
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
              agreed
                ? "border-white/10 bg-black/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer"
                : "border-white/5 bg-black/20 opacity-40 cursor-not-allowed"
            }`}
          >
            <CreditCard className="w-6 h-6 text-primary shrink-0" />
            <div>
              <p className="font-bold text-white">Cartão de Crédito</p>
              <p className="text-xs text-muted-foreground">Em breve disponível</p>
            </div>
          </button>
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
              agreed ? "bg-primary border-primary" : "border-zinc-600"
            }`}
          >
            {agreed && (
              <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-zinc-400 leading-snug">
            Li e concordo com os{" "}
            <a
              href="/termos-de-uso"
              target="_blank"
              className="text-primary underline hover:text-primary/80"
              onClick={e => e.stopPropagation()}
            >
              Termos de Uso
            </a>
            {" "}e a{" "}
            <a
              href="/politicas-de-privacidade"
              target="_blank"
              className="text-primary underline hover:text-primary/80"
              onClick={e => e.stopPropagation()}
            >
              Política de Privacidade
            </a>
          </span>
        </label>
      </div>
    );
  }

  if (step === "card") {
    return (
      <div className="space-y-4">
        <button onClick={() => setStep("method")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pacote selecionado</p>
            <p className="font-display font-black text-xl text-primary">{pkg.amount} Moedas Cash</p>
          </div>
          <p className="text-2xl font-bold text-white">{pkg.price}</p>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-sm text-yellow-400/80 text-center">
          Integração com cartão em breve.
        </div>
      </div>
    );
  }

  if (step === "pix") {
    if (payStatus === "approved") {
      return (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <p className="text-green-400 font-display font-black text-2xl">Pagamento confirmado!</p>
            <p className="text-green-400/70 text-sm mt-1">{pkg.amount} Moedas foram creditadas na sua conta.</p>
          </div>
          <Button onClick={onClose} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 mt-2">
            Fechar
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <button onClick={() => setStep("method")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pacote selecionado</p>
            <p className="font-display font-black text-xl text-primary">{pkg.amount} Moedas Cash</p>
          </div>
          <p className="text-2xl font-bold text-white">{pkg.price}</p>
        </div>

        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center p-3 rounded-xl border border-primary/30 bg-white w-[180px] h-[180px]">
            {pixLoading && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] text-black/50">Gerando QR Code...</p>
              </div>
            )}
            {pixError && <p className="text-xs text-red-500 text-center px-2">{pixError}</p>}
            {pixData?.qrCodeBase64 && (
              <img
                src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                alt="QR Code PIX"
                width={154}
                height={154}
              />
            )}
          </div>
        </div>

        {pixData && (
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">PIX Copia e Cola</Label>
            <div className="flex gap-2">
              <Input value={pixData.qrCode} readOnly className="bg-black/40 border-primary/20 text-white font-mono text-xs" />
              <Button onClick={handleCopy} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-sm text-yellow-400/80 space-y-1">
          <p className="font-semibold text-yellow-400">Instruções:</p>
          <p>1. Escaneie o QR Code acima ou copie o código</p>
          <p>2. Abra o app do seu banco e escolha PIX</p>
          <p>3. Use o valor exato: <strong className="text-white">{pkg.price}</strong></p>
          <p>4. As moedas serão creditadas <strong className="text-white">automaticamente</strong></p>
        </div>

        {pixData && payStatus === "pending" && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <p className="text-sm text-muted-foreground">Aguardando confirmação do pagamento...</p>
          </div>
        )}

        {payStatus === "rejected" && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400 text-center">
            Pagamento não aprovado. Tente novamente ou entre em contato com o suporte.
          </div>
        )}

        {payStatus === "cancelled" && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-950/30 p-4 text-sm text-orange-400 text-center">
            O QR Code expirou. Feche e gere um novo para concluir o pagamento.
          </div>
        )}

        <p className="text-[11px] text-[#4ade80] font-semibold text-center">
          As moedas são inseridas automaticamente após confirmação do pagamento.
        </p>
      </div>
    );
  }

  return null;
}

export default function Loja() {
  const { user, token } = useAuth();
  const [selected, setSelected] = useState<Package | null>(null);

  function openModal(pkg: Package) {
    setSelected(pkg);
  }

  function closeModal() {
    setSelected(null);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-16 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-9 h-9 text-primary" />
          </div>
          <h2 className="font-display text-3xl font-black text-white mb-3">ACESSO RESTRITO</h2>
          <p className="text-muted-foreground mb-6">Você precisa estar logado para acessar a área de doações.</p>
          <Button
            className="bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider px-8"
            onClick={() => document.getElementById("navbar-login-btn")?.click()}
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 text-primary text-sm font-semibold mb-4">
            <Heart className="w-4 h-4" />
            Apoie o Servidor
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3">
            ÁREA DE <span className="text-primary">DOAÇÃO</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Ao doar, você recebe Moedas para usar no jogo e ajuda a manter o Aura2 no ar.
          </p>
        </div>

        <div className="space-y-3">
          {PACKAGES.map((pkg, i) => (
            <div
              key={i}
              className={`relative flex items-center justify-between rounded-xl border px-6 py-5 transition-all duration-200
                ${pkg.popular
                  ? "border-primary/60 bg-primary/5 shadow-[0_0_24px_rgba(212,160,23,0.12)]"
                  : "border-primary/20 bg-zinc-950/60 hover:border-primary/40 hover:bg-primary/5 hover:shadow-[0_0_16px_rgba(212,160,23,0.08)]"
                }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-6 flex items-center gap-1 bg-primary text-black text-[11px] font-bold px-3 py-0.5 rounded-full">
                  <Star className="w-3 h-3" /> MAIS POPULAR
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-display font-black text-3xl leading-none tracking-tight text-primary">{pkg.amount}</span>
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium mt-0.5">Moedas</span>
                {pkg.bonus && (
                  <span className="text-[11px] text-primary/70 font-semibold mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {pkg.bonus}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xl font-bold text-white tabular-nums">{pkg.price}</span>
                <Button
                  onClick={() => openModal(pkg)}
                  className="bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-wider px-5 shadow-[0_0_12px_rgba(212,160,23,0.25)] hover:shadow-[0_0_20px_rgba(212,160,23,0.4)] transition-all"
                >
                  <Coins className="w-4 h-4 mr-2" /> Comprar
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 rounded-xl border border-primary/20 bg-primary/5 text-center">
          <p className="text-primary/70 text-sm">
            Pagamentos via <span className="font-semibold text-primary">PIX · Cartão de Crédito</span> — processados com segurança.
          </p>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="bg-[#111111] border-zinc-800 text-white max-w-md">
          {selected && (
            <PayModal pkg={selected} token={token} onClose={closeModal} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
