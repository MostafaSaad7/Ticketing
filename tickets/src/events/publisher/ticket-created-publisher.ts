import { Publisher, Subjects, TicketCreatedEvent } from '@ms-shared-ticketing/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    readonly subject = Subjects.TicketCreated;
}
