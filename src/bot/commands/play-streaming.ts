import { Message } from 'discord.js';
import { VoiceConnectionStatus, joinVoiceChannel } from '@discordjs/voice';
import Command, { CommandData } from './command';
import ytdl from 'ytdl-core';
import client from '../../db';
import { channels } from '..';
import { getVideo, getVideoDataWithDuration } from '../../search';

const processYTVideo = async (link: string) => {
  const id = ytdl.getURLVideoID(link);
  const data = await getVideoDataWithDuration(link);

  if (!data) {
    return null;
  }

  await client.video.upsert({
    where: {
      id
    },
    update: {
      plays: {
        increment: 1
      }
    },
    create: {
      id,
      description: data.description,
      title: data.title,
      duration: data.duration
    }
  });

  return data;
};

export class PlayStream implements Command {
  async execute(message: Message, data: CommandData) {
    try {
      if (!message.member || !message.member.voice || !message.guild) {
        throw new Error('Вы должны быть на аудио канале.');
      }

      const channelData = channels.get(message.guildId ? message.guildId : '');
      if (!channelData) {
        return;
      }

      if (!data.content) {
        channelData.player.emit('next');
        return;
      }

      const videoUrl = await getVideo(data.content);
      if (!videoUrl) {
        throw new Error('Ничего не найдено по запросу');
      }

      const videoData = await processYTVideo(videoUrl);
      if (!videoData) {
        throw new Error('Не получилось найти видео');
      }

      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        throw new Error('Не могу подключиться');
      }

      channelData.queue.unshift({
        url: videoUrl,
        title: videoData.title,
        duration: videoData.duration
      });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      connection.on('stateChange', state => {
        if (
          state.status === VoiceConnectionStatus.Destroyed ||
          state.status === VoiceConnectionStatus.Disconnected
        ) {
          channelData.player.emit('next');
        }
      });

      connection.subscribe(channelData.player);
      channelData.player.emit('next');
    } catch (error) {
      message
        .reply({
          content: (error as Error).message
        })
        .catch(() => null);
    }
  }
}
