
import type { Request, Response, NextFunction, RequestHandler } from "express";
interface AsyncHandlerOptions {
    log?: boolean;
    onError?: (error: any, req: Request) => void;
}

export class AppError extends Error {
    statusCode: number;
    code?: string;
    details?: any;

    constructor(message: string, statusCode = 500, code?: string, details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>,
    options: AsyncHandlerOptions = {}
): RequestHandler => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error: any) {
                        //Optional Logging
            if (options.log !== false) {
                console.error(`[${new Date().toISOString()}] Async Error:`, {
                    message: error.message,
                    stack: error.stack,
                    route: req.originalUrl,
                    method: req.method,
                });
            }
            // Custom hook for error handling (Sentry, Logrocket, etc.)
            if (typeof options.onError === 'function') {
                      options.onError(error, req);

            }
            next(error instanceof Error? error: new AppError("Unknown error", 500)); // Pass the error to the next middleware
        }

    };
};


