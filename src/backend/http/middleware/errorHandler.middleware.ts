import type { NextFunction, Request, Response } from "express";
import multer from "multer";
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
      message: "Dados inválidos",
      errors: z.flattenError(err),
    });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
      status: "fail",
      message: err.code === "LIMIT_FILE_SIZE" ? "Imagem maior que 10 MB" : "Upload inválido",
    });
    return;
  }
  console.log(err);
  res.status(500).json({
    status: "fail",
    message: `the server didn't behaved correctly`,
  });
}
