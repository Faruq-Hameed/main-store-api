import mongoose, { ObjectId, Schema } from "mongoose";

interface IStockTransaction {
    productId: ObjectId;
    quantity: number; // Positive for additions, negative for removals
    transactionType: TransactionType;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    lastUpdatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

enum TransactionType {
    ADDITION = "ADDITION",
    REMOVAL = "REMOVAL",
    ADJUSTMENT = "ADJUSTMENT"
}

const productSchema = new Schema<IStockTransaction>(
    {
        transactionType: {
            type: String,
            enum: TransactionType,
            default:TransactionType.ADDITION,
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },

        quantity: {
            type: Number,
            required: [true, 'Please add availableQuantity count'],
            min: [0, 'availableQuantity must be non-negative']
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
            required: true
        },
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Manager',
            required: true
        },
        notes: {
            type: String,
            default: '',
            maxlength: [100, 'Name cannot be more than 100 characters']
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

//index for improved query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });

export default mongoose.model<IStockTransaction>('StockTransaction', productSchema);