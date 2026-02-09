import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['sale', 'rent'], required: true },
  propertyType: { type: String, enum: ['house', 'apartment', 'condo', 'land'], required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  area: { type: Number, required: true },
  location: {
    city: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  images: [String],
  amenities: [String],
  contact: {
    name: String,
    email: String,
    phone: String
  },
  status: { type: String, enum: ['available', 'sold', 'rented'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Property = mongoose.model('Property', propertySchema);
export default Property;