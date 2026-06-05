import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { randomBytes } from "crypto";
import { db, betaKeysTable } from "@workspace/db";
import type { Command } from "../client.js";
import { logger } from "../../lib/logger.js";

function generateCode(): string {
  const part = () => randomBytes(3).toString("hex").toUpperCase();
  return `AURA2-${part()}-${part()}`;
}

function isAllowedAdmin(interaction: ChatInputCommandInteraction): boolean {
  const adminUserId = process.env.DISCORD_ADMIN_USER_ID;
  if (adminUserId) {
    return interaction.user.id === adminUserId;
  }

  if (interaction.guild?.ownerId === interaction.user.id) {
    return true;
  }

  return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;
}

export const gerarKey: Command = {
  data: (new SlashCommandBuilder()
    .setName("gerar-key")
    .setDescription("Gera beta keys do Aura2")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addIntegerOption((option) =>
      option
        .setName("quantidade")
        .setDescription("Quantidade de keys para gerar")
        .setMinValue(1)
        .setMaxValue(20)
        .setRequired(false),
    )) as Command["data"],

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!isAllowedAdmin(interaction)) {
      await interaction.reply({ content: "Apenas o admin autorizado pode gerar beta keys.", ephemeral: true });
      return;
    }

    await interaction.reply({ content: "Gerando beta key...", ephemeral: true });

    const count = interaction.options.getInteger("quantidade") ?? 1;

    try {
      const inserted = await db
        .insert(betaKeysTable)
        .values(Array.from({ length: count }, () => ({ code: generateCode() })))
        .returning();

      const codes = inserted.map((key) => key.code);

      const embed = new EmbedBuilder()
        .setTitle(count === 1 ? "Beta key gerada" : "Beta keys geradas")
        .setDescription(codes.map((code) => `\`${code}\``).join("\n"))
        .setColor(0xd4a017)
        .setFooter({ text: "Essas keys aparecem so para voce." })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      logger.warn({ err }, "Discord: failed to generate beta key");
      await interaction.editReply("Nao consegui gerar a key agora. Veja os logs da API no Railway.");
    }
  },
};
