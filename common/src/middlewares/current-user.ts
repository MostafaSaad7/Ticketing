import { Request,Response,NextFunction} from "express";
import jwt from 'jsonwebtoken';

interface UserPayload{
    id: string;
    email: string;
}

// Augmenting existing types with new properties or methods 
declare global{
    namespace Express{
        interface Request{
            currentUser?: UserPayload;
        }
    }
}
 

export const currentUser = (req:Request, res:Response, next:NextFunction) => {
    if(!req.session?.jwt){ // if there is no session or no jwt
        return next();
    }
    try{
        const payload = jwt.verify(req.session!.jwt, process.env.JWT_KEY!) as UserPayload;
        req.currentUser = payload;
    }
    catch(err){}
    next();
}
