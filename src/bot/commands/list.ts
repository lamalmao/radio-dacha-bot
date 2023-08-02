import { Message, blockQuote, bold } from 'discord.js';
import Command from './command';
import { channels } from '..';

export class TracksList implements Command {
  async execute(message: Message) {
    try {
      const channelData = channels.get(message.guildId ? message.guildId : '');
      if (!channelData) {
        return;
      }

      if (channelData.queue.length === 0) {
        throw new Error('Очередь пуста');
      }

      let text = '';
      channelData.queue.forEach((item, index) => {
        const seconds = item.duration / 1000;
        const minutes = Math.floor(seconds / 60);
        const residue = seconds - 60 * minutes;

        text = text.concat(
          `${index + 1}. ${bold(item.title)}: ${minutes}:${residue};\n`
        );
      });

      await message.channel.send({
        content: blockQuote(text)
      });
    } catch (error) {
      message.reply((error as Error).message);
    }
  }
}
