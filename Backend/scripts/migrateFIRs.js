const mongoose = require('mongoose');
const FIR = require('../models/FIR');

const MONGO_URL = 'mongodb://127.0.0.1:27017/fir_system';

const migrateFIRs = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Get all FIRs
    const firs = await FIR.find({}).sort({ createdAt: 1 });
    console.log(`Found ${firs.length} FIRs`);

    // Print current state
    console.log('\nCurrent state of FIRs:');
    firs.forEach(fir => {
      console.log({
        id: fir._id,
        firNumber: fir.firNumber,
        complainantName: fir.complainantName,
        createdAt: fir.createdAt
      });
    });

    // Update FIRs without firNumber
    let count = 0;
    for (const fir of firs) {
      if (!fir.firNumber) {
        const currentYear = new Date(fir.createdAt).getFullYear();
        const number = (count + 1).toString().padStart(3, '0');
        const firNumber = `FIR${currentYear}${number}`;
        
        await FIR.findByIdAndUpdate(fir._id, { 
          $set: { firNumber: firNumber }
        });
        
        console.log(`Updated FIR ${fir._id} with number ${firNumber}`);
        count++;
      }
    }

    // Verify updates
    const updatedFirs = await FIR.find({}).sort({ createdAt: 1 });
    console.log('\nVerifying updates...');
    updatedFirs.forEach(fir => {
      console.log({
        id: fir._id,
        firNumber: fir.firNumber,
        complainantName: fir.complainantName,
        createdAt: fir.createdAt
      });
    });

    console.log(`\nMigration completed. Updated ${count} FIRs`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('Migration error:', error);
    await mongoose.connection.close();
  }
};

migrateFIRs();
