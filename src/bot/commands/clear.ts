import { Message } from 'discord.js';
import Command from './command';
import { channels } from '..';

export class Clear implements Command {
  async execute(message: Message) {
    try {
      const channelData = channels.get(message.guildId ? message.guildId : '');
      if (!channelData) {
        return;
      }

      if (channelData.timer) {
        clearTimeout(channelData.timer);
      }

      channelData.queue = [];
      await message.reply('Очередь очищена');
    } catch (error) {
      message.reply((error as Error).message);
    }
  }
}
