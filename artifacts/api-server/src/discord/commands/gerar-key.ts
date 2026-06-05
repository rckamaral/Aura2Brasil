import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { randomBytes } from "crypto";
import { sql } from "drizzle-orm";
import { db } from "@workspace/db";
import type { Command } from "../client.js";

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
    await interaction.deferReply({ ephemeral: true });

    if (!isAllowedAdmin(interaction)) {
      await interaction.editReply("Apenas o admin autorizado pode gerar beta keys.");
      return;
    }

    const count = interaction.options.getInteger("quantidade") ?? 1;
    const rows = Array.from({ length: count }, () => ({ code: generateCode() }));

    try {
      const result = await db.execute<{ code: string }>(sql`
        INSERT INTO beta_keys (code)
        SELECT * FROM unnest(${codesArray(rows.map((row) => row.code))}::text[])
        RETURNING code
      `);
      const codes = result.rows.map((key) => key.code);

      const embed = new EmbedBuilder()
        .setTitle(count === 1 ? "Beta key gerada" : "Beta keys geradas")
        .setDescription(codes.map((code) => `\`${code}\``).join("\n"))
        .setColor(0xd4a017)
        .setFooter({ text: "Essas keys aparecem so para voce." })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("Nao consegui gerar a key agora. Verifique o DATABASE_URL da API.");
    }
  },
};

function codesArray(codes: string[]): string[] {
  return codes;
}
