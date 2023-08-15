import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  Message,
  blockQuote,
  bold,
  italic
} from 'discord.js';
import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource
} from '@discordjs/voice';
import commands from './commands';
import ytdl from 'ytdl-core';
import client from '../db';

export type Player = ReturnType<typeof createAudioPlayer>;
export type ChannelData = {
  queue: Array<{
    url: string;
    title: string;
    duration: number;
  }>;
  paused: boolean;
  player: AudioPlayer;
  timer?: NodeJS.Timer;
  started?: Date;
  continueFrom?: number;
  playing?: {
    url: string;
    duration: number;
  };
};

function createYTStream(data: ChannelData, player: AudioPlayer) {
  if (!data.playing) {
    return null;
  }

  const stream = ytdl(data.playing.url, {
    filter: 'audioonly',
    quality: 'highestaudio',
    highWaterMark: 1 << 25,
    begin: data.continueFrom ? data.continueFrom + 's' : undefined
  });

  stream.on('error', err => {
    console.log(err.message);

    if (data.started && data.playing) {
      const elapsed = Math.ceil(
        (Date.now() - (data.started ? data.started.getTime() : 0)) / 1000
      );

      data.continueFrom = data.playing.duration - elapsed;
    }

    player.emit('next');
  });

  const resource = createAudioResource(stream);
  return resource;
}

const initPlayer = (message: Message) => {
  const guildId = message.guildId ? message.guildId : '';
  if (guildId !== '' && !channels.has(guildId)) {
    const player = createAudioPlayer();
    console.log(`Created audio player for guild ${guildId}`);

    player.on(AudioPlayerStatus.Idle, () => {
      player.pause();
      message.client.user.setActivity('шортсы', {
        type: ActivityType.Watching
      });
    });

    player.on('next' as AudioPlayerStatus, () => {
      if (bot.voice.adapters.size === 0) {
        return;
      }

      const data = channels.get(guildId);
      if (!data) {
        return;
      }

      if (data.continueFrom) {
        const stream = createYTStream(data, player);
        if (stream) {
          player.play(stream);
        }

        data.continueFrom = undefined;
        return;
      }

      if (data.timer) {
        clearTimeout(data.timer);
      }

      data.started = new Date();

      const track = data.queue.shift();
      if (!track) {
        return;
      }

      data.playing = {
        duration: Math.ceil(track.duration / 1000),
        url: track.url
      };

      const stream = ytdl(track.url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });

      stream.on('error', err => {
        console.log(err.message);

        if (data.started && data.playing) {
          const elapsed = Math.ceil(
            (Date.now() - (data.started ? data.started.getTime() : 0)) / 1000
          );

          data.continueFrom = data.playing.duration - elapsed;
        }

        player.emit('next');
      });

      message.client.user.setActivity(`🎶 ${track.title}`, {
        type: ActivityType.Listening
      });

      message.channel.send({
        content: blockQuote(
          // prettier-ignore
          `Включаю ${bold(track.title)}\n${italic('Следующий: ' + bold(data.queue.length !== 0 ? data.queue[0].title : 'ничего'))}`
        )
      });

      player.stop(true);
      const resource = createAudioResource(stream);
      data.paused = false;
      player.play(resource);
      data.timer = setTimeout(
        () => channelData.player.emit('next'),
        track.duration
      );
    });

    player.on(AudioPlayerStatus.Paused, () => {
      const data = channels.get(guildId);
      if (!data) {
        return;
      }

      data.paused = true;
    });

    const channelData = {
      player,
      queue: [],
      paused: true
    };

    channels.set(guildId, channelData);
  }
};

export const channels = new Map<string, ChannelData>();

const prefix = '!';
const bot = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

bot.on('ready', () => {
  bot.user?.setActivity('шортсы', {
    type: ActivityType.Watching
  });
});

bot.on(Events.MessageCreate, async message => {
  try {
    if (!message.content.startsWith(prefix)) {
      return;
    }

    const commandData = parseCommand(message.content, prefix);
    if (commandData === null) {
      throw new Error('!help - список доступных команд');
    }

    const command = commands.get(commandData.command);
    if (!command) {
      throw new Error('!help - список доступных команд');
    }

    initPlayer(message);

    command.execute(message, commandData);
    client.user
      .upsert({
        where: {
          id: message.author.id
        },
        update: {
          interactions: {
            increment: 1
          }
        },
        create: {
          id: message.author.id,
          username: message.author.username
        }
      })
      .catch(() => null);
  } catch (error) {
    message
      .reply({
        content: (error as Error).message
      })
      .catch(() => null);
  }
});

const parseCommand = (message: string, prefix: string = '!') => {
  const reg = new RegExp(`^\\${prefix}(\\w+)(\\s(.{0,}))?$`, 'i');
  const data = reg.exec(message);

  if (!data) {
    return null;
  }

  let content: string | undefined;
  if (data.length > 2) {
    content = data[2];
  }

  return {
    command: data[1],
    content
  };
};

export default bot;
