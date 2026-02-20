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
    // Wholesaler-specific fields
    customerGstin: String,
    customerCst: String,
    customerTin: String,
    hsnCode: String,
    vehicleNo: String,
    supplierRef: String,
    bookNo: String,
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            productName: String,
            hsnCode: String,
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

if (mongoose.models.Bill) {
    delete mongoose.models.Bill;
}

export default mongoose.model('Bill', BillSchema);
