import { OrderCancelledEvent, Subjects, Listener } from "@ms-shared-ticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/orders";
import { OrderStatus } from "@ms-shared-ticketing/common";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

    readonly subject: Subjects.orderCancelled = Subjects.orderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        });

        if (!order) {
            throw new Error('Order not found');
        }

        order.set({ status: OrderStatus.Cancelled });
        await order.save();

        msg.ack();
    }


}