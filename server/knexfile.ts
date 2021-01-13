import path from 'path';
import { config } from 'dotenv';

config({
  path: process.env.NODE_ENV === 'test'? '.env.test' : '.env'
});

export default {
  client: 'pg',
  connection: process.env.DB_URL,
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations')
  },
  seeds: {
    directory: path.resolve(__dirname, 'src', 'database', 'seeds')
  }
};
