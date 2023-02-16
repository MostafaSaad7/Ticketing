import { Subjects, Publisher, ExpirationCompleteEvent } from "@ms-shared-ticketing/common";


export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}