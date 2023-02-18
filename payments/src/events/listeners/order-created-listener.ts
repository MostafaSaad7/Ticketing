import { Listener, OrderCreatedEvent, Subjects } from '@ms-shared-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/orders';




export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    readonly subject: Subjects.orderCreated = Subjects.orderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            version: data.version,
            userId: data.userId,
            price: data.ticket.price,
            status: data.status
        });
        await order.save();

        msg.ack();
    }
}