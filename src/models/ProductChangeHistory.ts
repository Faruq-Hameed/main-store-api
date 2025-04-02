import mongoose, { Schema, Types } from 'mongoose';
import { IProduct } from './Product';

export interface IProductChangeHistory {
  productId: mongoose.Types.ObjectId;
  previousState: Partial<IProduct>;
  newState: Partial<IProduct>;
  updatedBy: string | mongoose.Types.ObjectId;
  updatedAt: Date;
}

const ProductChangeHistorySchema = new Schema<IProductChangeHistory>(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    previousState: {
      //product document before the current state
      type: Schema.Types.Mixed, // type: Object,
      required: true,
    },
    newState: {
      type: Schema.Types.Mixed, // type: Object, //product document state after this new update
      required: true,
    },
    updatedBy: {
      //who made the change
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create the model
export default mongoose.model<IProductChangeHistory>(
  'ProductChangeHistory',
  ProductChangeHistorySchema,
);
