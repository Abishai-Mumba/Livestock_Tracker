const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost:1883");

const topic = "gps/track";

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

client.on("message", (topic, message) => {
    try {
        // message is Buffer
        const data = JSON.parse(message.toString());
        console.log(`📍 GPS Update: Latitude=${data.lat}, Longitude=${data.lon}`);
    } catch (error) {
        console.error("Error processing message:", error.message);
        
    }
});