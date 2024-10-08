import type { NextFunction, Request, Response } from "express";
import { SessionStore } from "../features/session/session";

export const requestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.customSession && req.customSession.userId) {
    return next();
  } else {
    return res.status(401).json({
      message: "unauthorized access",
      success: false,
    });
  }
};

export const configureSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let sessionConfigurer;
  if (!req.customSession) {
    sessionConfigurer = new SessionStore();
    req.customSession = sessionConfigurer;
  } else if (sessionConfigurer) {
    if (req.signedCookies && req.signedCookies?.mysession) {
      // check the session table and set req.customSession.userId
    } else {
      // remove session from db set req.customSession.userID to null
    }
  }
  next();
};
