import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      mongoose.set('bufferCommands', false);
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to provided MongoDB.');
    } else {
      console.log('No MONGODB_URI provided. Starting in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      mongoose.set('bufferCommands', false);
      console.log('Connected to In-Memory MongoDB Server.');
      
      // Seed initial data if needed
      await seedDatabase();
    }
  } catch (error) {
    console.error('Database connection error:', error);
  }
};

async function seedDatabase() {
  const { Expert } = await import('./models/Expert');
  
  const count = await Expert.countDocuments();
  if (count === 0) {
    console.log("Seeding initial experts...");
    
    // Generate dates for slots (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format YYYY-MM-DD manually
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date1 = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const date2 = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    
    await Expert.create([
      {
        name: "Dr. Shreyash Jokare",
        category: "Software Engineering",
        experience: 12,
        rating: 4.9,
        availableSlots: [
          { date: date1, slots: ["09:00 AM", "11:00 AM", "02:00 PM"] },
          { date: date2, slots: ["10:00 AM", "01:00 PM", "03:00 PM"] }
        ]
      },
      {
        name: "Pratik Johnson",
        category: "Product Management",
        experience: 8,
        rating: 4.7,
        availableSlots: [
          { date: date1, slots: ["10:00 AM", "01:00 PM"] },
          { date: date2, slots: ["09:00 AM", "11:00 AM", "04:00 PM"] }
        ]
      },
      {
        name: "Ashish David",
        category: "Design",
        experience: 6,
        rating: 4.8,
        availableSlots: [
          { date: date1, slots: ["11:00 AM", "02:00 PM", "05:00 PM"] },
          { date: date2, slots: ["09:00 AM", "01:00 PM"] }
        ]
      }
    ]);
    console.log("Seeded database with experts!");
  }
}
