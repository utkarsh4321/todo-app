// All features schema
import { todos } from "../features/todos/model";
import { users } from "../features/users/model";
import { sessionsTable } from "../features/session/model";

// Export all schemas
export { users, todos, sessionsTable };

// export const users = sqliteTable('users', {
//     id: integer('id',{mode:'number'}).primaryKey({autoIncrement:true}),
//     name:text('name').notNull(),
//     email:text('email').notNull(),
//     password:text('password').notNull(),
//     createdAt:text('created_at').default(sql`(CURRENT_TIMESTAMP)`)
//   });

// export const todos = sqliteTable('todos', {
//     id: integer('id',{mode:'number'}).primaryKey({autoIncrement:true}),
//     todoText:text('todoText').notNull(),
//     todoStatus:text('todoStatus').default('pending'),
//     createdAt:text('created_at').default(sql`(CURRENT_TIMESTAMP)`)
//   });

// export type User = typeof users.$inferSelect;
// export type NewUser = typeof users.$inferInsert;

// export type Todo = typeof todos.$inferSelect;
// export type NewTodo = typeof todos.$inferInsert;
