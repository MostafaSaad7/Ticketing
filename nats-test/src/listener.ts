import nats,{Message} from 'node-nats-streaming';
import {randomBytes} from 'crypto';

console.clear();

const clientId=randomBytes(4).toString('hex');

const stan=nats.connect('ticketing',clientId,{
    url:'http://localhost:4222'
});


stan.on('connect',()=>{
    console.log('Listener connected to NATS');
    const subscription=stan.subscribe('ticket:created','orders-service-queue-group'); // subscribe to channel (topic) ticket:created
    subscription.on('message',(msg:Message)=>{
        console.log('Message received');
        console.log(`Received event # ${msg.getSequence()} with message data: ${msg.getData()}`);
    });
});