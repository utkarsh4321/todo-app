import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";
import { users } from "../users/model";

export const todos = sqliteTable("todos", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  todoText: text("todoText").notNull(),
  todoStatus: text("todoStatus").default("pending"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  userId: integer("user_id").references(() => users.id),
});

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
