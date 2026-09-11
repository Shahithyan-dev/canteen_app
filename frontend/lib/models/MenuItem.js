import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['snacks', 'meals', 'drinks', 'combos'],
    },
    imageUrl: { type: String, default: '' },
    available: { type: Boolean, default: true },
    rating: { type: Number, default: 4.0, min: 1, max: 5 },
    prepTime: { type: Number, default: 10 }, // minutes
  },
  { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema);
