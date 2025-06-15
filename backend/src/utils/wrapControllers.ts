

import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import type { Request,Response, NextFunction } from "express";

type AnyAsyncHandler = (req:Request,res:Response,next:NextFunction)=>any;
type ControllerModule = Record<string,AnyAsyncHandler>;

export const wrapControllers = <T extends ControllerModule>(controllerModule:T):T=>{

const wrapped: Partial<T> ={};

for(const key in controllerModule){
    const handler = controllerModule[key];
    
    
    if(typeof handler ==="function"){
    wrapped[key] = asyncHandler(handler) as T[typeof key];
    }

}
return wrapped as T;


};