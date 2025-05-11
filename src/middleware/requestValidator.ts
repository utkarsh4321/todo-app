import type { NextFunction, Request, Response } from "express";
import { SessionStore } from "../services/auth/session/session";
import { tokenService } from "../services/auth/jwt/jwtService";

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
  sessionConfigurer = new SessionStore();
  req.customSession = sessionConfigurer;
  if (req.signedCookies && req.signedCookies?.mysession) {
    // check the session table and set req.customSession.userId
    sessionConfigurer.getSession(req.signedCookies.mysession).then((userId) => {
      if (userId && userId?.length > 0) {
        const [{ expires, sessionData }] = userId;
        const userData = JSON.parse(sessionData);
        const currentTime = new Date().getTime() - new Date(expires).getTime();
        if (req.customSession) {
          if (currentTime > sessionConfigurer.expireTime) {
            // remove session from db set req.customSession.userID to null

            req.customSession.userId = null;
            sessionConfigurer.destory(req.signedCookies.mysession);
            res.clearCookie("mysession");
          } else {
            req.customSession.userId = userData.userId;
          }
        }
      }
      next();
    });
  } else {
    next();
  }
};

// middleware to handle the JWT token

export const jwtValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;
  if (token) {
    const decodedToken = tokenService.verifyToken(token);
    if (decodedToken) {
      console.log("my user have token");
    }
    return next();
  } else {
    return res.status(401).json({
      message: "unauthorized access",
      success: false,
    });
  }
};
