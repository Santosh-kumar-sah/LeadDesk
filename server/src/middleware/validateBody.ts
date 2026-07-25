import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string[]> = {};
        err.errors.forEach((e) => {
          const path = e.path.join(".");
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(e.message);
        });

        res.status(400).json({
          error: {
            message: "Validation failed",
            fields: fieldErrors,
          },
        });
        return;
      }
      next(err);
    }
  };
};
