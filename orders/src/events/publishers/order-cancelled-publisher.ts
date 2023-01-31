import { Publisher, OrderCancelledEvent, Subjects } from "@ms-shared-ticketing/common";


export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.orderCancelled = Subjects.orderCancelled;

}
