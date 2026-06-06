import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Home,
  Mail,
  Lock,
  Warehouse,
  Users,
  ShieldCheck,
  ShoppingCart,
  History,
  LogOut,
  Gift,
  Store,
  ChevronRight,
  Star,
  QrCode,
  Copy,
  Check,
  ArrowLeft,
  CreditCard,
  LifeBuoy,
  Send,
  Shield,
} from "lucide-react";

type Section =
  | "inicio"
  | "alterar-email"
  | "alterar-senha"
  | "senha-armazem"
  | "personagens"
  | "senha-personagem"
  | "comprar-cash"
  | "historico"
  | "suporte";

export default function Conta() {
  const { user, logout, token } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [section, setSection] = useState<Section>("inicio");
  const [cashBalance, setCashBalance] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailChange = params.get("emailChange");
    if (!emailChange) return;

    if (emailChange === "success") {
      toast({ title: "E-mail alterado!", description: "A troca de e-mail da conta foi confirmada." });
    } else if (emailChange === "used") {
      toast({ title: "E-mail em uso", description: "Esse e-mail ja esta vinculado a outra conta.", variant: "destructive" });
    } else if (emailChange === "invalid") {
      toast({ title: "Link expirado", description: "Solicite a troca de e-mail novamente.", variant: "destructive" });
    } else {
      toast({ title: "Erro", description: "Nao foi possivel confirmar a troca de e-mail.", variant: "destructive" });
    }

    window.history.replaceState(null, "", location);
  }, [location, toast]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/donations/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const total = (data.donations as { status: string; coinsAmount: number }[])
          .filter(d => d.status === "approved")
          .reduce((s, d) => s + d.coinsAmount, 0);
        setCashBalance(total);
      })
      .catch(() => {});
  }, [token]);

  if (!user) {
    navigate("/");
    return null;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <p className="text-primary text-xs font-semibold uppercase tracking-widest flex items-center gap-2 mb-1">
            <User className="w-3 h-3" /> Conta
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white uppercase tracking-wide">
            Bem-vindo(a),{" "}
            <span className="text-primary">{user.username.toUpperCase()}</span>
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <main className="flex-1 order-2 lg:order-1">
            <SectionContent section={section} username={user.username} token={token} onNavigate={setSection} onBalanceUpdate={setCashBalance} />
          </main>

          <aside className="w-full lg:w-64 order-1 lg:order-2 shrink-0">
            <div className="bg-black/40 border border-primary/20 rounded-lg overflow-hidden">
              <div className="bg-primary/20 border-b border-primary/30 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-primary text-sm uppercase tracking-wider">
                    {user.username}
                  </p>
                  <p className="text-xs font-semibold flex items-center gap-1 mt-0.5 text-yellow-400/80">
                    {cashBalance === null ? "..." : `${cashBalance.toLocaleString("pt-BR")} Cash`}
                  </p>
                </div>
              </div>

              <nav className="p-2 space-y-1">
                <NavItem
                  icon={<Home className="w-4 h-4" />}
                  label="Início"
                  active={section === "inicio"}
                  onClick={() => setSection("inicio")}
                />

                <NavGroup label="Gerenciar Conta">
                  <NavItem
                    icon={<Mail className="w-4 h-4" />}
                    label="Alterar E-mail"
                    active={section === "alterar-email"}
                    onClick={() => setSection("alterar-email")}
                  />
                  <NavItem
                    icon={<Lock className="w-4 h-4" />}
                    label="Alterar Senha"
                    active={section === "alterar-senha"}
                    onClick={() => setSection("alterar-senha")}
                  />
                  <NavItem
                    icon={<Warehouse className="w-4 h-4" />}
                    label="Senha do Armazém"
                    active={section === "senha-armazem"}
                    onClick={() => setSection("senha-armazem")}
                  />
                </NavGroup>

                <NavGroup label="Personagens">
                  <NavItem
                    icon={<Users className="w-4 h-4" />}
                    label="Listar Personagens"
                    active={section === "personagens"}
                    onClick={() => setSection("personagens")}
                  />
                  <NavItem
                    icon={<ShieldCheck className="w-4 h-4" />}
                    label="Senha do Personagem"
                    active={section === "senha-personagem"}
                    onClick={() => setSection("senha-personagem")}
                  />
                </NavGroup>

                <NavGroup label="Loja">
                  <NavItem
                    icon={<ShoppingCart className="w-4 h-4" />}
                    label="Comprar Cash"
                    active={section === "comprar-cash"}
                    onClick={() => setSection("comprar-cash")}
                  />
                  <NavItem
                    icon={<History className="w-4 h-4" />}
                    label="Histórico de Compras"
                    active={section === "historico"}
                    onClick={() => setSection("historico")}
                  />
                </NavGroup>

                <NavGroup label="Ajuda">
                  <NavItem
                    icon={<LifeBuoy className="w-4 h-4" />}
                    label="Suporte"
                    active={section === "suporte"}
                    onClick={() => setSection("suporte")}
                  />
                </NavGroup>

                {(user.role === "admin" || user.username === "ercamaral") && (
                  <NavGroup label="Administração">
                    <a
                      href="/admin"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-primary hover:bg-primary/10 transition-colors font-semibold"
                    >
                      <Shield className="w-4 h-4" />
                      Painel Admin
                    </a>
                  </NavGroup>
                )}

                <div className="pt-2 border-t border-white/10 mt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-2">
      <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left ${
        active
          ? "bg-primary/20 text-primary border border-primary/30"
          : "text-muted-foreground hover:bg-white/5 hover:text-white"
      }`}
    >
      {icon}
      {label}
      {active && <ChevronRight className="w-3 h-3 ml-auto" />}
    </button>
  );
}

function SectionContent({
  section,
  username,
  token,
  onNavigate,
  onBalanceUpdate,
}: {
  section: Section;
  username: string;
  token: string | null;
  onNavigate: (s: Section) => void;
  onBalanceUpdate: (n: number) => void;
}) {
  switch (section) {
    case "inicio":
      return <SectionInicio username={username} onNavigate={onNavigate} />;
    case "alterar-email":
      return <SectionAlterarEmail token={token} />;
    case "alterar-senha":
      return <SectionAlterarSenha token={token} />;
    case "senha-armazem":
      return <SectionSenhaArmazem />;
    case "personagens":
      return <SectionPersonagens />;
    case "senha-personagem":
      return <SectionSenhaPersonagem />;
    case "comprar-cash":
      return <SectionComprarCash token={token} onBalanceUpdate={onBalanceUpdate} />;
    case "historico":
      return <SectionHistorico token={token} />;
    case "suporte":
      return <SectionSuporte token={token} />;
    default:
      return null;
  }
}

function SectionInicio({ username, onNavigate }: { username: string; onNavigate: (s: Section) => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🎁</span>
          <div>
            <p className="font-bold text-white text-lg uppercase tracking-wide">
              Bônus na Compra de Moedas!
            </p>
            <p className="text-sm text-muted-foreground">
              Aproveite as promoções exclusivas da loja!
            </p>
          </div>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider whitespace-nowrap"
          onClick={() => onNavigate("comprar-cash")}
        >
          <Store className="w-4 h-4 mr-2" /> Acessar Loja
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickCard
          icon={<Lock className="w-5 h-5 text-primary" />}
          title="Alterar Senha"
          desc="Mantenha a sua conta segura"
          onClick={() => onNavigate("alterar-senha")}
        />
        <QuickCard
          icon={<Users className="w-5 h-5 text-primary" />}
          title="Personagens"
          desc="Ver os seus personagens"
          onClick={() => onNavigate("personagens")}
        />
        <QuickCard
          icon={<Gift className="w-5 h-5 text-primary" />}
          title="Comprar Cash"
          desc="Adquira moedas premium"
          onClick={() => onNavigate("comprar-cash")}
        />
      </div>
    </div>
  );
}

function QuickCard({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-black/40 border border-white/10 rounded-lg p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-all group"
    >
      <div className="mb-3">{icon}</div>
      <p className="font-bold text-white text-sm uppercase tracking-wide group-hover:text-primary transition-colors">
        {title}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{desc}</p>
    </button>
  );
}

function SectionAlterarEmail({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newEmail !== confirmEmail) {
      toast({ title: "Erro", description: "Os e-mails não coincidem.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newEmail, currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Sucesso!", description: data.message });
        setNewEmail("");
        setConfirmEmail("");
        setCurrentPassword("");
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormSection title="Alterar E-mail" icon={<Mail className="w-5 h-5" />}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label>Novo E-mail</Label>
          <Input
            type="email"
            placeholder="novo@email.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="bg-black/50 border-primary/30 focus-visible:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Confirmar Novo E-mail</Label>
          <Input
            type="email"
            placeholder="novo@email.com"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            className="bg-black/50 border-primary/30 focus-visible:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Senha Atual</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-black/50 border-primary/30 focus-visible:ring-primary"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
        >
          {loading ? "Salvando..." : "Salvar Alteração"}
        </Button>
      </form>
    </FormSection>
  );
}

function SectionAlterarSenha({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Erro", description: "A nova senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Senha alterada!", description: data.message });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormSection title="Alterar Senha" icon={<Lock className="w-5 h-5" />}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label>Senha Atual</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="bg-black/50 border-primary/30 focus-visible:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Nova Senha</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-black/50 border-primary/30 focus-visible:ring-primary"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Confirmar Nova Senha</Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-black/50 border-primary/30 focus-visible:ring-primary"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
        >
          {loading ? "Salvando..." : "Salvar Alteração"}
        </Button>
      </form>
    </FormSection>
  );
}

function SectionSenhaArmazem() {
  const { toast } = useToast();
  return (
    <FormSection title="Senha do Armazém" icon={<Warehouse className="w-5 h-5" />}>
      <div className="space-y-4 max-w-md">
        <p className="text-sm text-muted-foreground">
          A senha do armazém protege os seus itens guardados no cofre.
        </p>
        <div className="space-y-2">
          <Label>Nova Senha do Armazém</Label>
          <Input type="password" placeholder="••••••••" className="bg-black/50 border-primary/30 focus-visible:ring-primary" />
        </div>
        <div className="space-y-2">
          <Label>Confirmar Senha</Label>
          <Input type="password" placeholder="••••••••" className="bg-black/50 border-primary/30 focus-visible:ring-primary" />
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
          onClick={() => toast({ title: "Em breve", description: "Esta funcionalidade estará disponível em breve." })}
        >
          Definir Senha
        </Button>
      </div>
    </FormSection>
  );
}

function SectionPersonagens() {
  return (
    <FormSection title="Listar Personagens" icon={<Users className="w-5 h-5" />}>
      <div className="bg-black/30 border border-white/10 rounded-lg p-8 text-center">
        <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">
          A ligação ao servidor de jogo será necessária para mostrar os personagens.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Em breve disponível.
        </p>
      </div>
    </FormSection>
  );
}

function SectionSenhaPersonagem() {
  const { toast } = useToast();
  return (
    <FormSection title="Senha do Personagem" icon={<ShieldCheck className="w-5 h-5" />}>
      <div className="space-y-4 max-w-md">
        <p className="text-sm text-muted-foreground">
          A senha do personagem impede que outros acedam ao seu personagem mesmo que conheçam a senha da conta.
        </p>
        <div className="space-y-2">
          <Label>Nova Senha do Personagem</Label>
          <Input type="password" placeholder="••••••••" className="bg-black/50 border-primary/30 focus-visible:ring-primary" />
        </div>
        <div className="space-y-2">
          <Label>Confirmar Senha</Label>
          <Input type="password" placeholder="••••••••" className="bg-black/50 border-primary/30 focus-visible:ring-primary" />
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
          onClick={() => toast({ title: "Em breve", description: "Esta funcionalidade estará disponível em breve." })}
        >
          Definir Senha
        </Button>
      </div>
    </FormSection>
  );
}

const CASH_PACKAGES = [
  { amount: "10.000", coins: 10000, price: "R$10,00", value: 10 },
  { amount: "22.000", coins: 22000, price: "R$20,00", value: 20, bonus: "+2.000 bônus" },
  { amount: "65.000", coins: 65000, price: "R$50,00", value: 50, bonus: "+5.000 bônus", popular: true },
  { amount: "135.000", coins: 135000, price: "R$100,00", value: 100, bonus: "+10.000 bônus" },
  { amount: "275.000", coins: 275000, price: "R$200,00", value: 200, bonus: "+25.000 bônus" },
  { amount: "420.000", coins: 420000, price: "R$300,00", value: 300, bonus: "+45.000 bônus" },
  { amount: "700.000", coins: 700000, price: "R$500,00", value: 500, bonus: "+80.000 bônus" },
  { amount: "1.000.000", coins: 1000000, price: "R$700,00", value: 700, bonus: "+150.000 bônus" },
  { amount: "1.500.000", coins: 1500000, price: "R$1.000,00", value: 1000, bonus: "+500.000 bônus" },
];

const PIX_KEY = "aura2brasil@gmail.com";

type CashPkg = (typeof CASH_PACKAGES)[number];
type PayStep = "select" | "method" | "pix" | "card";

function SectionComprarCash({ token, onBalanceUpdate }: { token: string | null; onBalanceUpdate: (n: number) => void }) {
  const [selected, setSelected] = useState<CashPkg | null>(null);
  const [step, setStep] = useState<PayStep>("select");
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pixLoading, setPixLoading] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ donationId: number; qrCode: string; qrCodeBase64: string } | null>(null);
  const [payStatus, setPayStatus] = useState<"pending" | "approved" | "rejected" | "cancelled">("pending");

  function handleSelect(pkg: CashPkg) {
    setSelected(pkg);
    setStep("method");
    setPixData(null);
    setPixError(null);
    setPayStatus("pending");
  }

  function handleCopy() {
    if (!pixData?.qrCode) return;
    navigator.clipboard.writeText(pixData.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  function goBack() {
    if (step === "pix" || step === "card") setStep("method");
    else { setStep("select"); setSelected(null); }
  }

  useEffect(() => {
    if (step !== "pix" || !selected || !token) return;
    setPixLoading(true);
    setPixData(null);
    setPixError(null);
    setPayStatus("pending");

    fetch("/api/donations/create-pix", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        packageLabel: `${selected.amount} Moedas Cash`,
        coinsAmount: selected.coins,
        priceBrl: selected.value,
      }),
    })
      .then(r => r.json().then(d => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) { setPixError(d.error || "Erro ao gerar QR code."); return; }
        setPixData({ donationId: d.donationId, qrCode: d.qrCode, qrCodeBase64: d.qrCodeBase64 });
      })
      .catch(() => setPixError("Erro de rede. Tenta novamente."))
      .finally(() => setPixLoading(false));
  }, [step, selected, token]);

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
          const mineRes = await fetch("/api/donations/mine", { headers: { Authorization: `Bearer ${token}` } });
          const mineData = await mineRes.json() as { donations: { status: string; coinsAmount: number }[] };
          if (mineData.donations) {
            const total = mineData.donations
              .filter(d => d.status === "approved")
              .reduce((s, d) => s + d.coinsAmount, 0);
            onBalanceUpdate(total);
          }
        } else if (data.status === "rejected" || data.status === "cancelled") {
          setPayStatus(data.status as "rejected" | "cancelled");
          clearInterval(interval);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [pixData, payStatus, token, onBalanceUpdate]);

  return (
    <FormSection title="Comprar Cash" icon={<ShoppingCart className="w-5 h-5" />}>
      {step === "select" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ao doar, recebes Moedas Cash para usar no jogo e ajudas a manter o Aura 2 no ar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {CASH_PACKAGES.map((pkg) => (
              <button
                key={pkg.value}
                onClick={() => handleSelect(pkg)}
                className={`relative flex flex-col items-center justify-center gap-1 p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  pkg.popular
                    ? "border-primary bg-primary/10 shadow-[0_0_18px_rgba(212,160,23,0.25)]"
                    : "border-white/10 bg-black/30 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-black" /> Popular
                  </span>
                )}
                <span className="font-display font-black text-xl text-primary">{pkg.amount}</span>
                <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">Moedas Cash</span>
                {pkg.bonus && (
                  <span className="text-[11px] text-green-400 font-semibold">{pkg.bonus}</span>
                )}
                <span className="text-lg font-bold text-white mt-1">{pkg.price}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            Doações via <span className="text-primary font-semibold">PIX · Cartão de Crédito</span> — processadas com segurança.
          </p>
        </div>
      )}

      {step === "method" && selected && (
        <div className="space-y-4 max-w-sm">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Pacote selecionado</p>
              <p className="font-display font-black text-xl text-primary">{selected.amount} Moedas Cash</p>
              {selected.bonus && <p className="text-xs text-green-400">{selected.bonus}</p>}
            </div>
            <p className="text-2xl font-bold text-white">{selected.price}</p>
          </div>
          <p className="text-sm font-semibold text-white">Escolhe o método de pagamento</p>
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
      )}

      {step === "pix" && selected && (
        <div className="space-y-4 max-w-sm">
          {payStatus !== "approved" && (
            <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          )}

          {payStatus === "approved" ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <p className="text-green-400 font-display font-black text-2xl">Pagamento confirmado!</p>
                <p className="text-green-400/70 text-sm mt-1">{selected.amount} Moedas Cash foram creditadas na tua conta.</p>
              </div>
              <Button onClick={() => { setStep("select"); setSelected(null); setPixData(null); setPayStatus("pending"); }} variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                Comprar mais
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Pacote selecionado</p>
                  <p className="font-display font-black text-xl text-primary">{selected.amount} Moedas Cash</p>
                </div>
                <p className="text-2xl font-bold text-white">{selected.price}</p>
              </div>

              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center p-3 rounded-xl border border-primary/30 bg-white w-[164px] h-[164px]">
                  {pixLoading && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-[10px] text-black/50">Gerando QR...</p>
                    </div>
                  )}
                  {pixError && <p className="text-xs text-red-500 text-center px-2">{pixError}</p>}
                  {pixData?.qrCodeBase64 && (
                    <img
                      src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code PIX"
                      width={136}
                      height={136}
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
                <p>1. Escaneia o QR code acima ou copia o código</p>
                <p>2. Abre o app do teu banco e escolhe PIX</p>
                <p>3. Usa o valor exato: <strong className="text-white">{selected.price}</strong></p>
                <p>4. As moedas serão creditadas <strong className="text-white">automaticamente</strong></p>
              </div>

              {pixData && (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <p className="text-sm text-muted-foreground">Aguardando confirmação do pagamento...</p>
                </div>
              )}

              {payStatus === "rejected" && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-400 text-center">
                  Pagamento não aprovado. Tenta novamente ou contacta o suporte.
                </div>
              )}

              {payStatus === "cancelled" && (
                <div className="rounded-xl border border-orange-500/30 bg-orange-950/30 p-4 text-sm text-orange-400 text-center">
                  O QR Code expirou. Volte e gere um novo para concluir o pagamento.
                </div>
              )}
            </>
          )}
        </div>
      )}

      {step === "card" && selected && (
        <div className="space-y-4 max-w-sm">
          <button onClick={goBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Pacote selecionado</p>
              <p className="font-display font-black text-xl text-primary">{selected.amount} Moedas Cash</p>
            </div>
            <p className="text-2xl font-bold text-white">{selected.price}</p>
          </div>
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-sm text-yellow-400/80 text-center">
            Integração com gateway de pagamento em breve.
          </div>
        </div>
      )}
    </FormSection>
  );
}

function SectionHistorico({ token }: { token: string | null }) {
  const [donations, setDonations] = useState<{ id: number; packageLabel: string; coinsAmount: number; priceBrl: number; status: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/donations/mine", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : { donations: [] })
      .then(data => setDonations(data.donations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  function statusLabel(s: string) {
    if (s === "approved") return <span className="text-xs font-semibold text-green-400 bg-green-950/40 border border-green-500/30 px-2 py-0.5 rounded-full">✓ Aprovada</span>;
    if (s === "rejected") return <span className="text-xs font-semibold text-red-400 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-full">✗ Rejeitada</span>;
    if (s === "cancelled") return <span className="text-xs font-semibold text-orange-400 bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 rounded-full">⊘ Expirada</span>;
    return <span className="text-xs font-semibold text-yellow-400 bg-yellow-950/40 border border-yellow-500/30 px-2 py-0.5 rounded-full">⏳ Pendente</span>;
  }

  return (
    <FormSection title="Histórico de Compras" icon={<History className="w-5 h-5" />}>
      {loading ? (
        <p className="text-muted-foreground text-sm text-center py-8">Carregando...</p>
      ) : donations.length === 0 ? (
        <div className="bg-black/30 border border-white/10 rounded-lg p-8 text-center">
          <History className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhuma compra registada ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {donations.map(d => (
            <div key={d.id} className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg px-4 py-3 gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm">{d.packageLabel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(d.createdAt).toLocaleDateString("pt-BR")} · <span className="text-primary font-semibold">R${d.priceBrl}</span>
                </p>
              </div>
              {statusLabel(d.status)}
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}

function SectionSuporte({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<{ id: number; subject: string; message: string; status: string; adminReply: string | null; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  async function fetchTickets() {
    if (!token) return;
    try {
      const res = await fetch("/api/tickets/mine", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTickets(data.tickets || []);
    } catch {}
    finally { setLoading(false); }
  }

  useEffect(() => { fetchTickets(); }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !form.subject.trim() || !form.message.trim()) return;
    setSending(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Ticket enviado!", description: "Responderemos o mais breve possível." });
        setTickets(prev => [data.ticket, ...prev]);
        setForm({ subject: "", message: "" });
        setShowForm(false);
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de rede", variant: "destructive" });
    } finally {
      setSending(false);
    }
  }

  function statusLabel(s: string) {
    if (s === "answered") return <span className="text-xs font-semibold text-blue-400 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded-full">Respondido</span>;
    if (s === "closed") return <span className="text-xs font-semibold text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Fechado</span>;
    return <span className="text-xs font-semibold text-yellow-400 bg-yellow-950/40 border border-yellow-500/30 px-2 py-0.5 rounded-full">Aberto</span>;
  }

  return (
    <FormSection title="Suporte" icon={<LifeBuoy className="w-5 h-5" />}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Tens algum problema ou dúvida? Abre um ticket.</p>
        <Button onClick={() => setShowForm(v => !v)} size="sm" className="bg-primary text-black hover:bg-primary/90 font-bold shrink-0">
          {showForm ? "Cancelar" : "Novo Ticket"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-xl border border-primary/20 bg-black/30 p-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Assunto</Label>
            <Input
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Ex: Não recebi minhas moedas Cash"
              maxLength={120}
              required
              className="bg-black/40 border-primary/20 text-white"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Mensagem</Label>
            <Textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Descreve o teu problema com o máximo de detalhes..."
              minLength={10}
              maxLength={2000}
              required
              className="bg-black/40 border-primary/20 text-white min-h-[100px]"
            />
          </div>
          <Button type="submit" disabled={sending || !form.subject.trim() || !form.message.trim()} className="w-full bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-wider">
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Enviando..." : "Enviar Ticket"}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="text-center py-8 text-muted-foreground text-sm">Carregando...</p>
      ) : tickets.length === 0 ? (
        <div className="bg-black/30 border border-white/10 rounded-lg p-8 text-center">
          <LifeBuoy className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum ticket aberto ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t => (
            <div key={t.id} className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{t.subject}</span>
                    {statusLabel(t.status)}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className="text-muted-foreground text-xs shrink-0">{expanded === t.id ? "▲" : "▼"}</span>
              </button>
              {expanded === t.id && (
                <div className="border-t border-white/10 px-4 py-3 space-y-3">
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">A tua mensagem</p>
                    <p className="text-sm text-white/90 whitespace-pre-wrap">{t.message}</p>
                  </div>
                  {t.adminReply && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-primary mb-1 uppercase tracking-wider">Resposta da equipa</p>
                      <p className="text-sm text-white/90 whitespace-pre-wrap">{t.adminReply}</p>
                    </div>
                  )}
                  {!t.adminReply && (
                    <p className="text-xs text-muted-foreground/60 italic">Aguardando resposta da equipa...</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}

function FormSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="text-primary">{icon}</div>
        <h2 className="font-display font-bold text-xl text-white uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {children}
    </div>
  );
}
