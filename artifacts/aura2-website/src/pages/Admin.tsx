import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle, XCircle, Clock, RefreshCw, ShieldAlert,
  Newspaper, MessageCircle, Coins, Plus, Trash2, Edit2, X, Send, Key, Copy, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AdminTab = "donations" | "news" | "tickets" | "beta-keys";
type DonationStatus = "pending" | "approved" | "rejected";
type TicketStatus = "open" | "answered" | "closed";

interface Donation {
  id: number; username: string; packageLabel: string;
  coinsAmount: number; priceBrl: number; status: DonationStatus;
  notes: string | null; createdAt: string;
}

interface NewsItem {
  id: number; title: string; content: string; imageUrl: string | null;
  author: string; published: boolean; createdAt: string;
}

interface Ticket {
  id: number; username: string; subject: string; message: string;
  status: TicketStatus; adminReply: string | null; createdAt: string;
}

function isAdminUser(user: { username: string; role?: string } | null) {
  if (!user) return false;
  return user.role === "admin" || user.username === "admin" || user.username === "ercamaral";
}

export default function Admin() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<AdminTab>("donations");
  const isAdmin = isAdminUser(user);

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <p className="text-muted-foreground">Precisas de estar logado.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-red-500/40 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-black text-white mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Esta área é restrita ao administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="font-display text-3xl font-black text-white mb-2">Painel Admin</h1>
        <p className="text-muted-foreground text-sm mb-6">Gerir doações, notícias e suporte</p>

        <div className="flex gap-2 mb-8 border-b border-white/10 pb-0 flex-wrap">
          {([
            { key: "donations", label: "Doações", icon: <Coins className="w-4 h-4" /> },
            { key: "news", label: "Notícias", icon: <Newspaper className="w-4 h-4" /> },
            { key: "tickets", label: "Suporte", icon: <MessageCircle className="w-4 h-4" /> },
            { key: "beta-keys", label: "Beta Keys", icon: <Key className="w-4 h-4" /> },
          ] as { key: AdminTab; label: string; icon: React.ReactNode }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "donations" && <DonationsTab token={token} />}
        {tab === "news" && <NewsTab token={token} />}
        {tab === "tickets" && <TicketsTab token={token} />}
        {tab === "beta-keys" && <BetaKeysTab token={token} />}
      </div>
    </div>
  );
}

function DonationsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);

  async function fetchDonations() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/donations", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setDonations(data.donations);
    } catch {
      toast({ title: "Erro ao carregar doações", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDonations(); }, [token]);

  async function handleAction(id: number, action: "approve" | "reject") {
    if (!token) return;
    setActing(id);
    try {
      const res = await fetch(`/api/admin/donations/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: action === "approve" ? "Doação aprovada!" : "Doação rejeitada." });
        setDonations(prev => prev.map(d => d.id === id ? { ...d, status: action === "approve" ? "approved" : "rejected" } : d));
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de rede", variant: "destructive" });
    } finally {
      setActing(null);
    }
  }

  const pending = donations.filter(d => d.status === "pending");
  const rest = donations.filter(d => d.status !== "pending");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <StatCard label="Pendentes" value={String(pending.length)} color="yellow" />
          <StatCard label="Aprovadas" value={String(donations.filter(d => d.status === "approved").length)} color="green" />
          <StatCard label="Total Recebido" value={`R$${donations.filter(d => d.status === "approved").reduce((s, d) => s + d.priceBrl, 0)}`} color="gold" />
        </div>
        <Button variant="outline" onClick={fetchDonations} disabled={loading} className="ml-4 border-primary/30 text-primary hover:bg-primary/10 shrink-0">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-16 text-muted-foreground">Carregando...</p>
      ) : donations.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma doação registrada ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">Pendentes</h2>
              <div className="space-y-2">
                {pending.map(d => <DonationRow key={d.id} donation={d} acting={acting} onAction={handleAction} />)}
              </div>
            </div>
          )}
          {rest.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h2>
              <div className="space-y-2">
                {rest.map(d => <DonationRow key={d.id} donation={d} acting={acting} onAction={handleAction} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NewsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", imageUrl: "", published: true });

  async function fetchNews() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setNews(data.news);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchNews(); }, [token]);

  function openCreate() {
    setEditing(null);
    setForm({ title: "", content: "", imageUrl: "", published: true });
    setShowForm(true);
  }

  function openEdit(item: NewsItem) {
    setEditing(item);
    setForm({ title: item.title, content: item.content, imageUrl: item.imageUrl || "", published: item.published });
    setShowForm(true);
  }

  async function handleSave() {
    if (!token || !form.title || !form.content) return;
    setSaving(true);
    try {
      const url = editing ? `/api/admin/news/${editing.id}` : "/api/admin/news";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, imageUrl: form.imageUrl || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: editing ? "Notícia atualizada!" : "Notícia criada!" });
        setShowForm(false);
        if (editing) {
          setNews(prev => prev.map(n => n.id === editing.id ? data.news : n));
        } else {
          setNews(prev => [data.news, ...prev]);
        }
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de rede", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/news/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast({ title: "Notícia eliminada." });
        setNews(prev => prev.filter(n => n.id !== id));
      }
    } catch {
      toast({ title: "Erro de rede", variant: "destructive" });
    }
  }

  async function handleTogglePublished(item: NewsItem) {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/news/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ published: !item.published }),
      });
      const data = await res.json();
      if (res.ok) setNews(prev => prev.map(n => n.id === item.id ? data.news : n));
    } catch {}
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">{news.length} notícia(s)</p>
        <Button onClick={openCreate} className="bg-primary text-black hover:bg-primary/90 font-bold">
          <Plus className="w-4 h-4 mr-2" /> Nova Notícia
        </Button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-black/40 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{editing ? "Editar Notícia" : "Nova Notícia"}</h3>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Título</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="bg-black/40 border-primary/20 text-white" placeholder="Título da notícia" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Conteúdo</Label>
            <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="bg-black/40 border-primary/20 text-white min-h-[120px]" placeholder="Escreva o conteúdo da notícia..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">URL da Imagem (opcional)</Label>
            <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="bg-black/40 border-primary/20 text-white" placeholder="https://..." />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="published" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} className="accent-primary w-4 h-4" />
            <label htmlFor="published" className="text-sm text-white">Publicar imediatamente</label>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving || !form.title || !form.content} className="bg-primary text-black hover:bg-primary/90 font-bold">
              {saving ? "Guardando..." : (editing ? "Guardar alterações" : "Criar notícia")}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-muted-foreground hover:text-white">Cancelar</Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Carregando...</p>
      ) : news.length === 0 && !showForm ? (
        <div className="text-center py-12 text-muted-foreground">
          <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma notícia ainda. Cria a primeira!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {news.map(item => (
            <div key={item.id} className="flex items-start gap-4 rounded-xl border border-primary/10 bg-zinc-950/60 px-5 py-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-white">{item.title}</span>
                  {item.published
                    ? <span className="text-xs text-green-400 bg-green-950/40 border border-green-500/30 px-2 py-0.5 rounded-full">Publicada</span>
                    : <span className="text-xs text-yellow-400 bg-yellow-950/40 border border-yellow-500/30 px-2 py-0.5 rounded-full">Rascunho</span>
                  }
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>
                <p className="text-xs text-muted-foreground/50 mt-1">{new Date(item.createdAt).toLocaleDateString("pt-BR")} · por {item.author}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => handleTogglePublished(item)} className="border-white/10 text-muted-foreground hover:text-white text-xs px-2">
                  {item.published ? "Despublicar" : "Publicar"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="border-primary/30 text-primary hover:bg-primary/10 text-xs px-2">
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)} className="border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs px-2">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TicketsTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [replies, setReplies] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<number | null>(null);

  async function fetchTickets() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setTickets(data.tickets);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTickets(); }, [token]);

  async function handleReply(id: number) {
    const reply = replies[id];
    if (!token || !reply?.trim()) return;
    setSending(id);
    try {
      const res = await fetch(`/api/admin/tickets/${id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reply }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Resposta enviada!" });
        setTickets(prev => prev.map(t => t.id === id ? data.ticket : t));
        setReplies(r => ({ ...r, [id]: "" }));
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de rede", variant: "destructive" });
    } finally {
      setSending(null);
    }
  }

  async function handleClose(id: number) {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/tickets/${id}/close`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTickets(prev => prev.map(t => t.id === id ? data.ticket : t));
    } catch {}
  }

  const open = tickets.filter(t => t.status !== "closed");
  const closed = tickets.filter(t => t.status === "closed");

  const TicketStatusBadge = ({ status }: { status: TicketStatus }) => {
    if (status === "answered") return <span className="text-xs text-blue-400 bg-blue-950/40 border border-blue-500/30 px-2 py-0.5 rounded-full">Respondido</span>;
    if (status === "closed") return <span className="text-xs text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">Fechado</span>;
    return <span className="text-xs text-yellow-400 bg-yellow-950/40 border border-yellow-500/30 px-2 py-0.5 rounded-full">Aberto</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="grid grid-cols-3 gap-4 flex-1">
          <StatCard label="Abertos" value={String(tickets.filter(t => t.status === "open").length)} color="yellow" />
          <StatCard label="Respondidos" value={String(tickets.filter(t => t.status === "answered").length)} color="blue" />
          <StatCard label="Fechados" value={String(tickets.filter(t => t.status === "closed").length)} color="gray" />
        </div>
        <Button variant="outline" onClick={fetchTickets} disabled={loading} className="ml-4 border-primary/30 text-primary hover:bg-primary/10 shrink-0">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Atualizar
        </Button>
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Carregando...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Nenhum ticket de suporte ainda.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {open.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-3">Ativos</h2>
              <div className="space-y-2">
                {open.map(t => (
                  <div key={t.id} className="rounded-xl border border-primary/10 bg-zinc-950/60 overflow-hidden">
                    <button
                      onClick={() => setExpanded(expanded === t.id ? null : t.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-sm">{t.username}</span>
                          <TicketStatusBadge status={t.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{t.subject}</p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</p>
                      </div>
                      <span className="text-muted-foreground text-xs">{expanded === t.id ? "▲" : "▼"}</span>
                    </button>
                    {expanded === t.id && (
                      <div className="border-t border-white/10 px-5 py-4 space-y-4">
                        <div className="bg-black/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Mensagem do utilizador</p>
                          <p className="text-sm text-white/90 whitespace-pre-wrap">{t.message}</p>
                        </div>
                        {t.adminReply && (
                          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                            <p className="text-xs text-primary mb-1 uppercase tracking-wider">Resposta do admin</p>
                            <p className="text-sm text-white/90 whitespace-pre-wrap">{t.adminReply}</p>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Textarea
                            value={replies[t.id] || ""}
                            onChange={e => setReplies(r => ({ ...r, [t.id]: e.target.value }))}
                            placeholder="Escreva sua resposta..."
                            className="bg-black/40 border-primary/20 text-white text-sm min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleReply(t.id)}
                              disabled={sending === t.id || !replies[t.id]?.trim()}
                              className="bg-primary text-black hover:bg-primary/90 font-bold"
                            >
                              <Send className="w-3.5 h-3.5 mr-1.5" />
                              {sending === t.id ? "Enviando..." : "Responder"}
                            </Button>
                            {t.status !== "closed" && (
                              <Button size="sm" variant="outline" onClick={() => handleClose(t.id)} className="border-white/10 text-muted-foreground hover:text-white text-xs">
                                Fechar ticket
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {closed.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fechados</h2>
              <div className="space-y-2">
                {closed.map(t => (
                  <div key={t.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-zinc-950/40 px-5 py-3 opacity-60">
                    <div className="flex-1">
                      <span className="font-semibold text-white text-sm">{t.username}</span>
                      <span className="text-muted-foreground text-sm"> · {t.subject}</span>
                    </div>
                    <TicketStatusBadge status={t.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: "yellow" | "green" | "gold" | "blue" | "gray" }) {
  const colors = {
    yellow: "border-yellow-500/20 bg-yellow-950/10 text-yellow-400",
    green: "border-green-500/20 bg-green-950/10 text-green-400",
    gold: "border-primary/20 bg-primary/5 text-primary",
    blue: "border-blue-500/20 bg-blue-950/10 text-blue-400",
    gray: "border-white/10 bg-white/5 text-muted-foreground",
  };
  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function DonationRow({
  donation: d, acting, onAction,
}: { donation: Donation; acting: number | null; onAction: (id: number, action: "approve" | "reject") => void; }) {
  const date = new Date(d.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  const StatusBadge = () => {
    if (d.status === "approved") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-950/40 border border-green-500/30 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Aprovada</span>;
    if (d.status === "rejected") return <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded-full"><XCircle className="w-3 h-3" /> Rejeitada</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400 bg-yellow-950/40 border border-yellow-500/30 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pendente</span>;
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-primary/10 bg-zinc-950/60 px-5 py-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap"><span className="font-bold text-white">{d.username}</span><StatusBadge /></div>
        <p className="text-sm text-muted-foreground mt-0.5">{d.packageLabel} · <span className="text-primary font-semibold">R${d.priceBrl}</span></p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">{date}</p>
        {d.notes && <p className="text-xs text-yellow-400/70 mt-1">Nota: {d.notes}</p>}
      </div>
      {d.status === "pending" && (
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={() => onAction(d.id, "approve")} disabled={acting === d.id} className="bg-green-600 hover:bg-green-500 text-white text-xs px-3">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Aprovar
          </Button>
          <Button size="sm" variant="outline" onClick={() => onAction(d.id, "reject")} disabled={acting === d.id} className="border-red-500/30 text-red-400 hover:bg-red-950/30 text-xs px-3">
            <XCircle className="w-3.5 h-3.5 mr-1" /> Rejeitar
          </Button>
        </div>
      )}
    </div>
  );
}

interface BetaKey {
  id: number;
  code: string;
  usedBy: string | null;
  usedAt: string | null;
  createdAt: string;
}

function BetaKeysTab({ token }: { token: string | null }) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<BetaKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [count, setCount] = useState(15);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function fetchKeys() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/beta-keys", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setKeys(data.keys);
    } catch {
      toast({ title: "Erro ao carregar chaves", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchKeys(); }, [token]);

  async function handleGenerate() {
    if (!token) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/beta-keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: `${data.keys.length} chaves geradas!` });
        setKeys(prev => [...data.keys, ...prev]);
      } else {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro de rede", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: number) {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/beta-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setKeys(prev => prev.filter(k => k.id !== id));
        toast({ title: "Chave removida." });
      }
    } catch {
      toast({ title: "Erro ao remover chave", variant: "destructive" });
    }
  }

  function copyKey(key: BetaKey) {
    navigator.clipboard.writeText(key.code);
    setCopiedId(key.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function copyAll() {
    const unused = keys.filter(k => !k.usedBy).map(k => k.code).join("\n");
    navigator.clipboard.writeText(unused);
    toast({ title: "Todas as chaves não usadas copiadas!" });
  }

  const unused = keys.filter(k => !k.usedBy);
  const used = keys.filter(k => k.usedBy);

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" /> Gerar Códigos Beta
        </h3>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Quantidade</Label>
            <Input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
              className="w-24 bg-black/50 border-white/20"
            />
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="bg-primary hover:bg-primary/90 font-bold uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-1" /> {generating ? "Gerando..." : "Gerar"}
          </Button>
          {unused.length > 0 && (
            <Button onClick={copyAll} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Copy className="w-4 h-4 mr-1" /> Copiar Todos
            </Button>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-green-400 font-semibold">{unused.length} disponíveis</span>
          <span className="text-muted-foreground">{used.length} utilizados</span>
          <span className="text-muted-foreground">{keys.length} total</span>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : keys.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Nenhuma chave gerada ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map(key => (
            <div
              key={key.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${
                key.usedBy ? "bg-white/3 border-white/5 opacity-60" : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`font-mono text-sm tracking-wider ${key.usedBy ? "text-muted-foreground line-through" : "text-primary"}`}>
                  {key.code}
                </span>
                {key.usedBy && (
                  <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full">
                    usado por <span className="text-white font-semibold">{key.usedBy}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!key.usedBy && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-muted-foreground hover:text-white"
                    onClick={() => copyKey(key)}
                  >
                    {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-muted-foreground hover:text-red-400"
                  onClick={() => handleDelete(key.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
