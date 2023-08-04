import app from 'express';
import client from './db';
import path from 'path';

const stats = app();

stats.set('view engine', 'pug');

stats.get('/favicon.ico', (_, res) => {
  try {
    res.sendFile(path.resolve('logo.ico'));
  } catch {
    null;
  }
});

stats.get('/stats', async (_, res) => {
  try {
    const tracks = await client.video.findMany({
      orderBy: {
        plays: 'desc'
      }
    });
    res.render('index', {
      tracks
    });
  } catch (error) {
    console.log((error as Error).message);
    res.statusCode = 500;
    res.end('Something went wrong');
  }
});

export default stats;
