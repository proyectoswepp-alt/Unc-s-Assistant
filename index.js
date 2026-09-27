const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Comprueba si el bot está funcionando"),

  new SlashCommandBuilder()
    .setName("server-info")
    .setDescription("Muestra información del servidor")
].map(command => command.toJSON());

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} está conectado`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

  if (interaction.commandName === "server-info") {
    const guild = interaction.guild;

    await interaction.reply(
      `📊 **Información del servidor**\n\n` +
      `👑 Dueño: <@${guild.ownerId}>\n` +
      `👥 Miembros: ${guild.memberCount}\n` +
      `💬 Canales: ${guild.channels.cache.size}\n` +
      `🆔 ID: ${guild.id}`
    );
  }
});

async function start() {
  const token = process.env.DISCORD_TOKEN;

  if (!token) {
    console.error("❌ Falta DISCORD_TOKEN");
    return;
  }

  const rest = new REST({ version: "10" }).setToken(token);

  try {
    console.log("🔄 Registrando comandos...");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Comandos registrados");
  } catch (error) {
    console.error(error);
  }

  await client.login(token);
}

start();
