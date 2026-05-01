const nodemailer = require('nodemailer');
const Subscription = require('../models/Subscription');
const Hospital = require('../models/Hospital');

console.log('[Email] EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('[Email] EMAIL_PASS:', process.env.EMAIL_PASS ? 'FOUND' : 'NOT SET');

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[Email] Credentials missing — emails will not be sent');
    return null;
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

const sendCriticalAlert = async (hospitalId) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return;

    const subscriptions = await Subscription.find({ hospitalId });
    if (subscriptions.length === 0) {
      console.log(`[Email] No subscribers for ${hospital.name}`);
      return;
    }

    console.log(`[Email] Sending critical alert for ${hospital.name} to ${subscriptions.length} subscribers`);

    for (const sub of subscriptions) {
      try {
        await transporter.sendMail({
          from: `"Healthcare Monitor" <${process.env.EMAIL_USER}>`,
          to: sub.userEmail,
          subject: `CRITICAL ALERT: ${hospital.name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#dc3545;padding:20px;border-radius:8px 8px 0 0;">
                <h2 style="color:white;margin:0;">Critical Hospital Alert</h2>
              </div>
              <div style="background:#f8f9fa;padding:24px;border-radius:0 0 8px 8px;border:1px solid #dee2e6;">
                <p>Hi ${sub.userName || 'User'},</p>
                <p>A hospital on your watchlist is now CRITICAL:</p>
                <div style="background:white;border-left:4px solid #dc3545;padding:16px;margin:16px 0;border-radius:4px;">
                  <h3 style="color:#dc3545;margin:0 0 8px;">${hospital.name}</h3>
                  <p style="margin:4px 0;"><b>Region:</b> ${hospital.region}</p>
                  <p style="margin:4px 0;"><b>Capacity:</b> ${hospital.capacity}%</p>
                  <p style="margin:4px 0;"><b>Medicine Supply:</b> ${hospital.medicineSupply}%</p>
                </div>
                <p style="color:#6c757d;font-size:13px;">Healthcare Disruption Monitoring System</p>
              </div>
            </div>
          `,
        });
        console.log(`[Email] Sent to ${sub.userEmail}`);
      } catch (sendErr) {
        console.error(`[Email] Failed for ${sub.userEmail}:`, sendErr.message);
      }
    }
  } catch (err) {
    console.error('[Email] sendCriticalAlert error:', err.message);
  }
};

const sendLowMedicineAlert = async (hospitalId) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) return;

    const subscriptions = await Subscription.find({ hospitalId });
    if (subscriptions.length === 0) return;

    for (const sub of subscriptions) {
      try {
        await transporter.sendMail({
          from: `"Healthcare Monitor" <${process.env.EMAIL_USER}>`,
          to: sub.userEmail,
          subject: `LOW MEDICINE SUPPLY: ${hospital.name}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#fd7e14;padding:20px;border-radius:8px 8px 0 0;">
                <h2 style="color:white;margin:0;">Low Medicine Supply Alert</h2>
              </div>
              <div style="background:#f8f9fa;padding:24px;border-radius:0 0 8px 8px;border:1px solid #dee2e6;">
                <p>Hi ${sub.userName || 'User'},</p>
                <p><b>${hospital.name}</b> has critically low medicine supply:</p>
                <div style="background:white;border-left:4px solid #fd7e14;padding:16px;margin:16px 0;border-radius:4px;">
                  <p style="margin:4px 0;"><b>Medicine Supply:</b> <span style="color:#fd7e14;">${hospital.medicineSupply}%</span></p>
                  <p style="margin:4px 0;"><b>Capacity:</b> ${hospital.capacity}%</p>
                  <p style="margin:4px 0;"><b>Region:</b> ${hospital.region}</p>
                </div>
                <p style="color:#6c757d;font-size:13px;">Healthcare Disruption Monitoring System</p>
              </div>
            </div>
          `,
        });
        console.log(`[Email] Medicine alert sent to ${sub.userEmail}`);
      } catch (sendErr) {
        console.error(`[Email] Failed for ${sub.userEmail}:`, sendErr.message);
      }
    }
  } catch (err) {
    console.error('[Email] sendLowMedicineAlert error:', err.message);
  }
};

module.exports = { sendCriticalAlert, sendLowMedicineAlert };