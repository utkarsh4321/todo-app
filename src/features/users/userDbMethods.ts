import { compare, hash } from "bcrypt";
import { db } from "../../db/db";
import { NewUser, users } from "./model";

export const hashPassword = async (password: string) => {
  return await hash(password, 10);
};

export const getAllUser = async () => {
  return await db.select().from(users);
};

export const insertUser = async (userData: NewUser) => {
  return await db.insert(users).values(userData).returning({
    insertedId: users.id,
  });
};
export const comparePassword = async (
  password: string,
  passwordHash: string
) => {
  return await compare(password, passwordHash);
};
