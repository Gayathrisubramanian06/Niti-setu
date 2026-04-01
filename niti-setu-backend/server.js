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
    name: String,
    username: { type: String, unique: true },
    password: String,
    state: String,
    district: String,
    crops: [String]
});

const Farmer = mongoose.model("Farmer", farmerSchema);


// ================= SIGN UP =================
app.post("/signup", async (req, res) => {
    try {
        const { name, username, password, state, district, crops } = req.body;

        const existingUser = await Farmer.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newFarmer = new Farmer({
            name,
            username,
            password: hashedPassword,
            state,
            district,
            crops
        });

        await newFarmer.save();

        res.json({ message: "Account created successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        const farmer = await Farmer.findOne({ username });
        if (!farmer) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, farmer.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        res.json({ message: "Login successful", farmer });

    } catch (error) {
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
Based ONLY on the provided Context text below, determine if the farmer is eligible.

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

Your response MUST be valid JSON containing exactly these three fields:
{
  "status": "Eligible" or "Not Eligible" or "Unknown",
  "reason": "A 1-2 sentence explanation of why they are or are not eligible based on the rules, combining their profile and the rules.",
  "citation": "Quote the exact rule or condition from the text that proves your decision, or say 'None'."
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


// ================= SCHEME CHAT ASSISTANT =================
app.post("/api/scheme-chat", async (req, res) => {
    try {
        const { schemeName, farmerProfile, chatHistory, userMessage } = req.body;

        if (!vectorStore) {
            return res.status(500).json({ status: "Error", message: "Vector store not initialized yet." });
        }

        // Retrieve relevant documents for this specific scheme
        const query = `Application requirements, eligibility criteria, documents needed, and next steps for ${schemeName}`;
        console.log("Retrieving documents for scheme chat:", query);

        const retrievedDocs = await vectorStore.similaritySearch(query, 3);
        const contextText = retrievedDocs.map(doc => doc.pageContent).join("\n\n");

        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-2.5-flash",
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
            temperature: 0.3,
        });
        
        // Format previous conversation
        const conversationContext = chatHistory && chatHistory.length > 0
            ? chatHistory.map(msg => `${msg.role === 'user' ? 'Farmer' : 'Assistant'}: ${msg.content}`).join('\n')
            : "No previous conversation.";

        const prompt = `
You are an expert AI application assistant for the "${schemeName}".
Your goal is to ONLY ask for missing specific details required for the scheme that are NOT already in the Farmer Profile.

Farmer Profile (Already Confirmed):
${JSON.stringify(farmerProfile, null, 2)}

Context (Excerpts from ${schemeName} guidelines):
---
${contextText}
---

Previous Conversation:
${conversationContext}
Farmer: ${userMessage}

Strict Instructions:
1. Analyze the Context to find the mandatory eligibility requirements or documents for ${schemeName}.
2. Compare them against the Farmer Profile provided above. Do not ask for info already in the profile.
3. If there are missing requirements or documents (like Aadhaar card, Bank passbook, etc.), ask the farmer if they have them. Ask all missing requirements in ONE concise message.
4. If the farmer confirms they have the missing items, OR if no items were missing, provide a final confirmation and an application link (e.g., "Great! You are ready to apply. Click here: https://agricoop.nic.in"). Then STOP asking questions.
5. NEVER ask generic conversational questions (e.g., no "How can I help you?"). Be strictly focused on application completion. 
6. Keep responses under 3 sentences. Do not use markdown blocks like \`\`\`json. Return pure text response.
`;

        const response = await llm.invoke(prompt);
        let rawAnswer = response.content.trim();

        res.json({ message: rawAnswer });
    } catch (error) {
        console.error("Error in /api/scheme-chat:", error);
        res.status(500).json({ status: "Error", message: "Internal server error connecting to AI assistant." });
    }
});

app.listen(5000, () => console.log("Server running on port 5000 🚀"));
