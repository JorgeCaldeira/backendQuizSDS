const express = require("express");
const cors = require("cors"); // Import the CORS package
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
require("dotenv").config();

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON data

// Root route for testing
app.get("/", (req, res) => {
    res.send("Backend is up and running!");
});

// Endpoint to save quiz results
app.post("/save-quiz", (req, res) => {
    const { email, score, time } = req.body;

    if (!email || typeof score !== "number" || typeof time !== "number") {
        return res.status(400).send("Invalid data.");
    }

    const fileName = `quiz_${new Date().toISOString().split("T")[0]}.csv`;
    const filePath = path.join(__dirname, fileName);

    const row = `${email},${score},${time}\n`;

    fs.appendFile(filePath, row, (err) => {
        if (err) {
            console.error("Error writing to CSV file:", err);
            return res.status(500).send("Failed to save data.");
        }
        const fileContent = fs.readFileSync(filePath);
        uploadToR2("quizzes-sds", fileName, fileContent);
        console.log("Data saved successfully!");
        res.status(200).send("Data saved successfully!");
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const s3 = new AWS.S3({
    endpoint: "https://1d5bedc6e06a996c3ca93b5e69f491de.r2.cloudflarestorage.com/quizzes-sds",
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_ID,
});

const uploadToR2 = (bucketName, fileName, fileContent) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
    };
    s3.upload(params, (err, data) => {
        if(err) {
            console.error("Error uploading to R2:", err);
        }else{
            console.log("File uploaded successfully:", data.Location);
        }
    });
};


