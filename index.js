process.env.NODE_NO_WARNINGS = '1';

const { 
    Client, 
    GatewayIntentBits, 
    ActivityType, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- CONFIG ---
const TOKEN = 'PASTE-BOT-TOKEN-HERE'; 
const CLIENT_ID = 'PASTE-APP-ID-HERE';
const SOUNDCLOUD_PLAYLIST = 'PASTE-SOUNDCLOUD-PLAYLIST-HERE';
const BUMPER_PLAYLIST = 'https://soundcloud.com/nicodemus_experiment/sets/nexp-fm-station-ids';

const TARGET_VC_NAME = 'NEXP FM';
const TARGET_NP_CHANNEL = 'now-playing';

let songCounter = 0;
let nextBumperAt = Math.floor(Math.random() * (12 - 8 + 1)) + 8; 
let cachedBumpers = [];

const distube = new DisTube(client, {
    plugins: [new SoundCloudPlugin()],
    emitNewSongOnly: true,
    joinNewVoiceChannel: true 
});

client.on('ready', async () => {
    console.log(`✅ NEXP.FM 2.0 ONLINE | Syndication Sovereign Mode`);
    distube.options.leaveOnEmpty = false;
    distube.options.leaveOnFinish = false;
    startMultiBroadcast();
});

// --- COMMAND LISTENER ---
// This block fixes the "Application did not respond" error
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const queue = distube.getQueue(interaction.guildId);

    if (interaction.commandName === 'status') {
        const status = queue ? `📡 Signal Strong: Playing **${queue.songs[0].name}**` : "⚠️ Signal Weak: No audio in queue.";
        await interaction.reply({ content: status, ephemeral: true });
    }

    if (interaction.commandName === 'now-playing') {
        if (!queue) return interaction.reply({ content: "❌ No transmission active.", ephemeral: true });
        
        const song = queue.songs[0];
        await interaction.reply({ 
            content: `🎵 **Currently Broadcasting:** ${song.name}\n🔗 [SoundCloud Link](${song.url})`, 
            ephemeral: true 
        });
    }
});

async function startMultiBroadcast() {
    try {
        const playlist = await distube.handler.resolve(BUMPER_PLAYLIST);
        if (playlist && playlist.songs) {
            cachedBumpers = playlist.songs;
            console.log(`🎙️  Bumpers Loaded: ${cachedBumpers.length}`);
        }
    } catch (e) { console.error("Bumper Cache Error:", e.message); }

    client.guilds.cache.forEach(async (guild) => {
        const voiceChannel = guild.channels.cache.find(c => c.name === TARGET_VC_NAME && c.type === 2);
        const textChannel = guild.channels.cache.find(c => c.name === TARGET_NP_CHANNEL);
        
        if (voiceChannel) {
            console.log(`📡 Signal Locked: [${guild.name}] - Pushing Sovereign Handshake...`);
            igniteStream(voiceChannel, textChannel, guild);
        }
    });
}

async function igniteStream(voiceChannel, textChannel, guild, attempt = 1) {
    try {
        await distube.play(voiceChannel, SOUNDCLOUD_PLAYLIST, {
            member: guild.members.me,
            textChannel: textChannel || null,
            skip: true
        });

        const queue = distube.getQueue(guild.id);
        if (queue) {
            await queue.shuffle();
            queue.setRepeatMode(2); 
            console.log(`✅ Transmission Stable in [${guild.name}] (Attempt ${attempt})`);
        }
    } catch (err) {
        if (err.message.includes('VOICE_CONNECT_FAILED') && attempt < 5) {
            setTimeout(() => igniteStream(voiceChannel, textChannel, guild, attempt + 1), 5000);
        }
    }
}

// --- TICKER LOGIC ---
distube.on('playSong', async (queue, song) => {
    const isBumper = song.url.includes('nexp-fm-station-ids');
    const guild = queue.voiceChannel.guild;

    client.user.setActivity(song.name, { type: ActivityType.Listening });

    const npChannel = guild.channels.cache.find(c => c.name === TARGET_NP_CHANNEL);
    if (npChannel) {
        try {
            const messages = await npChannel.messages.fetch({ limit: 10 });
            const botMsgs = messages.filter(m => m.author.id === client.user.id);
            if (botMsgs.size > 0) await npChannel.bulkDelete(botMsgs).catch(() => null);

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setLabel('🎧 Listen').setStyle(ButtonStyle.Link).setURL(`https://discord.com/channels/${guild.id}/${queue.voiceChannel.id}`),
                new ButtonBuilder().setLabel('🎵 Playlist').setStyle(ButtonStyle.Link).setURL(SOUNDCLOUD_PLAYLIST)
            );

            const header = isBumper ? `**† NËXP.FM STATION ID †**` : `**† NËXP.FM † Forbidden Audio**`;
            await npChannel.send({ 
                content: `${header}\nNow Playing: **${song.name}**\n*Broadcasting from the Nebula Hub*`, 
                components: [row] 
            });
        } catch (err) { console.error(`Ticker Error:`, err.message); }
    }
});

distube.on('finishSong', async (queue, song) => {
    const isBumper = song.url.includes('nexp-fm-station-ids');
    if (!isBumper) {
        songCounter++;
        if (songCounter >= nextBumperAt && cachedBumpers.length > 0) {
            songCounter = 0;
            nextBumperAt = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
            const randomBumper = cachedBumpers[Math.floor(Math.random() * cachedBumpers.length)];
            queue.songs.splice(1, 0, randomBumper);
        }
    }
});

client.login(TOKEN);
