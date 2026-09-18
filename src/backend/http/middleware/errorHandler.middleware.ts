import type { NextFunction, Request, Response } from "express";
import z, { ZodError } from "zod";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors: z.flattenError(err),
    });
    return;
  }
  console.log(err);
  res.status(500).json({
    status: "fail",
    message: `the server didn't behaved correctly`,
  });
}
