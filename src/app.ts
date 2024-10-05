import express from "express";
import { logger } from "./utility/logger";
import morgan from "morgan";
import {
  custom404Handler,
  isOperationalError,
  returnError,
} from "./utility/baseErrorHandler";
import session from "express-session";
import sqliteStore from "better-sqlite3-session-store";
import Database from "better-sqlite3";

const morganFormat = ":method :url :status :response-time ms";
const baseApiPath = process.env.BASE_API_PATH;
const SqliteStores = sqliteStore(session);
const db = new Database("todo.db", { verbose: console.log });
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}
export const app = express();
// define all middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    store: new SqliteStores({
      client: db,
      expired: {
        clear: true,
        intervalMs: 900000, //ms = 15min
      },
    }),
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 1,
      httpOnly: true,
    },
  })
);
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// // routes import
// import { router as userRouter } from "./features/users/routes";
// import { router as todoRouter } from "./features/todos/routes";

// All route middleware
// app.use(`/${baseApiPath}/user`,userRouter)
// app.use(`${baseApiPath}/todo`,todoRouter)
// app.get('/raka',(req,res,next)=>{
//   res.json({name:'utkarsh'})
// })

import "./masterRoute";

// Error Handler middleware
app.use(returnError);
app.all("*", custom404Handler);
process.on("uncaughtException", (error: Error) => {
  logger.error(error.stack);
  if (!isOperationalError(error)) {
    process.exit(1);
  }
});

process.on("unhandledRejection", (reason) => {
  logger.error(reason);
});
