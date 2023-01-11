import { requireAuth } from '@ms-shared-ticketing/common';
import express ,{Request,Response} from 'express';

const router = express.Router();


router.post('/api/tickets',requireAuth,(req:Request,res:Response)=>{
    res.status(201).send({});
});


export {router as createTicketRouter};