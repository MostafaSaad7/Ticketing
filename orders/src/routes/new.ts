import express, { Request, Response } from 'express';
import { BadRequestError, NotFoundError, OrderStatus, requireAuth, validateRequest } from '@ms-shared-ticketing/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';


const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post('/api/orders', requireAuth,
    [
        body('ticketId')
            .not()
            .isEmpty()
            .withMessage('TicketId must be provided')
    ]
    , validateRequest, async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(ticketId);

        // If no ticket, throw an error
        if (!ticket) {
            throw new NotFoundError();
        }

        // make sure that this ticket is not already reserved
        // Run query to look at all orders. Find an order where the ticket
        // is the ticket we just found *and* the orders status is *not* cancelled.
        // If we find an order from that means the ticket *is* reserved
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }


        // Calculate an expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);


        // Build the order and save it to the database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });
        await order.save();


        // Publish an event saying that an order was created



        res.status(201).send(order);
    });


export { router as newOrderRouter };

