import nats, { Message, Stan } from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener'
console.clear();

const clientId = randomBytes(4).toString('hex');

const stan = nats.connect('ticketing', clientId, {
    url: 'http://localhost:4222'
});

stan.on('close', () => { // close event
    console.log('NATS connection closed');
    process.exit();
});

stan.on('connect', () => {
    console.log('Listener connected to NATS');
    new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());


