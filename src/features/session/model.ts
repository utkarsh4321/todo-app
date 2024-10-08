import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
// import { users } from "../users/model";

export const sessionsTable = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  sessionData: text("sessionData").notNull(),
  expires: text("expires").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;
