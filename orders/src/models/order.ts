import mongoose from "mongoose";
import { OrderStatus } from "@ms-shared-ticketing/common";
import { TicketDoc } from "./ticket";


export { OrderStatus };
interface OrderAttrs {
    // version: number;
    userId: string;
    // price: number;
    status: OrderStatus;
    ticket: TicketDoc;
    expiresAt: Date;
}

interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    // price: number;
    status: OrderStatus;
    ticket: TicketDoc;
    expiresAt: Date;

}

interface OrderModel extends mongoose.Model<OrderDoc> {

    build(attrs: OrderAttrs): OrderDoc;

}


const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
},
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    });

orderSchema.set('versionKey', 'version');
// // orderSchema.pre('save', function (done) {
// //     // @ts-ignore
// //     this.$where = {
// //         version: this.get('version') - 1
// //     };
// //     done();
// // });


orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
