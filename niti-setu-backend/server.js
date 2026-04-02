const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
require("dotenv").config();


const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected ✅"))
    .catch(err => console.log(err));

// Farmer Schema
const farmerSchema = new mongoose.Schema({
    // 1. Personal
    name: String,
    mobile: { type: String, unique: true },
    aadhaar: String,
    age: Number,
    gender: String,
    // 2. Agricultural Profile
    landholding: Number,
    landOwnership: String,
    crops: [String],
    irrigation: String,
    // 3. Socio-Economic Details
    category: String,
    incomeRange: String,
    bankAccount: String,
    ifsc: String,
    // 4. Location Details
    state: String,
    district: String,
    block: String,
    village: String,
    // 5. Voice Interaction
    language: String,
    // 6. Security & Consent
    pin: String,
    dataConsent: Boolean
});

const Farmer = mongoose.model("Farmer", farmerSchema);


// ================= SIGN UP =================
app.post("/signup", async (req, res) => {
    try {
        const { 
            name, mobile, aadhaar, age, gender,
            landholding, landOwnership, crops, irrigation,
            category, incomeRange, bankAccount, ifsc,
            state, district, block, village,
            language, pin, dataConsent 
        } = req.body;

        const existingUser = await Farmer.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ message: "Mobile number already registered" });
        }

        const hashedPin = await bcrypt.hash(pin, 10);

        const newFarmer = new Farmer({
            name, mobile, aadhaar, age, gender,
            landholding, landOwnership, crops, irrigation,
            category, incomeRange, bankAccount, ifsc,
            state, district, block, village,
            language, pin: hashedPin, dataConsent
        });

        await newFarmer.save();

        res.json({ message: "Account created successfully" });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
    try {
        const { mobile, pin } = req.body;

        const farmer = await Farmer.findOne({ mobile });
        if (!farmer) {
            return res.status(400).json({ message: "Invalid credentials (Mobile or PIN)" });
        }

        const isMatch = await bcrypt.compare(pin, farmer.pin);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials (Mobile or PIN)" });
        }

        res.json({ message: "Login successful", farmer });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const { MongoClient } = require("mongodb");
const { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");

// MongoDB Atlas Client for Vector Search
const mongoClient = new MongoClient(process.env.MONGO_URI);
let vectorStore;

mongoClient.connect().then(() => {
    const database = mongoClient.db("farmerDB");
    const collection = database.collection("schemes");

    vectorStore = new MongoDBAtlasVectorSearch(
        new GoogleGenerativeAIEmbeddings({
            modelName: "gemini-embedding-001",
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        }),
        {
            collection: collection,
            indexName: "vector_index",
            textKey: "text",
            embeddingKey: "embedding",
        }
    );
    console.log("Vector Store Initialized ✅");
}).catch(err => console.error("Vector Store Error:", err));


// ================= RAG ELIGIBILITY CHECK =================
app.post("/api/check-eligibility", async (req, res) => {
    try {
        const { state, district, landholding, crop, category } = req.body;

        if (!vectorStore) {
            return res.status(500).json({ status: "Error", message: "Vector store not initialized yet." });
        }

        // 1. Construct the search query
        const query = `Eligibility criteria scheme benefits agriculture for farmer in ${state} with ${landholding} hectares farming ${crop} category ${category}`;
        console.log("Retrieving documents for query:", query);

        // 2. Retrieve relevant documents (chunks)
        const retrievedDocs = await vectorStore.similaritySearch(query, 4);
        const contextText = retrievedDocs.map(doc => doc.pageContent).join("\n\n");

        if (!contextText.trim()) {
            return res.json({
                status: "Unknown",
                reason: "No relevant scheme documents found in the database.",
                citation: "None"
            });
        }

        // 3. Generate response with LLM
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
            temperature: 0,
        });

        const prompt = `
You are an expert AI eligibility engine for Indian agricultural schemes.
Based ONLY on the provided Context text below, determine if the farmer is eligible for each of the following three schemes:
1. PM-KISAN
2. PM-KUSUM
3. Agriculture Infrastructure Fund (AIF)

Farmer Profile:
- State: ${state || "Not provided"}
- District: ${district || "Not provided"}
- Landholding: ${landholding || 0} hectares
- Crop: ${crop || "Not provided"}
- Category: ${category || "General"}

Context (Excerpts from official schemes):
---
${contextText}
---

Your response MUST be exactly ONE valid JSON object containing an array of exactly three evaluations in this format:
{
  "schemes": [
    {
      "name": "Scheme Name (e.g., Pradhan Mantri Kisan Samman Nidhi)",
      "status": "Eligible" or "Not Eligible" or "Unknown",
      "reason": "A 1-2 sentence explanation of why they are or are not eligible based on their profile vs rules.",
      "citation": "Quote the exact rule or condition from the text that proves your decision. Format as 'Page X: <quote>'.",
      "documentChecklist": ["Document 1", "Document 2"]
    }
  ]
}`;

        console.log("Prompting LLM...");
        const response = await llm.invoke(prompt);
        let rawAnswer = response.content.replace(/```json/g, "").replace(/```/g, "").trim();

        console.log("LLM Response:", rawAnswer);
        const jsonResponse = JSON.parse(rawAnswer);

        res.json(jsonResponse);
    } catch (error) {
        console.error("Error in /api/check-eligibility:", error);
        res.status(500).json({ status: "Error", reason: "Internal server error connecting to AI engine.", citation: "None", errorDetails: error.stack || error.toString() });
    }
});


// ================= SCHEME APPLICATION WIZARD ENGINE =================
app.post("/api/scheme-form", async (req, res) => {
    try {
        const { schemeName, farmerProfile } = req.body;

        if (!vectorStore) {
            return res.status(500).json({ status: "Error", message: "Vector store not initialized yet." });
        }

        // Retrieve relevant documents for this specific scheme
        const query = `Mandatory eligibility requirements, application documents, and official portal links for ${schemeName}`;
        console.log("Generating dynamic application form for:", schemeName);

        const retrievedDocs = await vectorStore.similaritySearch(query, 3);
        const contextText = retrievedDocs.map(doc => doc.pageContent).join("\n\n");

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            // Use JSON formatting to force structured output
            responseMimeType: "application/json",
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
            temperature: 0.1,
        });
        
        const prompt = `
You are an expert AI application system for the "${schemeName}".
Your goal is to parse the official scheme guidelines and generate a strict JSON schema for a dynamic HTML form.
This form will be filled by the farmer to complete their application.

Farmer Profile (Already Confirmed - DO NOT ASK FOR THESE AGAIN):
${JSON.stringify(farmerProfile, null, 2)}

Context (Excerpts from ${schemeName} guidelines):
---
${contextText}
---

Strict Instructions:
1. Analyze the Context to find the mandatory application requirements and documents for ${schemeName}.
2. Compare them against the Farmer Profile. 
3. Identify what specific details or documents are MISSING from the profile, but required to apply (e.g., Aadhaar number, Bank passbook upload, Land Record ID, declarations).
4. Output EXACTLY ONE valid JSON object with the following structure:
{
  "fields": [
    { "id": "unique_field_name", "label": "Question for the user (e.g., 'Enter your Aadhaar Number')", "type": "text" },
    { "id": "another_field", "label": "Do you have valid Land Records?", "type": "checkbox" }
  ],
  "applicationLink": "Provide the official application URL from the context. If none found, use 'https://www.india.gov.in/topics/agriculture'"
}
5. "type" must be either "text", "number", "email", or "checkbox".
6. Keep the number of fields strictly under 5 to prevent overwhelming the user.
7. Only return the raw JSON object. No markdown blocks like \`\`\`json.
`;

        const response = await llm.invoke(prompt);
        let rawAnswer = response.content.trim();
        
        let schema;
        try {
            schema = JSON.parse(rawAnswer);
        } catch (e) {
            // Strip markdown block and try again
            rawAnswer = rawAnswer.replace(/```json/g, '').replace(/```/g, '').trim();
            schema = JSON.parse(rawAnswer);
        }

        res.json(schema);
    } catch (error) {
        console.error("Error in /api/scheme-form:", error);
        res.status(500).json({ status: "Error", message: "Failed to generate dynamic application form." });
    }
});

app.listen(5000, () => console.log("Server running on port 5000 🚀"));
