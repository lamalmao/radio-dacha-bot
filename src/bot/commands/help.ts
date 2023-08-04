import { Message, blockQuote, bold, italic } from 'discord.js';
import Command from './command';

export class Help implements Command {
  async execute(message: Message) {
    try {
      await message.channel.send({
        // prettier-ignore
        content: blockQuote(`${bold('!play')} - ${italic('Пропускает текущий трек (если есть), добавляет указанный (ссылка на YouTube или поисковый запрос) в начало очереди и включает его. Если ничего не указывать после команды, то бот снимется с паузы')};\n${bold('!add')} - ${italic('добавляет трек в начало очереди, и запускает бота, если тот не играл')};\n${bold('!stop')} - ${italic('Пропускает текущий трек и ставит бота на паузу')};\n${bold('!clear')} - ${italic('очищает очередь')};\n${bold('!list')} - ${italic('Выводит очередь треков')};\n${bold('!top')} - ${italic('выводит топ треков')};\n${bold('!help')} - ${italic('список команд')}`)
      });
    } catch (error) {
      message.reply((error as Error).message);
    }
  }
}
