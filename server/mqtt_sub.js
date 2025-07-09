const mqtt = require("mqtt");
const pool = require("./db");
const { createServer } = require("http");
const client = mqtt.connect("mqtt://localhost:1883");
const socketIo = require("socket.io");

const topic = "gps/track";

const httpServer = createServer();

const io = socketIo(httpServer, {
  cors: {
    origin: "*", // Allow all origins for simplicity
    methods: ["GET", "POST"]
  },
});

httpServer.listen(5000, () => {
  console.log("🚀 Socket.IO server running on port 5000");
});

client.on("connect", () => {
    console.log("Connected to MQTT broker");
    client.subscribe(topic, (err) => {
        if (!err) {
            console.log(`Subscribe to topic: ${topic}`);
        } else {
            console.error(`Failed to subscribe to topic: ${topic}`, err.message);
        }
    })
});

client.on("message", async (topic, message) => {
    try {
    const payload = JSON.parse(message.toString());
    const { lat, lon, animal_id } = payload;

    if (!lat || !lon || !animal_id) {
      console.warn("Missing data:", payload);
      return;
    }

    const sql = `
      INSERT INTO location (animal_id, geom)
      VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))
    `;

    await pool.query(sql, [animal_id, lon, lat]); // Note: lon first, then lat
   
    console.log("✅ Inserted GPS location into PostGIS");
    
    io.emit("gps_data", {
      animal_id,
      lat,
      lon,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Error handling message:", err.message);
  }
});