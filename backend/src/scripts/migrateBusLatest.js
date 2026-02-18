// Run with: node src/scripts/migrateBusLatest.js
require("dotenv").config();
const connectDB = require("../../db");
const mongoose = require("mongoose");
const BusLatest = require("../../models/BusLatest");

async function migrate() {
  await connectDB();

  console.log("Starting migration: backfilling location and creating indexes...");

  // Backfill location for docs missing it
  const cursor = BusLatest.find({ $or: [{ location: { $exists: false } }, { location: null }] })
    .cursor();

  let count = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      const lat = Number(doc.lat);
      const lng = Number(doc.lng);
      doc.location = { type: "Point", coordinates: [lng, lat] };
      await doc.save();
      count++;
    } catch (e) {
      console.error("Failed to migrate doc", doc && doc._id, e);
    }
  }
  console.log(`Backfilled location for ${count} documents.`);

  // Ensure indexes
  try {
    await BusLatest.collection.createIndex({ location: "2dsphere" });
    await BusLatest.collection.createIndex({ timestamp: 1 }, { expireAfterSeconds: 600 });
    console.log("Indexes created: 2dsphere(location), TTL(timestamp:600s)");
  } catch (e) {
    console.error("Index creation failed", e);
  }

  console.log("Migration complete.");
  mongoose.connection.close();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});