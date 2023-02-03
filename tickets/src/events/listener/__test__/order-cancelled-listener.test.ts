import { OrderCancelledEvent, OrderStatus, Listener } from '@ms-shared-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/tickets';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {

    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = global.generateId();
    const ticket = Ticket.build({
        title: 'concert',
        price: 20,
        userId: global.generateId()
    });

    ticket.set({ orderId });

    await ticket.save();

    // Create a fake data event
    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };




    return { listener, data, msg, ticket, orderId };


}


it('updates the ticket, publishes an event, and acks the message', async () => {

    const { listener, data, msg, ticket, orderId } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
    expect(msg.ack).toHaveBeenCalled();
    expect(natsWrapper.client.publish).toHaveBeenCalled();



});

