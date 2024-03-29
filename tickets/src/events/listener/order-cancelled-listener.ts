import { Listener, OrderCancelledEvent, Subjects } from '@ms-shared-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/tickets';
import { TicketUpdatedPublisher } from '../publisher/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

    subject: Subjects.orderCancelled = Subjects.orderCancelled;
    queueGroupName = queueGroupName;


    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {

        // Find the ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);


        // If no ticket, throw error
        if (!ticket) {
            throw new Error('Ticket not found');
        }

        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({ orderId: undefined });


        // Save the ticket
        await ticket.save();

        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });


        // ack the message
        msg.ack();

    }


}
