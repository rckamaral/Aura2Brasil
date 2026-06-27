import {
  EmbedBuilder,
  TextChannel,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";
import client from "./client.js";
import { logger } from "../lib/logger.js";

async function getTextChannel(channelId: string | undefined): Promise<TextChannel | null> {
  if (!channelId || !client.isReady()) return null;
  try {
    const channel = await client.channels.fetch(channelId);
    if (channel instanceof TextChannel) return channel;
  } catch {
    // channel not found or no access
  }
  return null;
}

export async function notifyNewUser(username: string): Promise<void> {
  const channel = await getTextChannel(process.env.DISCORD_NOVOS_MEMBROS_CHANNEL_ID);
  if (!channel) return;
  try {
    const embed = new EmbedBuilder()
      .setTitle("⚔️ Novo Guerreiro!")
      .setDescription(`**${username}** acabou de criar uma conta no Aura2!\nBem-vindo ao servidor!`)
      .setColor(0xd4a017)
      .setTimestamp()
      .setFooter({ text: "Aura2 — Reviva a Essência do Metin2" });
    await channel.send({ embeds: [embed] });
  } catch (err) {
    logger.warn({ err }, "Discord: failed to send new user notification");
  }
}

export async function notifyNewTicket(
  ticketId: number,
  username: string,
  subject: string,
  message: string,
): Promise<void> {
  if (!client.isReady()) return;

  const guildId = process.env.DISCORD_GUILD_ID;
  const staffRoleId = process.env.DISCORD_STAFF_ROLE_ID;
  if (!guildId) return;

  try {
    const guild = await client.guilds.fetch(guildId);
    await guild.channels.fetch();

    // Find the SUPORTE category by name
    const category = guild.channels.cache.find(
      (ch) => ch.type === ChannelType.GuildCategory &&
        ch.name.toLowerCase().includes("suporte"),
    );

    const permissionOverwrites = [
      { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      ...(staffRoleId
        ? [{
            id: staffRoleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.ManageMessages,
            ],
          }]
        : []),
    ];

    const channel = await guild.channels.create({
      name: `ticket-site-${username}`,
      type: ChannelType.GuildText,
      topic: `Ticket #${ticketId} aberto pelo site — usuário: ${username}`,
      parent: category?.id ?? undefined,
      permissionOverwrites,
    });

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticketId} — ${subject}`)
      .setDescription(message)
      .addFields({ name: "Usuário", value: username, inline: true })
      .setColor(0xd4a017)
      .setTimestamp()
      .setFooter({ text: "Aberto via site www.aura2.com.br" });

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("Fechar Ticket")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(closeButton);

    await channel.send({
      content: staffRoleId ? `<@&${staffRoleId}>` : undefined,
      embeds: [embed],
      components: [row],
    });

    logger.info({ ticketId, username, channel: channel.name }, "Discord: ticket channel created from site");
  } catch (err) {
    logger.warn({ err, ticketId, username }, "Discord: failed to create ticket channel from site");
  }
}

export async function notifyDonation(
  username: string,
  packageLabel: string,
  coinsAmount: number,
  priceBrl: number,
  statusText = "Cash creditado automaticamente",
): Promise<void> {
  const channel = await getTextChannel(process.env.DISCORD_DOADORES_CHANNEL_ID);
  if (!channel) return;
  try {
    const formattedPrice = priceBrl.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    const embed = new EmbedBuilder()
      .setTitle("💎 Doação Aprovada!")
      .setDescription(`**${username}** apoiou o servidor Aura2! Muito obrigado! 🙏`)
      .addFields(
        { name: "Pacote", value: packageLabel, inline: true },
        { name: "Valor", value: formattedPrice, inline: true },
        { name: "Status", value: statusText, inline: false },
      )
      .setColor(0x9b59b6)
      .setTimestamp()
      .setFooter({ text: "Aura2 — Obrigado pelo apoio!" });
    await channel.send({ embeds: [embed] });
  } catch (err) {
    logger.warn({ err }, "Discord: failed to send donation notification");
  }
}
