import { Listener, OrderCreatedEvent, Subjects } from '@ms-shared-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';




export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.orderCreated = Subjects.orderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        await expirationQueue.add({
            orderId: data.id
        });
        msg.ack();


    }
}