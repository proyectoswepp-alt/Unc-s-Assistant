const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// ===============================
// COMANDOS
// ===============================

const commands = [

  // PING
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Comprueba si el bot está funcionando"),

  // SERVER INFO
  new SlashCommandBuilder()
    .setName("server-info")
    .setDescription("Muestra información del servidor"),

  // PURGE
  new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Elimina mensajes del canal")
    .addIntegerOption(option =>
      option
        .setName("cantidad")
        .setDescription("Cantidad de mensajes a eliminar (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // KICK
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Expulsa a un usuario del servidor")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres expulsar")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón de la expulsión")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  // BAN
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Banea a un usuario del servidor")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres banear")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón del baneo")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  // MUTE
  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Silencia temporalmente a un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres silenciar")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Duración del mute en minutos")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320)
    )
    .addStringOption(option =>
      option
        .setName("razon")
        .setDescription("Razón del mute")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

].map(command => command.toJSON());


// ===============================
// BOT LISTO
// ===============================

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} está conectado`);
});


// ===============================
// INTERACCIONES
// ===============================

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  // ===============================
  // PING
  // ===============================

  if (interaction.commandName === "ping") {

    await interaction.reply(
      `🏓 Pong! **${client.ws.ping}ms**`
    );

  }


  // ===============================
  // SERVER INFO
  // ===============================

  if (interaction.commandName === "server-info") {

    const guild = interaction.guild;

    await interaction.reply({
      content:
        `## 📊 Información del servidor\n\n` +
        `👑 **Dueño:** <@${guild.ownerId}>\n` +
        `👥 **Miembros:** ${guild.memberCount}\n` +
        `💬 **Canales:** ${guild.channels.cache.size}\n` +
        `🎭 **Roles:** ${guild.roles.cache.size}\n` +
        `🆔 **ID:** ${guild.id}`,
      ephemeral: false
    });

  }


  // ===============================
  // PURGE
  // ===============================

  if (interaction.commandName === "purge") {

    const cantidad = interaction.options.getInteger("cantidad");

    try {

      const mensajes = await interaction.channel.bulkDelete(
        cantidad,
        true
      );

      const respuesta = await interaction.reply({
        content: `🗑️ Se eliminaron **${mensajes.size} mensajes**.`,
        ephemeral: true
      });

      setTimeout(() => {
        respuesta.delete().catch(() => {});
      }, 3000);

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content: "❌ No pude eliminar los mensajes. Comprueba mis permisos.",
        ephemeral: true
      });

    }

  }


  // ===============================
  // KICK
  // ===============================

  if (interaction.commandName === "kick") {

    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    try {

      const miembro = await interaction.guild.members.fetch(usuario.id);

      if (!miembro.kickable) {

        return interaction.reply({
          content:
            "❌ No puedo expulsar a ese usuario. Puede que tenga un rol superior al mío.",
          ephemeral: true
        });

      }

      await miembro.kick(razon);

      await interaction.reply(
        `👢 **${usuario.tag}** fue expulsado.\n📝 Razón: ${razon}`
      );

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content: "❌ No pude expulsar a ese usuario.",
        ephemeral: true
      });

    }

  }


  // ===============================
  // BAN
  // ===============================

  if (interaction.commandName === "ban") {

    const usuario = interaction.options.getUser("usuario");
    const razon =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    try {

      const miembro = await interaction.guild.members.fetch(usuario.id);

      if (!miembro.bannable) {

        return interaction.reply({
          content:
            "❌ No puedo banear a ese usuario. Puede que tenga un rol superior al mío.",
          ephemeral: true
        });

      }

      await miembro.ban({
        reason: razon
      });

      await interaction.reply(
        `🔨 **${usuario.tag}** fue baneado.\n📝 Razón: ${razon}`
      );

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content: "❌ No pude banear a ese usuario.",
        ephemeral: true
      });

    }

  }


  // ===============================
  // MUTE / TIMEOUT
  // ===============================

  if (interaction.commandName === "mute") {

    const usuario = interaction.options.getUser("usuario");
    const minutos = interaction.options.getInteger("minutos");

    const razon =
      interaction.options.getString("razon") ||
      "Sin razón especificada";

    try {

      const miembro = await interaction.guild.members.fetch(usuario.id);

      if (!miembro.moderatable) {

        return interaction.reply({
          content:
            "❌ No puedo silenciar a ese usuario. Puede que tenga un rol superior al mío.",
          ephemeral: true
        });

      }

      const duracion = minutos * 60 * 1000;

      await miembro.timeout(
        duracion,
        razon
      );

      await interaction.reply(
        `🔇 **${usuario.tag}** fue silenciado durante **${minutos} minutos**.\n📝 Razón: ${razon}`
      );

    } catch (error) {

      console.error(error);

      await interaction.reply({
        content:
          "❌ No pude silenciar a ese usuario. Comprueba mis permisos.",
        ephemeral: true
      });

    }

  }

});


// ===============================
// INICIAR BOT
// ===============================

async function start() {

  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;

  if (!token) {
    console.error("❌ Falta DISCORD_TOKEN");
    return;
  }

  if (!clientId) {
    console.error("❌ Falta CLIENT_ID");
    return;
  }

  const rest = new REST({
    version: "10"
  }).setToken(token);

  try {

    console.log("🔄 Registrando comandos...");

    await rest.put(
      Routes.applicationCommands(clientId),
      {
        body: commands
      }
    );

    console.log("✅ Comandos registrados");

  } catch (error) {

    console.error("❌ Error registrando comandos:", error);

  }

  try {

    await client.login(token);

  } catch (error) {

    console.error("❌ Error iniciando sesión:", error);

  }

}

start();
