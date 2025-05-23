"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
//const express = require("express");
const cors = require("cors"); // Import the CORS package
const fs = require("fs");
const path = require("path");
const AWS = require("aws-sdk");
const { D1Database } = require("@cloudflare/d1");
require("dotenv").config();
const app = (0, express_1.default)();
app.use(cors()); // Enable CORS for all routes
app.use(express_1.default.json()); // Middleware to parse JSON data
const db = new D1Database(process.env.D1_DATABASE_URL);
// Root route for testing
app.get("/", (req, res) => {
    res.send("Backend is up and running!");
});
// Endpoint to save quiz results
app.post("/save-quiz", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, score, time } = req.body;
    if (!email || typeof score !== "number" || typeof time !== "number") {
        res.status(400).send("Invalid data.");
        return;
    }
    const sqlQuery = `
    INSERT INTO quiz_diario_sds (email, score, time)
    VALUES (?, ?, ?);
`;
    try {
        yield db.prepare(sqlQuery).bind(email, score, time).run();
        console.log("Data saved successfully!");
        res.status(200).send("Data saved successfully!");
    }
    catch (err) {
        console.error("Error saving data to D1 database:", err);
        res.status(500).send("Failed to save data.");
    }
    /* fileName = `quiz_${new Date().toISOString().split("T")[0]}.csv`;
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
    });*/
}));
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
/*const s3 = new AWS.S3({
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
};*/
