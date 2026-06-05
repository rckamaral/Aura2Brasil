import { GuildMember, EmbedBuilder, TextChannel } from "discord.js";
import { logger } from "../../lib/logger.js";

export async function onGuildMemberAdd(member: GuildMember): Promise<void> {
  const channelId = process.env.DISCORD_WELCOME_CHANNEL_ID;
  if (!channelId) return;

  try {
    const channel = member.guild.channels.cache.get(channelId) as TextChannel | undefined;
    if (!channel?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("⚔️ Bem-vindo ao Aura2!")
      .setDescription(
        `Olá, **${member.displayName}**! Seja bem-vindo ao servidor oficial do **Aura2**.\n\n` +
        "📜 Leia as **#regras** para conviver bem na comunidade.\n" +
        "🎮 Crie sua conta em **www.aura2.com.br** e entre na aventura!\n" +
        "🆘 Precisa de ajuda? Abra um ticket em **#suporte**.",
      )
      .setThumbnail(member.user.displayAvatarURL())
      .setColor(0xd4a017)
      .setTimestamp()
      .setFooter({ text: `Membro #${member.guild.memberCount}` });

    await channel.send({ content: `${member}`, embeds: [embed] });
  } catch (err) {
    logger.warn({ err, userId: member.id }, "Discord: failed to send welcome message");
  }
}
