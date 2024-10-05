import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodos,
  getTodoWithId,
  updateTodo,
} from "./controller";

export const router = Router();

router.route("/todos").get(getTodos);
router.route("/todo/:id").get(getTodoWithId);
router.route("/todo").post(createTodo);
router.route("/todo/:id").put(updateTodo);
router.route("/todo/:id").delete(deleteTodo);
