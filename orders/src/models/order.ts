import { mongoose } from "mongoose";


interface OrderAttrs {
    // version: number;
    userId: string;
    // price: number;
    status: OrderStatus;
    ticket: ticketDoc;
    expiresAt: Date;
}

interface OrderDoc extends mongoose.Document {
    // version: number;
    userId: string;
    // price: number;
    status: OrderStatus;
    ticket: ticketDoc;
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


orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order(attrs);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);
