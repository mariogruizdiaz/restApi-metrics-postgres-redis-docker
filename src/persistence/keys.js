import sql from 'sql-template-strings';
import {v4 as uuidv4} from 'uuid';
import db from './db.cjs';

export async function create(key, value) {
  const id = uuidv4();
  await db.query(sql`
    INSERT INTO keys (id, key_name, key_value)
      VALUES (${id}, ${key}, ${value});
    `);
  return id;
}

export async function createOrUpdate(key, value) {
    const id = uuidv4();
    await db.query(sql`
      INSERT INTO keys (id, key_name, key_value)
        VALUES (${id}, ${key}, ${value})
        ON CONFLICT (key_name) 
        DO 
            UPDATE SET key_value = ${value};
      `);
    return id;
  }

export async function find(key) {
  const {rows} = await db.query(sql`
    SELECT key_value FROM keys WHERE key_name = ${key} LIMIT 1;
    `);
  if (rows.length !== 1) {
    return null;
  }

  const {key_value} = rows[0];
  return key_value;
}

export async function deleteKey(id) {
  await db.query(sql`
    DELETE FROM keys WHERE id = ${id};
    `);
}

export function keyExpirationHandler(channel, expiredKey, value) {
    console.log(`The key '${expiredKey}' with the value ${value} expired!`);
    createOrUpdate(expiredKey, value);
}
