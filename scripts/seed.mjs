import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('DNS server set failed:', e);
}

import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://davidadeniyi269:AbsJi834%5EeKGYU%40@cluster0.zwijmfw.mongodb.net/palmrise_events?retryWrites=true&w=majority&appName=Cluster0";

const inviteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: '' },
  token: { type: String, required: true, unique: true },
  passcode: { type: String, default: '' },
  category: { type: String, default: 'VIP Guest' },
  used: { type: Boolean, default: false },
  usedAt: { type: Date, default: null },
  maxUses: { type: Number, default: 1 },
  phone: { type: String, default: '' },
  attending: { type: String, enum: ['yes', 'no'], default: 'yes' },
  guestNames: { type: [String], default: [] },
  isAdditionalGuest: { type: Boolean, default: false },
  mainGuestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invite', default: null },
  mainGuestName: { type: String, default: '' },
  rsvpSubmitted: { type: Boolean, default: false },
  section: { type: String, default: 'section1' },
  tableNumber: { type: String, default: '' },
  previousTableNumber: { type: String, default: null },
  tableSwitchedAt: { type: Date, default: null },
  tableSwitchedCycle: { type: String, default: null },
  whatsappStatus: { type: String, default: 'not_sent' },
  createdAt: { type: Date, default: Date.now },
});

const Invite = mongoose.models.Invite || mongoose.model('Invite', inviteSchema);

const SAMPLE_GUESTS = [
  { name: 'Dr. Ngozi Adeleke', phone: '+2348031234567', section: 'section1', tableNumber: '1', maxUses: 2, attending: 'yes', rsvpSubmitted: true },
  { name: 'Engr. Babatunde Balogun', phone: '+2348029876543', section: 'section1', tableNumber: '2', maxUses: 1, attending: 'yes', rsvpSubmitted: true },
  { name: 'Chief Olufemi Davies', phone: '+2348055554321', section: 'section1', tableNumber: '3', maxUses: 2, attending: 'yes', rsvpSubmitted: true },
  { name: 'Mrs. Amina Bello', phone: '+2348091122334', section: 'section2', tableNumber: '4', maxUses: 1, attending: 'yes', rsvpSubmitted: true },
  { name: 'Michael Sterling', phone: '+2348074433221', section: 'section1', tableNumber: '5', maxUses: 1, attending: 'yes', rsvpSubmitted: true },
  { name: 'Senator Chris Oladipo', phone: '+2348123344556', section: 'section1', tableNumber: '7', maxUses: 2, attending: 'yes', rsvpSubmitted: true },
  { name: 'Clara Vance', phone: '+2348187766554', section: 'section1', tableNumber: '13', maxUses: 1, attending: 'yes', rsvpSubmitted: true },
  { name: 'David Adeniyi', phone: '+2348066554433', section: 'section1', tableNumber: '1', maxUses: 2, attending: 'yes', rsvpSubmitted: true, used: true, usedAt: new Date() },
];

async function seed() {
  console.log('Connecting to Palmrise MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected! Checking existing guests...');

  const count = await Invite.countDocuments();
  console.log(`Current guest count in palmrise_events: ${count}`);

  if (count === 0) {
    console.log('Seeding initial Palmrise sample guest list...');
    for (const g of SAMPLE_GUESTS) {
      await Invite.create({
        ...g,
        token: uuidv4(),
      });
    }
    console.log(`Successfully seeded ${SAMPLE_GUESTS.length} guests for Palmrise Event Management System!`);
  } else {
    console.log('Database already contains records. No seeding needed.');
  }

  const all = await Invite.find().limit(5);
  console.log('Sample tokens for testing:');
  all.forEach((inv) => {
    console.log(`- ${inv.name}: /invite/${inv.token}`);
  });

  await mongoose.disconnect();
  console.log('Done!');
}

seed().catch(console.error);
