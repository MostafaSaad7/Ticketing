import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';


it('fetches the order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    // Create a user
    const user = global.signin();

    // Create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another user\'s order', async () => {
    // Create a ticket
    const ticket = Ticket.build({
        id: global.generateId(),
        title: 'concert',
        price: 20
    });
    await ticket.save();

    // Create a user
    const user = global.signin();

    // Create an order
    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    // Fetch the order
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signin())
        .send()
        .expect(401);
});
