const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/execute', (req, res) => {
    const { code, language } = req.body;
    
    // 1. Safety Check (Basic)
    if (!code) return res.status(400).json({ output: "No code provided" });

    // 2. Write code to a temp file (e.g., temp.py)
    // In production, use unique IDs for filenames to support multiple users
    const filename = 'temp_script.py'; 
    const filePath = path.join(__dirname, filename);
    
    fs.writeFileSync(filePath, code);

    // 3. THE MAGIC: Run code inside a Docker container
    // We mount the current folder (-v) so the container can see the file
    // We use python:alpine because it's tiny and fast
    const dockerCommand = `docker run --rm -v "${__dirname}:/app" -w /app python:3.9-alpine python ${filename}`;

    console.log(`Executing: ${dockerCommand}`);

    exec(dockerCommand, { timeout: 5000 }, (error, stdout, stderr) => {
        // Cleanup: Delete the file after running
        fs.unlinkSync(filePath);

        if (error) {
            // If the code crashed or timed out
            console.error(`Error: ${stderr || error.message}`);
            return res.json({ output: stderr || error.message });
        }
        
        // Success
        res.json({ output: stdout });
    });
});

app.listen(5000, () => console.log('Server running on port 5000'));
