import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { logger } from "../../lib/logger.js";

export const setupBemVindo = {
  data: new SlashCommandBuilder()
    .setName("setup-bem-vindo")
    .setDescription("Posta o painel de boas-vindas do servidor (apenas admins)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const channel = interaction.channel as TextChannel | null;
    if (!channel) {
      await interaction.editReply("Erro: canal não encontrado.");
      return;
    }

    try {
      const embed = new EmbedBuilder()
        .setTitle("Bem-vindo ao Discord Oficial do Aura2!")
        .setDescription(
          "**Aura2** é um servidor clássico de Metin2 que resgata a essência do jogo original.\n" +
          "Construído com sistemas modernos para tornar a experiência mais dinâmica, divertida e equilibrada.\n\n" +
          "❌ Não é hardcore.\n" +
          "❌ Não é pay-to-win.\n" +
          "❌ Sem trajes e pets pagos.\n" +
          "✅ Balanceado e justo para todos.\n\n" +
          "🌐 Acompanhe nossas Redes Sociais:\n" +
          "• https://www.aura2.com.br\n" +
          "• https://discord.gg/aura2",
        )
        .setColor(0xd4a017)
        .setTimestamp();

      await channel.send({ embeds: [embed] });
      await interaction.editReply("✅ Painel de boas-vindas postado!");
      logger.info({ channel: channel.name }, "Discord: setup-bem-vindo posted");
    } catch (err) {
      logger.warn({ err }, "Discord: failed to post bem-vindo");
      await interaction.editReply("Erro ao postar o painel.");
    }
  },
};
