
export const asyncHandler = (fn,options={})=>{

    return async (req,res,next)=>{
        try {
            await fn(req,res,next);
        } catch (error) {
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