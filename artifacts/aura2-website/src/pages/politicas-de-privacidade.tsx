export default function PoliticasDePrivacidade() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="border-b border-primary/20 pb-6 mb-10">
          <p className="text-xs text-primary uppercase tracking-[0.3em] font-semibold mb-2">
            Aura 2
          </p>
          <h1 className="text-4xl font-bold text-primary">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Última atualização: janeiro de 2026
          </p>
        </div>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Informações que Coletamos
            </h2>
            <p>
              Ao se registrar e jogar no servidor Aura 2, coletamos as seguintes
              informações:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1 pl-2">
              <li>
                Nome de usuário e senha (armazenada de forma criptografada)
              </li>
              <li>Endereço de e-mail</li>
              <li>Endereço de IP utilizado para conexão</li>
              <li>
                Dados de jogo (personagens, inventário, histórico de atividades)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Como Usamos Suas Informações
            </h2>
            <p>As informações coletadas são utilizadas exclusivamente para:</p>
            <ul className="list-disc list-inside mt-3 space-y-1 pl-2">
              <li>Gerenciar sua conta e progresso no jogo</li>
              <li>Garantir a segurança do servidor e prevenir abusos</li>
              <li>
                Enviar comunicações importantes sobre o servidor (manutenções,
                atualizações)
              </li>
              <li>Investigar e resolver disputas ou violações das regras</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Compartilhamento de Dados
            </h2>
            <p>
              O Aura 2 não vende, aluga ou compartilha suas informações pessoais
              com terceiros, exceto quando exigido por lei ou para proteger os
              direitos e a segurança do servidor e de seus jogadores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Segurança
            </h2>
            <p>
              Adotamos medidas técnicas e organizacionais para proteger seus
              dados contra acesso não autorizado, alteração, divulgação ou
              destruição. Suas senhas são armazenadas utilizando criptografia e
              nunca são acessadas em texto plano pela equipe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Cookies e Rastreamento
            </h2>
            <p>
              Nosso site pode utilizar cookies para melhorar sua experiência de
              navegação, como manter sua sessão ativa. Você pode desativar os
              cookies nas configurações do seu navegador, porém isso pode afetar
              o funcionamento de algumas funcionalidades do site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Retenção de Dados
            </h2>
            <p>
              Seus dados são mantidos enquanto sua conta estiver ativa. Contas
              inativas por mais de 12 meses podem ser removidas, junto com todos
              os dados associados. Você pode solicitar a exclusão da sua conta a
              qualquer momento entrando em contato com a equipe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Menores de Idade
            </h2>
            <p>
              O Aura 2 não coleta intencionalmente informações de menores de 13
              anos. Se você acredita que uma criança forneceu dados pessoais ao
              nosso servidor, entre em contato para que possamos remover essas
              informações.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Alterações nesta Política
            </h2>
            <p>
              Podemos atualizar esta Política de Privacidade periodicamente.
              Notificaremos os jogadores sobre mudanças significativas por meio
              do site ou do Discord oficial. O uso continuado do servidor após
              as alterações implica a aceitação da nova política.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Contato
            </h2>
            <p>
              Para dúvidas, solicitações ou reclamações relacionadas à
              privacidade, entre em contato com a equipe do Aura 2 pelo nosso
              servidor oficial do Discord.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-6 border-t border-primary/20 text-center text-xs text-muted-foreground">
          © 2026 Aura2. Todos os direitos reservados.
        </div>
      </div>
    </main>
  );
}
