
import { Listener } from "./base-listener";
import { Message } from "node-nats-streaming";
export class TicketCreatedListener extends Listener {
    subject: string = 'ticket:created';
    queueGroupName: string = 'payments-service';

    onMessage(data: any, msg: Message): void {
        console.log(`Received event # ${msg.getSequence()} with message data `);
        console.log(data);

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