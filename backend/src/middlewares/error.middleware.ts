
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/asyncHandler.middleware.js";

export const globalErrorHandler = (err:any, req:Request, res:Response, next:NextFunction):void => {

    const statusCode = err.statusCode || 500;
    const code = err.code || 'INTERNAL_SERVER_ERROR';
    res.status(statusCode).json({
        sucess:false,
        code,
        message: err.message || 'Internal Server Error',
        details: err.details || undefined,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};