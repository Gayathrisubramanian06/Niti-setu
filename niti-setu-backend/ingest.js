require("dotenv").config();
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb");
const { MongoClient } = require("mongodb");
const path = require("path");

async function run() {
  try {
    console.log("Starting PDF Ingestion...");
    const fs = require('fs');
    const pdfsDir = path.join(__dirname, "pdfs");
    console.log("Scanning directory for PDFs: " + pdfsDir);
    
    // 1. Load all PDFs
    const files = fs.readdirSync(pdfsDir).filter(f => f.endsWith('.pdf'));
    let rawDocs = [];
    
    for (const file of files) {
        const pdfPath = path.join(pdfsDir, file);
        console.log("Loading PDF: " + pdfPath);
        const loader = new PDFLoader(pdfPath);
        const docs = await loader.load();
        rawDocs = rawDocs.concat(docs);
    }
    console.log(`Loaded a total of ${rawDocs.length} pages from ${files.length} PDFs.`);

    // 2. Split Text
    console.log("Splitting text into chunks...");
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log(`Split into ${docs.length} chunks.`);

    // 3. Setup MongoDB Connection
    console.log("Connecting to MongoDB Atlas...");
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    // The collection needs to be "schemes" as that is what the user was instructed to create the index on
    // The DB from .env seems to be 'farmerDB' based on MONGO_URI
    const database = client.db("farmerDB");
    const collection = database.collection("schemes");

    // Clear existing documents in the collection (optional, good for MVP testing)
    const delResult = await collection.deleteMany({});
    console.log(`Cleared ${delResult.deletedCount} existing documents in "schemes" collection.`);

    // 4. Initialize Embeddings & Vector Store
    console.log("Generating embeddings and storing in Atlas Vector Search...");
    const embeddings = new GoogleGenerativeAIEmbeddings({
      modelName: "gemini-embedding-001", // Corrected model from text-embedding-004
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
    });

    // The user created the index with name "vector_index" (hopefully).
    // If they used a different name, it might fail unless we specify the default name or explicitly pass it.
    // The default name used by MongoDBAtlasVectorSearch is "default", but since I told them to name it "vector_index", we should pass it.
    await MongoDBAtlasVectorSearch.fromDocuments(docs, embeddings, {
      collection: collection,
      indexName: "vector_index", // the name I told them to use
      textKey: "text",
      embeddingKey: "embedding",
    });

    console.log("✅ Successfully ingested all chunks and vectors!");
    await client.close();
  } catch (error) {
    console.error("❌ Error during ingestion:", error);
    require("fs").writeFileSync("debug.txt", error.stack || error.toString());
  }
}

run();
