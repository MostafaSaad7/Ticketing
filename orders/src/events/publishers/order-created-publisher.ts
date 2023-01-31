import { Publisher, OrderCreatedEvent, Subjects } from "@ms-shared-ticketing/common";
import { natsWrapper } from "../../nats-wrapper";


export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.orderCreated = Subjects.orderCreated;

}
