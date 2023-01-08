import express from 'express';
import { Request, Response } from 'express';
import  Jwt from 'jsonwebtoken';

const router = express.Router();

router.get('/api/users/currentuser', (req:Request, res:Response) => {
  if(!req.session?.jwt){ // if there is no session or no jwt
   res.send({currentUser: null});
  }
  try{
    const payload = Jwt.verify(req.session!.jwt, process.env.JWT_KEY!);
    res.send({currentUser: payload});
  }
  catch(err){
    res.send({currentUser: null});
  }
});

export { router as currentUserRouter };
