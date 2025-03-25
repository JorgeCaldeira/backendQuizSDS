const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json()); // Parse JSON requests

// Endpoint to save quiz results
app.post("/save-quiz", (req, res) => {
    const { email, score, time } = req.body;

    if (!email || !score || !time) {
        return res.status(400).send("Invalid data.");
    }

    const fileName = `quiz_${new Date().toISOString().split("T")[0]}.csv`;
    const filePath = path.join(__dirname, fileName);

    const row = `${email},${score},${time}\n`;
    fs.appendFile(filePath, row, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error saving data.");
        }

        res.send("Data saved successfully!");
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
