export default function TermosDeUso() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="border-b border-primary/20 pb-6 mb-10">
          <p className="text-xs text-primary uppercase tracking-[0.3em] font-semibold mb-2">
            Aura 2
          </p>
          <h1 className="text-4xl font-bold text-primary">Termos de Uso</h1>
          <p className="text-muted-foreground mt-3 text-sm">
            Última atualização: janeiro de 2026
          </p>
        </div>

        <div className="space-y-10 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              1. Aceitação dos Termos
            </h2>
            <p>
              Ao criar uma conta e acessar o servidor Aura 2, você declara que
              leu, compreendeu e concorda com estes Termos de Uso. Caso não
              concorde com algum dos termos, não utilize o servidor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              2. Elegibilidade
            </h2>
            <p>
              O Aura 2 é um servidor privado de Metin2 destinado a maiores de 13
              anos. Ao se registrar, você confirma que possui a idade mínima
              exigida. A equipe reserva o direito de encerrar contas que violem
              este requisito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              3. Contas e Senhas
            </h2>
            <p>Você é responsável por:</p>
            <ul className="list-disc list-inside mt-3 space-y-1 pl-2">
              <li>Manter a confidencialidade da sua senha</li>
              <li>Todas as atividades realizadas em sua conta</li>
              <li>
                Notificar imediatamente a equipe em caso de acesso não
                autorizado
              </li>
            </ul>
            <p className="mt-3">
              É proibido compartilhar, vender ou transferir contas para outros
              jogadores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              4. Regras de Conduta
            </h2>
            <p>Ao jogar no Aura 2, você concorda em NÃO:</p>
            <ul className="list-disc list-inside mt-3 space-y-1 pl-2">
              <li>Utilizar hacks, bots, scripts ou qualquer tipo de trapaça</li>
              <li>Explorar bugs ou falhas do servidor de forma intencional</li>
              <li>Assediar, ameaçar ou insultar outros jogadores</li>
              <li>Divulgar informações pessoais de outros sem consentimento</li>
              <li>
                Fazer propaganda de outros servidores dentro do jogo ou Discord
              </li>
              <li>
                Realizar qualquer atividade que prejudique a experiência dos
                demais jogadores
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              5. Doações e Pagamentos
            </h2>
            <p>
              O Aura 2 pode oferecer itens ou benefícios (LOJA DE MOEDAS) em
              troca de doações voluntárias. Todas as doações são definitivas e
              não reembolsáveis, exceto em casos previstos em lei. A equipe não
              garante a permanência de itens ou benefícios adquiridos em caso de
              encerramento do servidor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              6. Propriedade Intelectual
            </h2>
            <p>
              O Aura 2 é um servidor privado não oficial de Metin2, desenvolvido
              por fãs sem fins lucrativos. Todo o conteúdo original do jogo
              pertence aos seus respectivos desenvolvedores e distribuidores. Os
              recursos exclusivos do Aura 2 pertencem à equipe do servidor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              7. Punições e Banimentos
            </h2>
            <p>
              A equipe reserva o direito de aplicar punições (avisos, suspensões
              temporárias ou banimento permanente) a qualquer conta que viole
              estes termos ou as regras do servidor, sem necessidade de aviso
              prévio. Decisões de banimento são definitivas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              8. Disponibilidade do Servidor
            </h2>
            <p>
              O Aura 2 é fornecido "como está", sem garantia de disponibilidade
              contínua. A equipe pode realizar manutenções, atualizações ou
              encerrar o servidor a qualquer momento, sem aviso prévio ou
              compensação aos jogadores.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              9. Alterações nos Termos
            </h2>
            <p>
              Estes Termos de Uso podem ser modificados a qualquer momento. As
              alterações entram em vigor assim que publicadas no site. O uso
              continuado do servidor após as alterações implica a aceitação dos
              novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">
              10. Contato
            </h2>
            <p>
              Em caso de dúvidas sobre estes Termos de Uso, entre em contato com
              a equipe pelo Discord oficial do Aura 2.
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
