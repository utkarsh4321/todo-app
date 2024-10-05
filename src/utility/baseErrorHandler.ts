import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";

export enum httpStatusCodes {
  OK = 200,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL_SERVER = 500,
  CREATED = 201,
}

export class BaseError extends Error {
  constructor(
    public message: string,
    public statusCode: httpStatusCodes,
    public isOperational: boolean,
    public success: boolean
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = success;
    Error.captureStackTrace(this);
  }
}

export class api404errorhandler extends BaseError {
  constructor(
    public message: string,
    public statusCode = httpStatusCodes.NOT_FOUND,
    public isOperational: boolean = true,
    public success: boolean = false
  ) {
    super(message, statusCode, isOperational, success);
  }
}
export class api500errorhandler extends BaseError {
  constructor(
    public message: string = "Something went wrong",
    public statusCode = httpStatusCodes.INTERNAL_SERVER,
    public isOperational: boolean = true,
    public success: boolean = false
  ) {
    super(message, statusCode, isOperational, success);
  }
}
export class api400errorhandler extends BaseError {
  constructor(
    public message: string,
    public statusCode = httpStatusCodes.BAD_REQUEST,
    public isOperational: boolean = true,
    public success: boolean = false
  ) {
    super(message, statusCode, isOperational, success);
  }
}
export function isOperationalError(error: Error) {
  if (error instanceof BaseError) {
    return error.isOperational;
  }
  return false;
}
export function returnError(
  err: BaseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(err.statusCode || 500).json({
    message: err.message,
    statusCode: err.statusCode,
    success: err.success,
  });
  next(err);
}

export function logError(
  err: BaseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(err.stack);
  next(err);
}
export function custom404Handler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return res.status(404).json({
    ...new api404errorhandler("incorrect end point"),
  });
}
