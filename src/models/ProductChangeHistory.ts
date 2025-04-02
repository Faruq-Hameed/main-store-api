import mongoose, { Schema, Types } from "mongoose";
import { IProduct } from "./Product";

export interface IProductChangeHistory {
  productId: mongoose.Types.ObjectId;
  previousState: Partial<IProduct>;
  newState: Partial<IProduct>;
  changeType: ProductChangeType ;//type of change made to the product
  notes?: string;
  updatedBy: string | mongoose.Types.ObjectId;
  updatedAt: Date;
}

enum ProductChangeType {
  STATUS_CHANGE='status_change',
  OTHER_UPDATES='other_update'
  // NAME= 'name',
  // DESCRIPTION= 'description',
  // PRICE= 'price',
  // CATEGORY= 'category',
  // IMAGEURL= 'imageURL',
  // STATUS= 'status',
}
const ProductChangeHistorySchema = new Schema<IProductChangeHistory>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  previousState: { //product document before the current state
    type: Schema.Types.Mixed,// type: Object,
    required: true,
  },
  newState: {
    type: Schema.Types.Mixed,// type: Object, //product document state after this new update
    required: true,
  },
  changeType: {
    type: String,
    enum: ProductChangeType,
    default: ProductChangeType.STATUS_CHANGE,
    required: true,
  },
  notes: { type: String, default: '' }, //  notes about the change can be recorded.
  updatedBy: { //who made the change
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Manager',
    required: true
  },
}, {
  timestamps: true
}
);

// Create the model
export default mongoose.model<IProductChangeHistory>('ProductChangeHistory', ProductChangeHistorySchema);
