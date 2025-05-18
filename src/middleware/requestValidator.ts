import type { NextFunction, Request, Response } from "express";
import { SessionStore } from "../services/auth/session/session";
import { tokenService } from "../services/auth/jwt/jwtService";
import { JwtPayload } from "jsonwebtoken";

export const requestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.signedCookies?.refresh_token);
  if (req?.userId) {
    return next();
  } else {
    return res.status(401).json({
      message: "unauthorized access",
      success: false,
    });
  }
  // if (req.customSession && req.customSession.userId) {
  //   return next();
  // } else {
  //   return res.status(401).json({
  //     message: "unauthorized access",
  //     success: false,
  //   });
  // }
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

export const jwtMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies?.access_token;
  if (token) {
    const decodedToken = tokenService.verifyToken(token);
    if (decodedToken && typeof decodedToken !== "string" && decodedToken?.exp) {
      const currenTime = Math.floor(Date.now() / 1000);
      if (currenTime < decodedToken?.exp) {
        req.userId = decodedToken.userId;
      }
    }
    return next();
  } else {
    next();
    // return res.status(401).json({
    //   message: "unauthorized access",
    //   success: false,
    // });
  }
};
