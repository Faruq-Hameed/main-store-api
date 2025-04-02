interface Sale {
    items: {
      productId: ObjectId;
      quantity: number;
      priceAtSale: number;
    }[];
    totalAmount: number;
    attendedBy: string | ObjectId;
    lastUpdatedBy?: string | ObjectId;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
  }