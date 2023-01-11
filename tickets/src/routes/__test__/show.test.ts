import request from "supertest";
import { app } from "../../app";


it('returns a 404 if the ticket is not found', async () => {
    await request(app)
        .get('/api/tickets/123123123')
        .send()
        .expect(404);
});


it('returns the ticket if the ticket is found', async () => {
    let title = 'Hello ';
    let price=12;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title,
            price
        }).expect(201);

  
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()
        .expect(200);
        expect(ticketResponse.body.title).toEqual(title);
        expect(ticketResponse.body.price).toEqual(price);

    });
