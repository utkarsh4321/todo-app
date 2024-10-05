import { httpStatusCodes } from "./baseErrorHandler";

export class ApiResponseHandler {
  constructor(
    public message: string,
    public data: any = null,
    public statusCode: 200 | 201 = 200,
    public success: boolean = true
  ) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.success = success;
  }
}

export class api200ResponseHandler extends ApiResponseHandler {
  constructor(
    public message = "ok",
    public data: any = null,
    public statusCode: 200 = httpStatusCodes.OK,
    public success: boolean = true
  ) {
    super(message, statusCode, data, success);
  }
}
export class api201ResponseHandler extends ApiResponseHandler {
  constructor(
    public message = "created",
    public data: any = null,
    public statusCode: 201 = httpStatusCodes.CREATED,
    public success: boolean = true
  ) {
    super(message, statusCode, data, success);
  }
}
