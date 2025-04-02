import mongoose, { Document, Schema } from 'mongoose';

export enum ProductStatus {
  ACTIVE = 'active', //can be stocked and sold
  ARCHIVED = 'archived', //already archived cannot be sold qty ca be zero or any positive number
  DELETED = 'deleted', //Deleted and cannot be stocked or archived qty must be zero
}
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  availableQuantity: number; //stock quantity
  imageUrl?: string;
  status: ProductStatus;
  createdBy: mongoose.Types.ObjectId;
  lastUpdatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      lowercase: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
      lowercase: true,
    },
    availableQuantity: {
      type: Number,
      required: [true, 'Please add availableQuantity count'],
      min: [0, 'availableQuantity must be non-negative'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ProductStatus,
      default: ProductStatus.ACTIVE,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//index for improved query performance
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ status: 1 });

export default mongoose.model<IProduct>('Product', productSchema);
