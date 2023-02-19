export enum Subjects {
    // Ticekt service events
    TicketCreated = 'ticket:created',
    TicketUpdated = 'ticket:updated',

    // Order service events
    orderCreated = 'order:created',
    orderCancelled = 'order:cancelled',

    // Expiration service events
    ExpirationComplete = 'expiration:complete',

    // Payment service events
    PaymentCreated = 'payment:created',


}