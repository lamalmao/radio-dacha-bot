import { Message, blockQuote, bold, italic } from 'discord.js';
import Command, { CommandData } from './command';
import { channels } from '..';
import { getVideo, getVideoDataWithDuration } from '../../search';
import client from '../../db';
import { joinVoiceChannel } from '@discordjs/voice';

const processYTVideo = async (url: string) => {
  try {
    const data = await getVideoDataWithDuration(url);
    if (data === null) {
      return null;
    }

    await client.video.upsert({
      where: {
        id: data.id
      },
      update: {
        plays: {
          increment: 1
        }
      },
      create: {
        id: data.id,
        description: data.description,
        title: data.title,
        duration: data.duration
      }
    });

    return data;
  } catch {
    return null;
  }
};

export class AddAudio implements Command {
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
        throw new Error('Укажите поисковый запрос или ссылку на видео');
      }

      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        throw new Error('Не могу подключиться');
      }

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      });

      const url = await getVideo(data.content);
      if (!url) {
        throw new Error('Ничего не найдено по запросу');
      }

      const videoData = await processYTVideo(url);
      if (!videoData) {
        throw new Error('Не получилось найти видео');
      }

      const position = channelData.queue.push({
        url,
        title: videoData.title,
        duration: videoData.duration
      });

      await message.channel.send({
        //prettier-ignore
        content: blockQuote(`Добавил ${bold(videoData.title)} в очередь\n${italic('Позиция в очереди: ' + position)}`)
      });

      connection.subscribe(channelData.player);

      if (channelData.paused) {
        channelData.player.emit('next');
      }
    } catch (error) {
      message.reply((error as Error).message);
    }
  }
}
