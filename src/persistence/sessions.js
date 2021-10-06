import sql from 'sql-template-strings';
import {v4 as uuidv4} from 'uuid';
import db from './db.cjs';

export async function create(userId) {
  const id = uuidv4();
  await db.query(sql`
    INSERT INTO sessions (id, user_id)
      VALUES (${id}, ${userId});
    `);
  return id;
}

export async function find(id) {
  const {rows} = await db.query(sql`
    SELECT user_id FROM sessions WHERE id = ${id} LIMIT 1;
    `);
  if (rows.length !== 1) {
    return null;
  }

  const {user_id: userId} = rows[0];
  return {userId};
}

export async function deleteSession(id) {
  await db.query(sql`
    DELETE FROM sessions WHERE id = ${id};
    `);
}
