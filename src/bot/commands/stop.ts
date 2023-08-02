import { Message } from 'discord.js';
import Command from './command';
import { channels } from '..';
import { AudioPlayerStatus } from '@discordjs/voice';

export class StopMusic implements Command {
  async execute(message: Message) {
    try {
      const channelData = channels.get(message.guildId ? message.guildId : '');
      if (!channelData) {
        return;
      }

      if (channelData.player.state.status === AudioPlayerStatus.Playing) {
        channelData.player.pause(true);
      }
    } catch (error) {
      message.reply((error as Error).message);
    }
  }
}
