import { Subjects } from "./subjects";
import { OrderStatus } from "./types/order-status";



export interface OrderCancelledEvent {
    subject: Subjects.orderCancelled;
    data: {
        id: string;
        version: number;
        ticket: {
            id: string;
        };
    };
}
