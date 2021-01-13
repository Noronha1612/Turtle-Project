import path from 'path';

export default {
  client: 'pg',
  connection: process.env.NODE_ENV === "test" ? process.env.TEST_DB_URL : process.env.DB_URL,
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations')
  },
  seeds: {
    directory: path.resolve(__dirname, 'src', 'database', 'seeds')
  }
};
