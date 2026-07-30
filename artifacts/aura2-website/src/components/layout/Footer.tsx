import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-background/95 pt-12 pb-8 mt-24">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-display font-bold text-2xl text-primary tracking-wider">
            AURA 2
          </span>
          <p className="text-sm text-muted-foreground mt-2">
            © 2026 Aura2. Todos os direitos reservados.
          </p>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            Início
          </Link>
          <Link
            href="/download"
            className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            Download
          </Link>
          <Link
            href="/termos-de-uso"
            className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            Termos de Uso
          </Link>
          <Link
            href="/politicas-de-privacidade"
            className="text-sm text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
          >
            Política de Privacidade
          </Link>
          <a
            href="https://discord.gg/PRTpgj28Dw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#5865F2] hover:text-[#4752c4] transition-colors uppercase tracking-wider font-semibold"
          >
            Discord
          </a>
        </nav>
      </div>
    </footer>
  );
}
