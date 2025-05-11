import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
// import { users } from "../users/model";

export const tokenTable = sqliteTable("tokenlist", {
  id: text("id").primaryKey(),
  userId: integer("userid", { mode: "number" }).notNull(),
  refreshToken: text("refreshtoken").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type TokenList = typeof tokenTable.$inferSelect;
export type NewTokenList = typeof tokenTable.$inferInsert;
