import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this product.'],
        maxlength: [60, 'Name cannot be more than 60 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price for this product.'],
    },
    stock: {
        type: Number,
        default: 0,
    },
    bagWeight: {
        type: Number,
        required: [true, 'Please provide weight per bag (kg)'],
        default: 50,
    },
    category: {
        type: String,
        required: [true, 'Please provide a category for this product.'],
    },
});

// Force model recompilation if schema changed (for development)
if (mongoose.models.Product) {
    delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
