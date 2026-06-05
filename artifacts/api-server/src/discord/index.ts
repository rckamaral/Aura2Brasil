import { REST, Routes, Events } from "discord.js";
import client, { commands } from "./client.js";
import { rank } from "./commands/rank.js";
import { setupTickets } from "./commands/ticket.js";
import { setupBemVindo } from "./commands/setup-bem-vindo.js";
import { setupRegras } from "./commands/setup-regras.js";
import { setupSugestoes } from "./commands/setup-sugestoes.js";
import { setupEmojis } from "./commands/setup-emojis.js";
import { setupAnuncioBeta } from "./commands/setup-anuncio-beta.js";
import { gerarKey } from "./commands/gerar-key.js";
import { onGuildMemberAdd } from "./events/guildMemberAdd.js";
import { onInteractionCreate } from "./events/interactionCreate.js";
import { logger } from "../lib/logger.js";

const commandList = [rank, setupTickets, setupBemVindo, setupRegras, setupSugestoes, setupEmojis, setupAnuncioBeta, gerarKey];

async function registerCommands(token: string, clientId: string, guildId: string): Promise<void> {
  const rest = new REST().setToken(token);
  const body = commandList.map((c) => c.data.toJSON());
  await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
  logger.info({ count: body.length }, "Discord: slash commands registered");
}

export async function initDiscord(): Promise<void> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token) {
    logger.info("Discord: DISCORD_BOT_TOKEN not set — bot disabled");
    return;
  }

  for (const command of commandList) {
    commands.set(command.data.name, command);
  }

  client.once(Events.ClientReady, async (readyClient) => {
    const resolvedClientId = readyClient.user.id;
    logger.info({ tag: readyClient.user.tag, clientId: resolvedClientId }, "Discord: bot online");
    if (guildId) {
      try {
        await registerCommands(token, resolvedClientId, guildId);
      } catch (err) {
        logger.warn({ err }, "Discord: failed to register slash commands");
      }
    }
  });

  client.on(Events.GuildMemberAdd, onGuildMemberAdd);
  client.on(Events.InteractionCreate, onInteractionCreate);

  client.on(Events.Error, (err) => {
    logger.warn({ err }, "Discord: client error");
  });

  await client.login(token);
}
