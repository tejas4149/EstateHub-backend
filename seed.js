import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './models/Property.js';

dotenv.config();

const sampleProperties = [
  {
    title: "Modern Downtown Apartment",
    description: "Beautiful 2-bedroom apartment in the heart of downtown with stunning city views.",
    price: 250000,
    type: "sale",
    propertyType: "apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    location: {
      city: "New York",
      address: "123 Main St, NYC"
    },
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
    amenities: ["Pool", "Gym", "Parking"],
    status: "available"
  },
  {
    title: "Luxury Beach House",
    description: "Stunning beachfront property with private access to the beach.",
    price: 1500,
    type: "rent",
    propertyType: "house",
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    location: {
      city: "Miami",
      address: "456 Ocean Dr, Miami"
    },
    images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w-800"],
    amenities: ["Beach Access", "Pool", "Garden"],
    status: "available"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Property.deleteMany({});
    await Property.insertMany(sampleProperties);
    console.log('Sample data added!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();