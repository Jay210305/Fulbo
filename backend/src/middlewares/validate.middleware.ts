import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodSchema, ZodIssue } from 'zod';

/**
 * Validation targets - specify which parts of the request to validate
 */
export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Formatted validation error for frontend consumption
 */
interface ValidationErrorResponse {
  message: string;
  errors: {
    field: string;
    message: string;
    code: string;
  }[];
}

/**
 * Format Zod errors into a structured response
 */
const formatZodError = (error: ZodError): ValidationErrorResponse => {
  return {
    message: 'Error de validación',
    errors: error.issues.map((issue: ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    })),
  };
};

/**
 * Validate middleware factory
 * Creates a middleware that validates req.body, req.query, and/or req.params
 * against the provided Zod schemas
 * 
 * @example
 * // Validate only body
 * router.post('/users', validate({ body: createUserSchema }), controller.create);
 * 
 * // Validate body and params
 * router.put('/users/:id', validate({ 
 *   params: z.object({ id: z.string().uuid() }),
 *   body: updateUserSchema 
 * }), controller.update);
 * 
 * // Validate query parameters
 * router.get('/search', validate({ query: searchQuerySchema }), controller.search);
 */
export const validate = (schemas: ValidationSchemas) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate each target if schema is provided
      if (schemas.params) {
        const validated = await schemas.params.parseAsync(req.params);
        Object.assign(req.params, validated);
      }

      if (schemas.query) {
        const validated = await schemas.query.parseAsync(req.query);
        Object.assign(req.query, validated);
      }

      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(formatZodError(error));
        return;
      }

      // Unexpected error
      console.error('Validation middleware error:', error);
      res.status(500).json({ message: 'Error interno de validación' });
    }
  };
};

/**
 * Shorthand for validating only req.body
 */
export const validateBody = (schema: ZodSchema) => validate({ body: schema });

/**
 * Shorthand for validating only req.query
 */
export const validateQuery = (schema: ZodSchema) => validate({ query: schema });

/**
 * Shorthand for validating only req.params
 */
export const validateParams = (schema: ZodSchema) => validate({ params: schema });
