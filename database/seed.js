const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'NOT FOUND');

const hospitalData = require('./hospitalData.json');

const hospitalSchema = new mongoose.Schema({
  name: String,
  status: String,
  capacity: Number,
  latitude: Number,
  longitude: Number,
  region: String,
  medicineSupply: Number,
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 120000,
      socketTimeoutMS: 120000,
      connectTimeoutMS: 120000,
    });

    console.log('MongoDB Connected!');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Inserting hospitals...');
    await Hospital.insertMany(hospitalData, { ordered: false });
    console.log(`Seeded ${hospitalData.length} hospitals successfully! ✓`);

    await mongoose.connection.close();
    console.log('Done');
    process.exit(0);

  } catch (err) {
    if (err.code === 11000) {
      console.log('Some hospitals already exist — skipping duplicates');
      console.log('Seeding complete');
      process.exit(0);
    }
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();