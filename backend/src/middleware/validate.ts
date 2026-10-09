import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export function validate(schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Overwrite with parsed (strips unknown keys).
      (req as any)[source] = parsed;
      next();
    } catch (e) {
      next(e);
    }
  };
}