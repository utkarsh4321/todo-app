import { sql } from "drizzle-orm";
import { db } from "../../db/db";
import {
  api200ResponseHandler,
  api201ResponseHandler,
} from "../../utility/apiResponseHandler";
import { tAsyncHandler } from "../../utility/asyncHandler";
import { NewTodo, Todo, todos } from "./model";
import {
  api400errorhandler,
  api404errorhandler,
} from "../../utility/baseErrorHandler";

export const getTodos = tAsyncHandler(async (req, res, next) => {
  const allTodos = await db
    .select()
    .from(todos)
    .where(sql`${todos.userId} = ${req.session.userId}`);
  if (allTodos)
    return res.status(200).json({
      ...new api200ResponseHandler(undefined, allTodos),
    });
});

export const createTodo = tAsyncHandler(async (req, res, next) => {
  const { todoText }: NewTodo = req.body;
  if (!todoText) {
    throw new api400errorhandler("todo is required");
  }
  const insertedTodo = await db
    .insert(todos)
    .values({ todoText, userId: req.session.userId })
    .returning();
  console.log(insertedTodo, "todo inserted");
  if (insertedTodo)
    return res.status(201).json({
      ...new api201ResponseHandler("todo created successfully", insertedTodo),
    });
});

export const getTodoWithId = tAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) throw new api400errorhandler("todo is required");

  const todo = await db
    .select()
    .from(todos)
    .where(
      sql`${todos.userId} = ${req.session.userId} and ${todos.id} = ${id}`
    );
  if (todo.length > 0)
    return res.status(200).json({
      ...new api200ResponseHandler(undefined, todo),
    });
  else {
    return res.status(404).json({
      ...new api404errorhandler("todo not found with provided todo id"),
    });
  }
});

export const updateTodo = tAsyncHandler(async (req, res, nex) => {
  const { id } = req.params;
  const { todoText, todoStatus }: NewTodo = req.body;
  //   if (!id) throw new api400errorhandler("todo id is required");
  const updatedTodoData = await db
    .update(todos)
    .set({ todoStatus: todoStatus, todoText: todoText })
    .where(sql`${todos.id} = ${id} and ${todos.userId} = ${req.session.userId}`)
    .returning();
  if (updatedTodoData?.length > 0)
    return res.status(201).json({
      ...new api201ResponseHandler(undefined, updatedTodoData),
    });
  else {
    return res.status(404).json({
      ...new api404errorhandler("todo not found with that id"),
    });
  }
});
export const deleteTodo = tAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const todoData = await db
    .delete(todos)
    .where(sql`${todos.id} = ${id} and ${todos.userId} = ${req.session.userId}`)
    .returning({ todoId: todos.id });
  console.log(todoData);
  if (todoData.length > 0) {
    return res.status(200).json({
      ...new api200ResponseHandler(undefined),
    });
  } else {
    return res.status(404).json({
      ...new api404errorhandler("todo not found with provided todo id"),
    });
  }
});
