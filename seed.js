import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Property from './src/models/Property.js';

dotenv.config();

const users = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'seller',
    phone: '1234567890',
    bio: 'Experienced real estate agent'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'user',
    phone: '0987654321'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    phone: '5555555555'
  }
];

const properties = [
  {
    title: 'Modern Downtown Apartment',
    description: 'Beautiful 2-bedroom apartment in the heart of downtown with stunning city views. Features include modern kitchen, spacious living room, and balcony.',
    price: 250000,
    type: 'sale',
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    location: {
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      coordinates: {
        lat: 40.7128,
        lng: -74.0060
      }
    },
    features: ['Modern Kitchen', 'Balcony', 'Central AC'],
    amenities: ['Gym', 'Pool', 'Parking'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
        publicId: 'property1'
      }
    ],
    yearBuilt: 2020,
    parking: 1
  },
  {
    title: 'Luxury Beach House',
    description: 'Stunning beachfront property with private access to the beach. Perfect for a vacation home or permanent residence.',
    price: 3500,
    type: 'rent',
    propertyType: 'house',
    bedrooms: 4,
    bathrooms: 3,
    area: 2800,
    location: {
      address: '456 Ocean Dr',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      country: 'USA',
      coordinates: {
        lat: 25.7617,
        lng: -80.1918
      }
    },
    features: ['Ocean View', 'Private Beach Access', 'Swimming Pool'],
    amenities: ['Beach Access', 'Pool', 'Garden', 'BBQ Area'],
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233',
        publicId: 'property2'
      }
    ],
    yearBuilt: 2015,
    parking: 2
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} users created`);

    // Add seller to properties
    const seller = createdUsers.find(user => user.role === 'seller');
    const propertiesWithSeller = properties.map(prop => ({
      ...prop,
      seller: seller._id
    }));

    // Create properties
    const createdProperties = await Property.create(propertiesWithSeller);
    console.log(`${createdProperties.length} properties created`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();