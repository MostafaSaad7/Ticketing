import Queue from "bull";
import { natsWrapper } from "../nats-wrapper";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";

interface payload {
    orderId: string;
}



const expirationQueue = new Queue<payload>("order:expiration", {
    redis: {
        host: process.env.REDIS_HOST
    }
});


export { expirationQueue };





expirationQueue.process(async (job) => {
    console.log("I want to publish an expiration:complete event for orderId", job.data.orderId);
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    });

}
);
