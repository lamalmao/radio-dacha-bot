import { config } from 'dotenv';
import client from './db';
import bot from './bot';
import stats from './stats';

config();
(async () => {
  await client.$connect();
  console.log('Подключился к базе данных');

  await bot.login(process.env['DISCORD_TOKEN']);
  console.log('Бот авторизован');

  stats.listen(3000, () => console.log('Сайт со статистикой запущен'));
})();
