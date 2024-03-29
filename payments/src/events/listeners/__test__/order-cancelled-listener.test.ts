import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderStatus, OrderCancelledEvent } from "@ms-shared-ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../../models/orders";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: global.generateId(),
        version: 0,
        userId: global.generateId(),
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();



    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        // version: order.version+1,
        version: 1,
        ticket: {
            id: global.generateId(),
        }

    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };


    return { listener, data, msg, order };
};


it('updates the status of the order', async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);


});

it('acks the message', async () => {
    const { listener, data, msg, order } = await setup();
    await listener.onMessage(data, msg);
    const updatedOrder = await Order.findById(order.id);
    expect(msg.ack).toHaveBeenCalled();
});