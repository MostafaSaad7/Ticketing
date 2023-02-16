import { Listener, OrderCreatedEvent, Subjects } from '@ms-shared-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';




export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.orderCreated = Subjects.orderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
        console.log(new Date(data.expiresAt).getTime());
        console.log('the delay is:', delay);
        console.log("Waiting this many milliseconds to process the job:", delay);
        await expirationQueue.add({
            orderId: data.id
        }
            // }, {
            //     delay
            // }
        );
        msg.ack();


    }
}