import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  qty: { type: Number, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, required: true }, // e.g. ORD-20260911-00042
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    studentName: { type: String, required: true },
    rollNo: { type: String, required: true },
    classSection: { type: String, required: true },
    department: { type: String, required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'pending',
    },
    specialInstructions: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
