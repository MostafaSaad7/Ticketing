import nats,{Message} from 'node-nats-streaming';
import {randomBytes} from 'crypto';

console.clear();

const clientId=randomBytes(4).toString('hex');

const stan=nats.connect('ticketing',clientId,{
    url:'http://localhost:4222'
});

stan.on('close',()=>{ // close event
    console.log('NATS connection closed');
    process.exit();
});

const subscriptionOptions=stan.subscriptionOptions()
.setManualAckMode(true) // set manual ack mode
.setDeliverAllAvailable()
.setDurableName('order-service'); 

stan.on('connect',()=>{
    console.log('Listener connected to NATS');
    const subscription=stan.subscribe('ticket:created','queue-group', subscriptionOptions); // subscribe to channel (topic) ticket:created
    subscription.on('message',(msg:Message)=>{
        console.log('Message received');
        console.log(`Received event # ${msg.getSequence()} with message data: ${msg.getData()}`);
        msg.ack(); // ack the message
    });
});

process.on('SIGINT',()=>stan.close());
process.on('SIGTERM',()=>stan.close());
