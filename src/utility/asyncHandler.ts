import type { NextFunction, Request, Response } from "express";

export const asyncHandler =
  (
    resHandler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<never>
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(resHandler(req, res, next)).catch((err) => next(err));
  };

export const tAsyncHandler =
  <T>(
    resHandler: (req: Request, res: Response, next: NextFunction) => Promise<T>
  ) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await resHandler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
