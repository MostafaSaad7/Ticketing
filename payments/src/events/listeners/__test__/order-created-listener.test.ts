import { OrderCreatedEvent, OrderStatus } from '@ms-shared-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/orders';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        id: global.generateId(),
        version: 0,
        status: OrderStatus.Created,
        userId: global.generateId(),
        expiresAt: '',
        ticket: {
            id: '',
            price: 1212
        }
    };


    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };


    return { listener, data, msg };

}


it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);

    expect(order!.price).toEqual(data.ticket.price);
});


it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const order = await Order.findById(data.id);
    expect(msg.ack).toHaveBeenCalled();


});
