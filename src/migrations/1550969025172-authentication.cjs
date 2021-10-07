const db = require('../persistence/db.cjs');

module.exports.up = async function (next) {
  const client = await db.connect();

  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    email text UNIQUE,
    password text
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id uuid PRIMARY KEY,
    user_id uuid REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS keys (
    id uuid PRIMARY KEY,
    key_name text UNIQUE,
    key_value integer NOT NULL
  );
  `);

  await client.query(`
  CREATE INDEX users_email on users (email);

  CREATE INDEX sessions_user on sessions (user_id);

  CREATE INDEX keys_keyname on keys (key_name);
  `);

  await client.release(true);
  next();
};

module.exports.down = async function (next) {
  const client = await db.connect();

  await client.query(`
  DROP TABLE sessions;
  DROP TABLE users;
  `);

  await client.release(true);
  next();
};
