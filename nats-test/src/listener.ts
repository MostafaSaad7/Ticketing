import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';

console.clear();

const clientId = randomBytes(4).toString('hex');

const stan = nats.connect('ticketing', clientId, {
    url: 'http://localhost:4222'
});

stan.on('close', () => { // close event
    console.log('NATS connection closed');
    process.exit();
});

// const subscriptionOptions = stan.subscriptionOptions()
//     .setManualAckMode(true) // set manual ack mode
//     .setDeliverAllAvailable()
//     .setDurableName('order-service');

stan.on('connect', () => {
    console.log('Listener connected to NATS');
    // const subscription = stan.subscribe('ticket:created', 'queue-group', subscriptionOptions); // subscribe to channel (topic) ticket:created
    // subscription.on('message', (msg: Message) => {
    //     console.log('Message received');
    //     console.log(`Received event # ${msg.getSequence()} with message data: ${msg.getData()}`);
    //     msg.ack(); // ack the message
    // });

    new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

abstract class Listener {

    private client: Stan;
    abstract subject: string;
    abstract queueGroupName: string;
    abstract onMessage(data: any, msg: Message): void;
    protected ackWait: number = 5 * 1000;
    constructor(client: Stan) {
        this.client = client;

    }

    subscriptionOption() {

        return this.client.subscriptionOptions().
            setDeliverAllAvailable().
            setManualAckMode(true).setAckWait(this.ackWait).
            setDurableName(this.queueGroupName);
    }


    listen() {

        const subscription = this.client.subscribe(
            this.subject,
            this.queueGroupName,
            this.subscriptionOption()
        );

        subscription.on('message', (msg: Message) => {
            console.log(`Message Received ${this.subject}/ ${this.queueGroupName}`);
            // console.log(`Received event # ${msg.getSequence()} with message data: ${msg.getData()}`);
            const parsedData = this.parseMessage(msg);
            this.onMessage(parsedData, msg); // inversion of control  
        });


    }

    parseMessage(msg: Message) {
        const data = msg.getData();
        return typeof data === 'string' ? JSON.parse(data) : JSON.parse(data.toString('utf-8'))

    }


}

class TicketCreatedListener extends Listener {
    subject: string = 'ticket:created';
    queueGroupName: string = 'payments-service';

    onMessage(data: any, msg: Message): void {
        console.log(`Received event # ${msg.getSequence()} with message data: ${msg.getData()}`);

        msg.ack(); // ack the message

    }

    // constructor(client: Stan, subject?: string, queueGroupName?: string) {
    //     super(client);
    //     if (subject)
    //         this.subject = subject;
    //     if (queueGroupName)
    //         this.queueGroupName = queueGroupName;
    // }

}