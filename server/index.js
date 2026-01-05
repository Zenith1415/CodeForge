const express = require('express');
const http = require('http'); // New
const { Server } = require("socket.io"); // New
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Create a robust HTTP server to handle WebSockets
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Allow your React Client
        methods: ["GET", "POST"]
    }
});

// 1. Socket.io Logic (The "Multiplayer" Part)
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // 1. Join a specific room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // 2. Broadcast only to that room
    socket.on('code-change', ({ roomId, code }) => {
        // .to(roomId) limits the message to that specific room
        socket.to(roomId).emit('code-update', code);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected');
    });
});

// 2. Docker Execution Logic (Your existing code)
app.post('/execute', (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ output: "No code provided" });

    const filename = `temp_${Date.now()}.py`; 
    const filePath = path.join(__dirname, filename);

    fs.writeFileSync(filePath, code);

    const dockerCommand = `docker run --rm -v "${__dirname}:/app" -w /app python:3.9-alpine python ${filename}`;

    exec(dockerCommand, { timeout: 5000 }, (error, stdout, stderr) => {
        try { fs.unlinkSync(filePath); } catch (e) {} // Clean up
        if (error) return res.json({ output: stderr || error.message });
        res.json({ output: stdout });
    });
});

// Start the SERVER (not just app)
server.listen(5000, () => console.log('Server running on port 5000'));