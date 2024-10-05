import type { NextFunction, Request, Response } from "express";

export const requestValidator = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({
      message: "unauthorized access",
      success: false,
    });
  }
};
