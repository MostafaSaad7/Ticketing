import { Subjects, PaymentCreatedEvent, Publisher } from "@ms-shared-ticketing/common";


export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

