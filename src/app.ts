import express from "express";
import { logger } from "./utility/logger";
import morgan from "morgan";
import {
  custom404Handler,
  isOperationalError,
  returnError,
} from "./utility/baseErrorHandler";
import cookieParser from "cookie-parser";
import { configureSession, jwtMiddleware } from "./middleware/requestValidator";
import cors from "cors";

// import session from "express-session";
// import sqliteStore from "better-sqlite3-session-store";
// import Database from "better-sqlite3";

const morganFormat = ":method :url :status :response-time ms";
const baseApiPath = process.env.BASE_API_PATH;
// const SqliteStores = sqliteStore(session);
// const db = new Database("todo.db", { verbose: console.log });
// declare module "express-session" {
//   interface SessionData {
//     userId: number;
//   }
// }
declare module "express" {
  interface Request {
    customSession?: {
      addSession: (id: number) => Promise<string | undefined>;
      destory: (sessionId: string) => void;
      clearCookies: (sessionId: string) => void;
      startInterval: () => void;
      userId?: number | null;
    };
    // jwtService?: {
    //   createToken: <T>(payload: T, expireTime: number) => string;
    //   verifyToken: (token: string) => JwtPayload | string | null;
    //   saveToken: (
    //     token: string,
    //     userId: string
    //   ) => Promise<{ tokenId: number } | null>;
    //   deleteToken: (sessionId: string) => void;
    //   getToken: (tokenId: number) => Promise<string | null>;
    // };
    userId?: number | null;
  }
}
export const app = express();
// define all middlewares
// express-session middleware
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET!,
//     resave: false,
//     store: new SqliteStores({
//       client: db,
//       expired: {
//         clear: true,
//         intervalMs: 900000, //ms = 15min
//       },
//     }),
//     saveUninitialized: true,
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 1,
//       httpOnly: true,
//     },
//   })
// );
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:8080",
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(cookieParser(process.env.SESSION_SECRET));
// custom session middleware
// app.use(configureSession);
// jwt middleware
app.use(jwtMiddleware);

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
import { JwtPayload } from "jsonwebtoken";

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
