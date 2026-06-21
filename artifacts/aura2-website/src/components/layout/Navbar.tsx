import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Play, Download, LogOut, User, Menu, X } from "lucide-react";

type ModalMode = "login" | "register" | "forgot";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>("login");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, login, logout } = useAuth();
  const [, navigate] = useLocation();

  function openAs(m: ModalMode) {
    setMode(m);
    setOpen(true);
  }

  function handleLogout() {
    logout();
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  useEffect(() => {
    function openRegistration() {
      openAs("register");
    }

    window.addEventListener("aura2:open-register", openRegistration);
    return () => window.removeEventListener("aura2:open-register", openRegistration);
  }, []);

  const titles: Record<ModalMode, string> = {
    login: "Acessar Conta",
    register: "Criar Conta",
    forgot: "Recuperar Senha",
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img
            src="/a2-logo.png"
            alt="M2"
            className="h-10 w-10 shrink-0 animate-amber-pulse object-contain sm:h-12 sm:w-12"
            style={{
              filter: "drop-shadow(0 0 12px rgba(212,160,23,0.8))",
            }}
          />
          <div className="flex min-w-0 flex-col">
            <span className="whitespace-nowrap font-display text-xl font-bold leading-none tracking-wider text-primary sm:text-2xl">
              AURA 2 <span className="hidden text-sm font-normal uppercase tracking-normal text-muted-foreground sm:inline">- Beta Fechado</span>
            </span>
            <span className="whitespace-nowrap text-[8px] uppercase tracking-widest text-muted-foreground sm:text-[10px]">
              Reviva a essência do Metin2
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
          >
            Início
          </Link>
          <Link
            href="/ranking"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
          >
            Ranking
          </Link>
          <Link
            href="/download"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
          >
            Download
          </Link>
          <Link
            href="/wiki"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
          >
            Wiki
          </Link>
          <Link
            href="/loja"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-semibold uppercase tracking-wider text-primary hover:text-primary/80 transition-all duration-200 hover:scale-110 inline-block"
          >
            Doação
          </Link>
          <Link
            href="/parceiros"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110 inline-block"
          >
            Parceiros
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-primary md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {user ? (
            <>
              <Link
                href="/conta"
                className="hidden sm:flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary/80 transition-colors"
              >
                <User className="w-4 h-4" />
                {user.username}
              </Link>
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hidden sm:flex"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Sair
              </Button>
            </>
          ) : (
            <>
              <Button
                className="hidden sm:flex bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(212,160,23,0.4)] transition-all duration-200 hover:scale-110"
                onClick={() => navigate("/comece-a-jogar")}
                data-testid="button-jogar-agora"
              >
                <Play className="w-4 h-4 mr-2 fill-current" /> Jogar Agora
              </Button>
              <Button
                id="navbar-login-btn"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 hidden sm:flex transition-all duration-200 hover:scale-110"
                onClick={() => openAs("login")}
                data-testid="button-login"
              >
                Login
              </Button>
            </>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-primary/20 bg-background/95 backdrop-blur-md">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => { closeMobile(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              Início
            </Link>
            <Link
              href="/ranking"
              onClick={() => { closeMobile(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              Ranking
            </Link>
            <Link
              href="/download"
              onClick={() => { closeMobile(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              Download
            </Link>
            <Link
              href="/wiki"
              onClick={() => { closeMobile(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              Wiki
            </Link>
            <Link
              href="/loja"
              onClick={() => { closeMobile(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              Doação
            </Link>
            <Link
              href="/parceiros"
              onClick={() => { closeMobile(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
            >
              Parceiros
            </Link>
            {user ? (
              <>
                <Link
                  href="/conta"
                  onClick={closeMobile}
                  className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-primary hover:bg-primary/5 rounded-md transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> {user.username}
                </Link>
                <button
                  onClick={() => { logout(); closeMobile(); navigate("/"); }}
                  className="px-3 py-3 text-sm font-semibold uppercase tracking-wider text-red-400 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-2 text-left"
                >
                  <LogOut className="w-4 h-4" /> Sair
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10 mt-2">
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 w-full"
                  onClick={() => { openAs("login"); closeMobile(); }}
                >
                  Login
                </Button>
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider w-full"
                  onClick={() => { navigate("/comece-a-jogar"); closeMobile(); }}
                >
                  <Play className="w-4 h-4 mr-2 fill-current" /> Jogar Agora
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-background border-primary/20">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center text-primary">
              {titles[mode]}
            </DialogTitle>
          </DialogHeader>

          {mode === "login" && (
            <LoginForm
              onClose={() => setOpen(false)}
              onSwitchToRegister={() => setMode("register")}
              onForgotPassword={() => setMode("forgot")}
              onLoginSuccess={(username, token) => {
                login(username, token);
                setOpen(false);
                navigate("/conta");
              }}
            />
          )}
          {mode === "register" && (
            <RegisterForm
              onClose={() => setOpen(false)}
              onSwitchToLogin={() => setMode("login")}
              onRegisterSuccess={(username, token) => {
                login(username, token);
                setOpen(false);
                navigate("/conta");
              }}
            />
          )}
          {mode === "forgot" && (
            <ForgotPasswordForm
              onClose={() => setOpen(false)}
              onBackToLogin={() => setMode("login")}
            />
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}

function LoginForm({
  onClose,
  onSwitchToRegister,
  onForgotPassword,
  onLoginSuccess,
}: {
  onClose: () => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  onLoginSuccess: (username: string, token: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Bem-vindo!", description: `Olá, ${data.username}!` });
        onLoginSuccess(data.username, data.token);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="login-username">Usuário</Label>
        <Input
          id="login-username"
          placeholder="Seu ID de login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary"
          data-testid="input-login-username"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-password">Senha</Label>
        <Input
          id="login-password"
          type="password"
          placeholder="Sua senha secreta"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary"
          data-testid="input-login-password"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
        data-testid="button-entrar"
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <div className="text-right">
        <button
          type="button"
          className="text-xs text-primary hover:underline"
          onClick={onForgotPassword}
        >
          Esqueci minha senha
        </button>
      </div>
      <div className="text-center mt-2 space-y-2">
        <p className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <button
            type="button"
            className="text-primary hover:underline font-semibold"
            onClick={onSwitchToRegister}
            data-testid="button-switch-register"
          >
            Criar Conta
          </button>
        </p>
      </div>
    </form>
  );
}

function ForgotPasswordForm({
  onClose,
  onBackToLogin,
}: {
  onClose: () => void;
  onBackToLogin: () => void;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        setSent(true);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 py-4">
      {!sent ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Digite o e-mail cadastrado na sua conta e enviaremos um link para
            redefinir sua senha.
          </p>
          <div className="space-y-2">
            <Label htmlFor="forgot-email">E-mail</Label>
            <Input
              id="forgot-email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-black/50 border-primary/30 focus-visible:ring-primary"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
          >
            {loading ? "Enviando..." : "Enviar Link de Recuperação"}
          </Button>
          <div className="text-center">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-primary hover:underline"
              onClick={onBackToLogin}
            >
              ← Voltar para o login
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center space-y-4 py-4">
          <div className="text-4xl">📧</div>
          <p className="text-white font-bold text-lg">E-mail enviado!</p>
          <p className="text-sm text-muted-foreground">
            Verifique sua caixa de entrada e siga as instruções para redefinir a senha.
          </p>
          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      )}
    </div>
  );
}

function RegisterForm({
  onClose,
  onSwitchToLogin,
  onRegisterSuccess,
}: {
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: (username: string, token: string) => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [deletionPassword, setDeletionPassword] = useState("");
  const [betaKey, setBetaKey] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Erro", description: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Erro", description: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (!/^\d{7}$/.test(deletionPassword)) {
      toast({ title: "Erro", description: "A senha de exclusão deve ter exatamente 7 números.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, deletionPassword, betaKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        toast({ title: "Conta criada!", description: `Bem-vindo ao Aura2, ${data.username}!` });
        onRegisterSuccess(data.username, data.token);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Cadastro restrito a <span className="text-primary font-semibold">testadores beta</span>. Insira o código recebido no Discord.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-beta-key">Código Beta</Label>
        <Input
          id="reg-beta-key"
          placeholder="AURA2-XXXXXX-XXXXXX"
          value={betaKey}
          onChange={(e) => setBetaKey(e.target.value.toUpperCase())}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary font-mono tracking-wider"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-username">Usuário</Label>
        <Input
          id="reg-username"
          placeholder="Escolha um nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-email">E-mail</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-password">Senha</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Crie uma senha forte"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-confirm">Confirmar Senha</Label>
        <Input
          id="reg-confirm"
          type="password"
          placeholder="Repita a senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="reg-deletion-password">Senha para excluir personagem</Label>
        <Input
          id="reg-deletion-password"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          pattern="[0-9]{7}"
          placeholder="7 números"
          value={deletionPassword}
          onChange={(e) => setDeletionPassword(e.target.value.replace(/\D/g, "").slice(0, 7))}
          className="bg-black/50 border-primary/30 focus-visible:ring-primary font-mono tracking-wider"
          required
        />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Use exatamente 7 números. Exemplo: <span className="text-primary font-semibold">1234567</span>. Para sua segurança, escolha outra sequência e guarde-a.
        </p>
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
      >
        {loading ? "Criando conta..." : "Criar Conta"}
      </Button>
      <div className="text-center mt-2">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <button
            type="button"
            className="text-primary hover:underline font-semibold"
            onClick={onSwitchToLogin}
          >
            Fazer Login
          </button>
        </p>
      </div>
    </form>
  );
}
