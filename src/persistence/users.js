import sql from 'sql-template-strings';
import {v4 as uuidv4} from 'uuid';
import {hash} from 'bcrypt';
import db from './db.cjs';

export async function create(email, password) {
  try {
    const hashedPassword = await hash(password, 10);

    const {rows} = await db.query(sql`
      INSERT INTO users (id, email, password)
        VALUES (${uuidv4()}, ${email}, ${hashedPassword})
        RETURNING id, email;
      `);

    const [user] = rows;
    return user;
  } catch (error) {
    if (error.constraint === 'users_email_key') {
      return null;
    }

    throw error;
  }
}

export async function find(email) {
  const {rows} = await db.query(sql`
    SELECT * FROM users WHERE email=${email} LIMIT 1;
    `);
  return rows[0];
}
