import path from 'path';

export const configPath = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/files/config.json') : path.resolve('./config.json');

export const GAME_DIR = process.env.NODE_ENV === 'development'
  ? 'D/Oblivion/'
  : path.resolve('../');
