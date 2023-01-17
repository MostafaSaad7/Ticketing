import request from "supertest";
import { app } from '../../app'
import { Ticket } from "../../models/tickets";
import { natsWrapper } from "../../nats-wrapper";


it('has a route handler to listen to /api/tickets for post requests ', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).not.toEqual(404);
}
);

it('can only be accessed if user is signed in ', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({});

    expect(response.status).toEqual(401);
});

it('returns a status other than 401 if user is signed in ', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({});
    expect(response.status).not.toEqual(401);
}
);

it('returns an error if an invalid title is provided', async () => {

    await request(app).post('/api/tickets').
        set('Cookie', global.signin()).
        send({
            title: '',
            price: 10
        }).expect(400);

    await request(app).post('/api/tickets').
        set('Cookie', global.signin()).
        send({
            price: 10
        }).expect(400);

});

it('returns an error if an invalid price is provided ', async () => {
    await request(app).post('/api/tickets').
        set('Cookie', global.signin())
        .send({
            title: 'asdasd',
            price: -10
        }).expect(400);

    await request(app).post('/api/tickets').set('Cookie', global.signin())
        .send({
            title: 'asdasd'
        }).expect(400);
});



it('Create tickets with a valid inputs ', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    // let title='ManUtd Vs RealMadrid '

    await request(app).
        post('/api/tickets').
        set('Cookie', global.signin()).
        send({
            title: 'my ticket',
            price: 10,
        })
        .expect(201);

    tickets = await Ticket.find({});


});

it('publishes an event ', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);
    // let title='ManUtd Vs RealMadrid '

    await request(app).
        post('/api/tickets').
        set('Cookie', global.signin()).
        send({
            title: 'my ticket',
            price: 10,
        })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

});
