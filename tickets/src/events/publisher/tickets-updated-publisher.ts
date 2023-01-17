import { Publisher, Subjects, TicketUpdatedEvent } from '@ms-shared-ticketing/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    readonly subject = Subjects.TicketUpdated;
}
