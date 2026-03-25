import { pool } from "../db/pool.js";

export const chatRepository = {
  async listChatsByUserId(userId) {
    const query = `
      select id, user_id, category, title, created_at
      from chats
      where user_id = $1
      order by created_at desc
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async createChat({ userId, title, category }) {
    const query = `
      insert into chats (user_id, title, category)
      values ($1, $2, $3)
      returning id, user_id, title, category, created_at
    `;

    const result = await pool.query(query, [userId, title, category]);
    return result.rows[0];
  },

  async findChatById(chatId) {
    const query = `
      select id, user_id, title, category, created_at
      from chats
      where id = $1
      limit 1
    `;

    const result = await pool.query(query, [chatId]);
    return result.rows[0] ?? null;
  },

  async listMessages(chatId) {
    const query = `
      select id, chat_id, role, content, created_at
      from messages
      where chat_id = $1
      order by created_at asc
    `;

    const result = await pool.query(query, [chatId]);
    return result.rows;
  },

  async createMessage({ chatId, role, content }) {
    const query = `
      insert into messages (chat_id, role, content)
      values ($1, $2, $3)
      returning id, chat_id, role, content, created_at
    `;

    const result = await pool.query(query, [chatId, role, content]);
    return result.rows[0];
  }
};

