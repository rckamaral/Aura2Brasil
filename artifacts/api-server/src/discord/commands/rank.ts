import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { db, donationsTable, accountsTable } from "@workspace/db";
import { eq, desc, sum } from "drizzle-orm";
import type { Command } from "../client.js";

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

export const rank: Command = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Mostra o ranking dos maiores doadores do servidor"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    try {
      const rows = await db
        .select({
          username: donationsTable.username,
          total: sum(donationsTable.coinsAmount),
        })
        .from(donationsTable)
        .where(eq(donationsTable.status, "approved"))
        .groupBy(donationsTable.username)
        .orderBy(desc(sum(donationsTable.coinsAmount)))
        .limit(5);

      if (!rows.length) {
        await interaction.editReply("Nenhum doador registrado ainda. Seja o primeiro!");
        return;
      }

      const lines = rows.map((r, i) => {
        const coins = Number(r.total ?? 0).toLocaleString("pt-BR");
        return `${MEDALS[i]} **${r.username}** — ${coins} Moedas Cash`;
      });

      const embed = new EmbedBuilder()
        .setTitle("🏆 Top Doadores — Aura2")
        .setDescription(lines.join("\n"))
        .setColor(0xd4a017)
        .setTimestamp()
        .setFooter({ text: "Aura2 — Reviva a Essência do Metin2" });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply("Erro ao buscar o ranking. Tenta novamente.");
    }
  },
};
