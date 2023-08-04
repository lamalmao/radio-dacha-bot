import {
  Message,
  bold,
  italic,
  underscore,
  hyperlink,
  blockQuote
} from 'discord.js';
import Command from './command';
import client from '../../db';

export class Top implements Command {
  async execute(message: Message) {
    try {
      const tracks = await client.video.findMany({
        select: {
          title: true,
          id: true,
          plays: true
        },
        orderBy: {
          plays: 'desc'
        },
        take: 5
      });

      const fullStatsLink = `http://${process.env['HOST']}/stats`;

      let msg = underscore('Топ 5 видео по популярности:\n\n') as string;
      tracks.forEach((track, index) => {
        msg = msg.concat(
          // prettier-ignore
          `${index + 1}. ${italic(track.title ? track.title : 'Unknown')} - ${bold(track.plays.toString())};\n`
        );
      });
      msg = msg.concat(
        '\n',
        bold(underscore(hyperlink('Все треки', fullStatsLink)))
      );

      await message.channel.send({
        content: blockQuote(msg)
      });
    } catch (error) {
      message.reply((error as Error).message);
    }
  }
}
