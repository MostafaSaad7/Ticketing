import { TicketUpdatedEvent } from "@ms-shared-ticketing/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Message } from "node-nats-streaming";
import e from "express";

const setup = async (version?: number) => {

    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // create and save a ticket
    const ticket = await Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    });
    await ticket.save();
    console.log(ticket);
    // Create a fake data event object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 999,
        userId: global.generateId()
    };


    // Create a fake message object

    //@ts-ignore
    const msg: Message = {

        ack: jest.fn()
    };

    if (version) {
        data.version = version;
    }

    // Return all of this stuff

    return { listener, data, msg, ticket };

}


it('finds, updates, and saves a ticket', async () => {
    // Call the setup function
    const { listener, data, msg, ticket } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);






});

it('acks the message', async () => {

    const { listener, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled();


});

it('does not call ack if the event has a skipped version number', async () => {

    const { listener, data, msg } = await setup(7);

    try {
        await listener.onMessage(data, msg);
    } catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();

});