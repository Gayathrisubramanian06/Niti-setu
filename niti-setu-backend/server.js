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
    mobile: { type: String, unique: true },
    aadhaar: String,
    age: Number,
    gender: String,
    landholding: Number,
    landOwnership: String,
    crops: [String],
    irrigation: String,
    category: String,
    incomeRange: String,
    bankAccount: String,
    ifsc: String,
    state: String,
    district: String,
    block: String,
    village: String,
    language: String,
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
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatGroq } = require("@langchain/groq");
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


// ================= SHARED LLM HELPER =================
if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  WARNING: GROQ_API_KEY is missing from .env! Voice input, eligibility check, and AI features will NOT work.");
    console.warn("   Get a free key at: https://console.groq.com → API Keys → Create API Key");
    console.warn("   Then add to .env: GROQ_API_KEY=your_key_here");
}

function getLLM() {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in .env. Get a free key at https://console.groq.com");
    }
    return new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY,
        temperature: 0,
    });
}


// ================= RAG ELIGIBILITY CHECK =================
app.post("/api/check-eligibility", async (req, res) => {
    try {
        const { state, district, landholding, crop, category } = req.body;

        if (!vectorStore) {
            return res.status(500).json({ status: "Error", message: "Vector store not initialized yet." });
        }

        const query = `Eligibility criteria scheme benefits agriculture for farmer in ${state} with ${landholding} hectares farming ${crop} category ${category}`;
        console.log("Retrieving documents for query:", query);

        const retrievedDocs = await vectorStore.similaritySearch(query, 4);
        const contextText = retrievedDocs.map(doc => doc.pageContent).join("\n\n");

        if (!contextText.trim()) {
            return res.json({
                status: "Unknown",
                reason: "No relevant scheme documents found in the database.",
                citation: "None"
            });
        }

        const llm = getLLM();

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
        res.status(500).json({
            status: "Error",
            reason: "Internal server error connecting to AI engine.",
            citation: "None",
            errorDetails: error.stack || error.toString()
        });
    }
});


// ================= SCHEME APPLICATION WIZARD ENGINE =================
app.post("/api/scheme-form", async (req, res) => {
    try {
        const { schemeName, farmerProfile } = req.body;

        if (!vectorStore) {
            return res.status(500).json({ status: "Error", message: "Vector store not initialized yet." });
        }

        const query = `Mandatory eligibility requirements, application documents, and official portal links for ${schemeName}`;
        console.log("Generating dynamic application form for:", schemeName);

        const retrievedDocs = await vectorStore.similaritySearch(query, 3);
        const contextText = retrievedDocs.map(doc => doc.pageContent).join("\n\n");

        const llm = new ChatGroq({
            model: "llama-3.3-70b-versatile",
            apiKey: process.env.GROQ_API_KEY,
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
3. Identify what specific details or documents are MISSING from the profile, but required to apply.
4. Output EXACTLY ONE valid JSON object with the following structure:
{
  "fields": [
    { "id": "unique_field_name", "label": "Question for the user", "type": "text" },
    { "id": "another_field", "label": "Do you have valid Land Records?", "type": "checkbox" }
  ],
  "applicationLink": "Official application URL from context, or 'https://www.india.gov.in/topics/agriculture'"
}
5. "type" must be either "text", "number", "email", or "checkbox".
6. Keep the number of fields strictly under 5.
7. Only return the raw JSON object. No markdown blocks.
`;

        const response = await llm.invoke(prompt);
        let rawAnswer = response.content.trim();

        let schema;
        try {
            schema = JSON.parse(rawAnswer);
        } catch (e) {
            rawAnswer = rawAnswer.replace(/```json/g, '').replace(/```/g, '').trim();
            schema = JSON.parse(rawAnswer);
        }

        res.json(schema);
    } catch (error) {
        console.error("Error in /api/scheme-form:", error);
        res.status(500).json({ status: "Error", message: "Failed to generate dynamic application form." });
    }
});


// =====================================================================
// ================= VOICE QUERY =======================================
// =====================================================================

const LANG_NAMES = {
    "kn-IN": "Kannada",
    "hi-IN": "Hindi",
    "ta-IN": "Tamil",
    "ml-IN": "Malayalam",
};

async function translateToEnglish(text, langCode) {
    const langName = LANG_NAMES[langCode] || "Indian language";
    const llm = getLLM();
    const response = await llm.invoke(
        `Translate the following ${langName} text to English accurately.
Return ONLY the translated English text with no extra commentary.

${langName} text:
${text}`
    );
    return response.content.trim();
}

app.post("/api/translate", async (req, res) => {
    try {
        const { text, langCode } = req.body;
        if (!text) return res.status(400).json({ error: "Missing text" });

        const llm = getLLM();
        const langName = LANG_NAMES[langCode] || "the local Indian language";
        const response = await llm.invoke(
            `Translate the following text to ${langName}. Return ONLY the translated text, no extra commentary:\n\n${text}`
        );
        res.json({ translatedText: response.content.trim() });
    } catch (error) {
        console.error("Translation error:", error);
        res.status(500).json({ error: "Failed to translate" });
    }
});

async function extractFarmerProfile(englishText, baseProfile = {}) {
    const llm = getLLM();
    const response = await llm.invoke(
        `Extract farmer profile details from the following English text spoken by a farmer.
Return ONLY a valid JSON object with these exact keys:
{
  "state": "state name or null",
  "district": "district name or null",
  "landholding": number in hectares or null,
  "crop": "crop name or null",
  "category": "SC/ST/OBC/General or null"
}

If a field is not mentioned, return null for that field.
Do not guess. Only extract what is explicitly stated.

Farmer speech:
${englishText}`
    );

    let raw = response.content.replace(/```json/g, "").replace(/```/g, "").trim();
    let extracted = {};
    try {
        extracted = JSON.parse(raw);
    } catch (e) {
        console.warn("[voice-query] Could not parse profile extraction JSON, using base profile only.");
    }

    return {
        state: extracted.state || baseProfile.state || "Not provided",
        district: extracted.district || baseProfile.district || "Not provided",
        landholding: extracted.landholding ?? baseProfile.landholding ?? 0,
        crop: extracted.crop || (baseProfile.crops && baseProfile.crops[0]) || "Not provided",
        category: extracted.category || baseProfile.category || "General",
    };
}

async function runEligibilityRAG(profile) {
    const { state, district, landholding, crop, category } = profile;

    const query = `Eligibility criteria scheme benefits agriculture for farmer in ${state} with ${landholding} hectares farming ${crop} category ${category}`;
    const retrievedDocs = await vectorStore.similaritySearch(query, 4);
    const contextText = retrievedDocs.map(doc => doc.pageContent).join("\n\n");

    if (!contextText.trim()) return null;

    const llm = getLLM();

    const prompt = `
You are an expert AI eligibility engine for Indian agricultural schemes.
Based ONLY on the provided Context text below, determine if the farmer is eligible for each scheme:
1. PM-KISAN
2. PM-KUSUM
3. Agriculture Infrastructure Fund (AIF)

Farmer Profile:
- State: ${state}
- District: ${district}
- Landholding: ${landholding} hectares
- Crop: ${crop}
- Category: ${category}

Context:
---
${contextText}
---

Respond with exactly ONE valid JSON object:
{
  "schemes": [
    {
      "name": "Full scheme name",
      "status": "Eligible" or "Not Eligible" or "Unknown",
      "reason": "1-2 sentence explanation.",
      "citation": "Exact quote from context. Format: 'Page X: <quote>'.",
      "documentChecklist": ["Document 1", "Document 2"]
    }
  ]
}`;

    const response = await llm.invoke(prompt);
    const raw = response.content.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(raw);
    return parsed.schemes;
}

async function buildLocalizedSummary(schemes, langCode) {
    const langName = LANG_NAMES[langCode] || "Hindi";
    const llm = getLLM();

    const summaryLines = schemes.map(s =>
        `${s.name}: ${s.status}. ${s.reason}`
    ).join(" ");

    const response = await llm.invoke(
        `Translate the following eligibility result to ${langName}.
Use very simple language suitable for a rural farmer with limited literacy.
Be warm and clear. Return ONLY the translated text.

English result:
${summaryLines}`
    );

    return response.content.trim();
}

app.post("/api/voice-query", async (req, res) => {
    const { text, language, farmerProfile: baseProfile = {} } = req.body;

    if (!text || !text.trim()) {
        return res.status(400).json({ error: "No transcript text received." });
    }

    if (!vectorStore) {
        return res.status(500).json({ error: "Vector store not ready yet." });
    }

    const langCode = language || "hi-IN";

    try {
        console.log(`[voice-query] Received (${langCode}): ${text}`);
        const englishText = await translateToEnglish(text, langCode);
        console.log(`[voice-query] English: ${englishText}`);

        const profile = await extractFarmerProfile(englishText, baseProfile);
        console.log(`[voice-query] Extracted profile:`, profile);

        const schemes = await runEligibilityRAG(profile);
        if (!schemes) {
            const fallback = await buildLocalizedSummary(
                [{ name: "Schemes", status: "Unknown", reason: "No relevant documents found in the database." }],
                langCode
            );
            return res.json({ result: fallback, schemes: [], profile });
        }

        const localizedResult = await buildLocalizedSummary(schemes, langCode);
        console.log(`[voice-query] Localized (${langCode}): ${localizedResult}`);

        res.json({
            result: localizedResult,
            schemes,
            profile,
            englishText,
        });

    } catch (error) {
        console.error("[voice-query] Error:", error);
        res.status(500).json({ error: "Failed to process voice query.", details: error.message });
    }
});


// ================= EXTRACT SINGLE FIELD FROM VOICE =================
app.post("/api/extract-field", async (req, res) => {
    try {
        const { text, language, fieldKey, fieldLabel } = req.body;

        if (!text || !fieldKey) {
            return res.status(400).json({ value: null, error: "Missing text or fieldKey" });
        }

        const llm = getLLM();

        const prompt = `A farmer spoke the following in their local language (language code: ${language || "hi-IN"}).
They were asked to provide their "${fieldLabel}" (field key: "${fieldKey}").

Farmer's speech:
"${text}"

Your task:
1. Understand what the farmer said (translate mentally if needed).
2. Extract ONLY the value for the field "${fieldKey}" (${fieldLabel}).
3. Return ONLY a valid JSON object in this exact format:
   { "value": "<extracted value>" }

Rules:
- For numeric fields (age, landholding): return only the number as a string, e.g. "2.5"
- For text fields (name, state, district, crop, etc.): return the clean value, e.g. "Maharashtra"
- For category: normalize to one of: SC / ST / OBC / General
- For gender: normalize to Male / Female / Other
- For crops: return a single crop name string
- For irrigation: normalize to Drip / Sprinkler / Canal / Rainfed / Other
- For landOwnership: normalize to Owned / Leased / Sharecropped
- For incomeRange: return the range as stated, e.g. "50000-100000"
- If you cannot find any relevant value in the speech, return: { "value": null }
- Return ONLY the JSON object. No markdown, no explanation.`;

        const response = await llm.invoke(prompt);
        let raw = response.content.replace(/```json/g, "").replace(/```/g, "").trim();

        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return res.json({ value: null });
        }

        res.json({ value: parsed.value ?? null });

    } catch (error) {
        console.error("Error in /api/extract-field:", error);
        res.status(500).json({ value: null, error: "Failed to extract field value." });
    }
});


app.listen(5000, () => console.log("Server running on port 5000 🚀"));