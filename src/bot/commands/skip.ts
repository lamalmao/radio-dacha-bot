import { Message } from 'discord.js';
import Command from './command';
import { channels } from '..';

export class SkipMusic implements Command {
  async execute(message: Message) {
    try {
      const channelData = channels.get(message.guildId ? message.guildId : '');
      if (!channelData) {
        return;
      }

      channelData.player.emit('next');
    } catch (error) {
      message.reply((error as Error).message);
    }
  }
}
