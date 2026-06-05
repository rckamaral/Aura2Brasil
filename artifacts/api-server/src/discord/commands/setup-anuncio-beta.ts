import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { logger } from "../../lib/logger.js";

export const setupAnuncioBeta = {
  data: new SlashCommandBuilder()
    .setName("setup-anuncio-beta")
    .setDescription("Posta o anúncio do Beta Fechado no canal (apenas admins)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel as TextChannel | null;
    if (!channel) {
      await interaction.editReply("Erro: canal não encontrado.");
      return;
    }

    try {
      // Embed 1 — Anúncio principal
      const mainEmbed = new EmbedBuilder()
        .setTitle("🔒 Beta Fechado — Temporada 1")
        .setDescription(
          "@everyone\n\n" +
          "O **Aura2** entra oficialmente na sua **Fase Beta Fechada!**\n\n" +
          "Durante **15 dias**, entre **15 e 20 testadores** selecionados pela equipe terão acesso exclusivo ao servidor para avaliar todos os sistemas antes do lançamento oficial.\n\n" +
          "> ⚠️ Este é um beta **FECHADO** — o acesso não é público e não há inscrições abertas. Os testadores foram convidados diretamente pela equipe.",
        )
        .addFields(
          {
            name: "⚔️ O que será testado",
            value:
              "• Sistema de combate PvP e PvE\n" +
              "• Balanceamento das 4 classes (Guerreiro, Ninja, Shura e Shaman)\n" +
              "• Sistema de itens, drops e dungeons\n" +
              "• Economia do servidor e loja de Cash\n" +
              "• Estabilidade e performance geral",
            inline: false,
          },
          {
            name: "🌐 Site oficial",
            value: "https://www.aura2.com.br",
            inline: true,
          },
          {
            name: "💬 Discord",
            value: "https://discord.gg/aura2",
            inline: true,
          },
        )
        .setColor(0xd4a017)
        .setTimestamp()
        .setFooter({ text: "Aura2 — Reviva a Essência do Metin2" });

      // Embed 2 — Recompensas
      const rewardsEmbed = new EmbedBuilder()
        .setTitle("💎 Recompensas para Testadores")
        .setDescription(
          "Para agradecer aos testadores que ajudaram a construir o Aura2, preparamos recompensas especiais para o lançamento oficial!",
        )
        .addFields(
          {
            name: "🏅 Moedas por participação",
            value:
              "• Jogou pelo menos **5 horas** durante o beta → **5.000 Moedas**\n" +
              "• Reportou pelo menos **1 bug confirmado** → **+25.000 Moedas bônus**\n" +
              "• Jogou até o final do beta **(15 dias completos)** → **50.000 Moedas**",
            inline: false,
          },
          {
            name: "🎁 Kit de boas-vindas",
            value:
              "• Equipamentos iniciais\n" +
              "• 3 poções de experiência (dobra o XP por 1h cada)\n" +
              "• Acesso ao canal exclusivo de testadores",
            inline: false,
          },
        )
        .setColor(0x9b59b6)
        .setFooter({ text: "Recompensas creditadas nas primeiras 24h após abertura oficial" });

      // Embed 3 — Reportar bugs
      const bugsEmbed = new EmbedBuilder()
        .setTitle("🐛 Como Reportar Bugs")
        .setDescription(
          "Reportar bugs é uma das responsabilidades mais importantes dos testadores.",
        )
        .addFields(
          {
            name: "📋 Passo a passo",
            value:
              "1. Abra um ticket no site **www.aura2.com.br** ou no canal `#abrir-ticket`\n" +
              "2. Informe: **Nome**, **Classe**, **Descrição do bug**, **Print ou vídeo**\n" +
              "3. Aguarde a confirmação da equipe",
            inline: false,
          },
          {
            name: "❌ Regras importantes",
            value:
              "• Não explore bugs para obter vantagem\n" +
              "• Não utilize hacks ou programas externos\n" +
              "• Não compartilhe o cliente com terceiros\n" +
              "• Violações resultam em perda da recompensa e banimento",
            inline: false,
          },
        )
        .setColor(0xe74c3c)
        .setFooter({ text: "Cada bug confirmado garante +25.000 Moedas extras!" });

      await channel.send({ content: "@everyone", embeds: [mainEmbed] });
      await channel.send({ embeds: [rewardsEmbed] });
      await channel.send({ embeds: [bugsEmbed] });

      await interaction.editReply("✅ Anúncio do Beta Fechado postado em 3 embeds!");
      logger.info({ channel: channel.name }, "Discord: beta announcement posted");
    } catch (err) {
      logger.warn({ err }, "Discord: failed to post beta announcement");
      await interaction.editReply("Erro ao postar o anúncio.");
    }
  },
};
