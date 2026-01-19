import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const token = sqliteTable('token', {
  token: text('token').primaryKey(),
  hash: text('hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }).notNull(),
  discordToken: text('discord_token').notNull(),
  discordExpiresIn: integer('discord_expires_in').notNull(),
  discordUserId: text('discord_user_id').notNull()
});
