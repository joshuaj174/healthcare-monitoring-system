const Hospital = require('../models/Hospital');
const Alert = require('../models/Alert');
const { sendCriticalAlert, sendLowMedicineAlert } = require('./emailService');

const runSimulation = () => {
  setInterval(async () => {
    try {
      const hospitals = await Hospital.find();
      for (const hospital of hospitals) {
        const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
        hospital.capacity = Math.max(0, Math.min(100, hospital.capacity + change));

        const medChange = Math.floor(Math.random() * 11) - 5;
        hospital.medicineSupply = Math.max(0, Math.min(100, hospital.medicineSupply + medChange));

        const wasCritical = hospital.status === 'Critical';
        hospital.status = hospital.capacity > 80 ? 'Critical' : 'Normal';

        if (hospital.status === 'Critical' && !wasCritical) {
          await Alert.create({
            message: `${hospital.name} has reached critical capacity (${hospital.capacity}%)`,
            hospitalId: hospital._id,
            type: 'capacity',
          });
           sendCriticalAlert(hospital._id);
        }
        if (hospital.medicineSupply < 20) {
          await Alert.create({
            message: `${hospital.name} has low medicine supply (${hospital.medicineSupply}%)`,
            hospitalId: hospital._id,
            type: 'medicine',
          });
           sendLowMedicineAlert(hospital._id);
        }

        await hospital.save();
      }
      console.log('Simulation tick complete:', new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Simulation error:', err.message);
    }
  }, 5000);
};

module.exports = { runSimulation };