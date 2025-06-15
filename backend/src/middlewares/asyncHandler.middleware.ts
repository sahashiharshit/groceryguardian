
import type { Request, Response, NextFunction, RequestHandler } from "express";
interface AsyncHandlerOptions{
log?:boolean;
onError?:(error:any,req:Request)=>void;

}

export const asyncHandler = (
    fn: (req:Request,res:Response,next:NextFunction)=>Promise<any>,
    options:AsyncHandlerOptions={}
    ):RequestHandler =>{

    return async (req,res,next)=>{
        try {
            await fn(req,res,next);
        } catch (error:any) {
            // Log if enabled
            if (options.log!==false){
                console.error(`[${new Date().toISOString()}] Async Error:`, {
                    message: error.message,
                    stack: error.stack,
                    route:req.originalUrl,
                    method:req.method,
                });
            }
            // Custom hook for error handling (Sentry, Logrocket, etc.)
            if(typeof options.onError === 'function'){
            options.onError(error,req);
                
            }
            next(error); // Pass the error to the next middleware
        }
    
    };
};


