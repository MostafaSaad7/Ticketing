import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@ms-shared-ticketing/common';
import { body } from 'express-validator';

const router = express.Router();

router.post('/api/orders', requireAuth,
    [
        body('ticketId')
        .not()
        .isEmpty()
        .withMessage('TicketId must be provided')
    ]
    , validateRequest, (req: Request, res: Response) => {
        res.send('Hi there');
    });


export { router as newOrderRouter };

