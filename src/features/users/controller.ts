import { eq, sql } from "drizzle-orm";
import {
  api200ResponseHandler,
  api201ResponseHandler,
} from "../../utility/apiResponseHandler";
import { tAsyncHandler } from "../../utility/asyncHandler";
import { api400errorhandler } from "../../utility/baseErrorHandler";
import { User, users } from "./model";
import { db } from "../../db/db";
import { comparePassword, hashPassword, insertUser } from "./userDbMethods";

export const registerUser = tAsyncHandler(async (req, res, next) => {
  const { email, password, name }: User = req.body;
  if (!email || !password || !name) {
    throw new api400errorhandler("name, email and password is required");
  }
  const storedUser = await (
    await db
      .select()
      .from(users)
      .where(sql`${users.email} = ${email} or ${users.name} = ${name}`)
  ).at(0);
  if (
    storedUser &&
    typeof storedUser == "object" &&
    Object.keys(storedUser).length > 0
  ) {
    console.log(storedUser);
    throw new api400errorhandler("user already present");
  } else {
    const hashedPassword = await hashPassword(password);
    if (typeof hashedPassword === "string") {
      const insertedUser = await insertUser({
        email,
        name,
        password: hashedPassword,
      });
      console.log(insertedUser, "User inserted in DB");
      if (insertedUser && insertedUser.length > 0)
        return res.status(201).json({
          ...new api201ResponseHandler("user created successfully", []),
        });
    }
  }
});

export const loginUser = tAsyncHandler(async (req, res, next) => {
  const { email, password }: User = req.body;
  if (!email || !password) {
    throw new api400errorhandler("email and password required");
  }
  const storedUser = (
    await db.select().from(users).where(eq(users.email, email))
  ).at(0);
  if (
    storedUser &&
    typeof storedUser === "object" &&
    Object.keys(storedUser).length > 0
  ) {
    const isPasswordCorrect = await comparePassword(
      password,
      storedUser.password
    );
    if (isPasswordCorrect) {
      req.session.userId = storedUser.id;
      return res.status(200).json({
        ...new api200ResponseHandler("login successfully", {
          userId: storedUser.id,
        }),
      });
    } else {
      return res.status(401).json({
        message: "Invalid email or password.",
        success: false,
      });
    }
  } else {
    return res.status(401).json({
      message: "Invalid email or password.",
      success: false,
    });
  }
});
