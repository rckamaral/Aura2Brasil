import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      toast({ title: "Link inválido", description: "Token de recuperação não encontrado.", variant: "destructive" });
      navigate("/");
    } else {
      setToken(t);
    }
  }, []);

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
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      } else {
        setDone(true);
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível conectar ao servidor.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-primary/20 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <img src="/a2-logo.png" alt="Aura2" className="w-16 h-16 object-contain mx-auto mb-4" />
          <h1 className="font-display text-3xl text-primary font-bold">Redefinir Senha</h1>
          <p className="text-muted-foreground text-sm mt-2">Crie uma nova senha para sua conta</p>
        </div>

        {done ? (
          <div className="text-center space-y-6">
            <div className="text-5xl">✅</div>
            <p className="text-white font-bold text-lg">Senha redefinida com sucesso!</p>
            <p className="text-sm text-muted-foreground">Você já pode fazer login com sua nova senha.</p>
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
              onClick={() => navigate("/")}
            >
              Ir para o Site
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-primary/30 focus-visible:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Repete a nova senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-black/50 border-primary/30 focus-visible:ring-primary"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
            >
              {loading ? "A redefinir..." : "Redefinir Senha"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
