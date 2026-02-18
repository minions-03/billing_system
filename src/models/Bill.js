import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema({
    billNumber: {
        type: Number,
        unique: true,
        required: true
    },
    customerName: {
        type: String,
        required: [true, 'Please provide a customer name.'],
    },
    customerPhone: String,
    customerAddress: String,
    customerType: {
        type: String,
        enum: ['RETAILER', 'WHOLESALER'],
        default: 'RETAILER'
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            productName: String, // Store name in case product is deleted
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Force recompile model to ensure new fields are picked up
if (mongoose.models.Bill) {
    delete mongoose.models.Bill;
}

export default mongoose.model('Bill', BillSchema);
