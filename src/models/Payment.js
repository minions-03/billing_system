import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Please provide a company name.'],
    },
    amount: {
        type: Number,
        default: 0,   // 0 = blank cheque, amount to be filled later
        min: 0,
    },
    paymentMode: {
        type: String,
        enum: ['ONLINE', 'CHEQUE', 'CASH', 'NEFT', 'RTGS', 'UPI'],
        default: 'ONLINE',
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED'],
        default: 'COMPLETED',   // PENDING = blank cheque / amount not yet known
    },
    referenceNo: {
        type: String,
        default: '',
    },
    note: {
        type: String,
        default: '',
    },
    date: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

if (mongoose.models.Payment) {
    delete mongoose.models.Payment;
}

export default mongoose.model('Payment', PaymentSchema);
