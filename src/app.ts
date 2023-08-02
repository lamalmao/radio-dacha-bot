import { config } from 'dotenv';
import client from './db';
import bot from './bot';

config();
(async () => {
  await client.$connect();
  console.log('Подключился к базе данных');

  await bot.login(process.env['DISCORD_TOKEN']);
  console.log('Бот авторизован');
})();
