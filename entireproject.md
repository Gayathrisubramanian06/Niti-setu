Niti-Setu
Voice-Based Agricultural Scheme Eligibility Engine

Hackathon Submission Documentation

1. Project Overview

Niti-Setu is an AI-powered voice-enabled eligibility engine that transforms complex government agricultural scheme PDFs into personalized Yes/No eligibility decisions with verifiable document citations.

The platform addresses low adoption rates of agricultural schemes caused by bureaucratic complexity, inaccessible language, and lack of personalized guidance.

2. Problem Statement

Government agricultural schemes:

Are documented in 40–50 page PDFs

Contain eligibility rules buried in subsections

Use technical language

Provide no personalized eligibility guidance

As a result:

Farmers cannot determine if they qualify

40–50% of applications are rejected due to documentation errors

Adoption rates remain below 30%

3. Solution Summary

Niti-Setu is not a chatbot.

It is a structured AI eligibility engine that:

Accepts farmer profile via voice or form

Ingests official scheme PDFs

Extracts eligibility rules using RAG

Compares farmer data against official rules

Outputs:

Binary eligibility decision

Exact document citation

Required document checklist

Next steps guidance

Response time target: < 10 seconds

4. System Architecture
High-Level Flow

Voice Input → Speech-to-Text

Structured Farmer Profile Generation

PDF Ingestion & Embedding

Vector Search (Eligibility Retrieval)

LLM-Based Rule Matching

Proof Card Generation

Dashboard Display

5. Core Components
5.1 Voice-Enabled Profile Capture
Input Fields:

State

District

Landholding (acres/hectares)

Crop Type

Social Category

Income (if required)

Flow:

Voice → STT → Structured JSON

Example Output:

{
  "state": "Kerala",
  "district": "Palakkad",
  "landholding": 1.5,
  "crop": "Paddy",
  "category": "OBC"
}

Fallback option: Manual form input.

5.2 PDF Ingestion Engine
Schemes Used in MVP:

PM-KISAN

PM-KUSUM

Agriculture Infrastructure Fund

Pipeline:

Load PDF

Extract text

Chunk into 500–1000 token sections

Generate embeddings

Store in vector database

Purpose:
Enable precise retrieval of eligibility criteria sections only.

5.3 RAG-Based Eligibility Engine
Step 1: Retrieval

Query vector database for:
“Eligibility criteria for [Scheme Name]”

Retrieve top relevant chunks.

Step 2: Rule Matching

Prompt LLM with:

Farmer Profile

Retrieved Eligibility Text

LLM outputs structured decision:

{
  "status": "Eligible",
  "reason": "Landholding less than 2 hectares",
  "citation": "Page 4, Paragraph 2"
}
5.4 Proof Card Generator

Each scheme result is displayed as:

Eligibility Status (✓ / ✗)

Monetary Benefit

Exact Citation from PDF

Required Documents

Next Steps

This ensures:

Transparency

Trust

Explainability

Auditability

6. User Dashboard

Dashboard Includes:

Saved Farmer Profile

List of Analyzed Schemes

Eligibility Cards

Expandable Citation Sections

Impact Metrics:

Schemes analyzed

Eligibility checks performed

Average response time

7. Advanced Features (Selected)
1. Multilingual Text-to-Speech

Results read aloud in:

Hindi

English

Regional Language (Optional)

2. Scheme Comparison Engine

If farmer qualifies for multiple schemes:

Rank by monetary benefit

Display best option recommendation

3. Document Checklist Generator

Auto-generate required documents list from PDF extraction.

8. Technology Stack
Backend

Node.js / Express

LangChain (Orchestration)

OpenAI / Gemini / Llama (LLM)

MongoDB (Vector Storage)

AI Components

Embeddings: text-embedding-ada-002 / sentence-transformers

RAG Pipeline

Structured Output Prompting

Frontend

React.js

Browser SpeechRecognition API

Responsive Dashboard UI

9. Key Innovations

Binary Eligibility Decisions (Not generic advice)

Document-Level Citations (Page + Paragraph)

Voice-Based Accessibility

Structured JSON Reasoning

Real-Time Decision (<10 seconds)

10. Validation Strategy

Test with 10 real farmer profiles

Manually verify results against PDF

Measure:

Accuracy

Response time

Retrieval precision

11. Impact

Niti-Setu enables:

Higher scheme adoption

Reduced application rejection

Transparent eligibility verification

Increased trust in AI systems

12. Scalability Plan

Future Enhancements:

Automatic ingestion of 100+ schemes

State-specific scheme filters

Auto PDF form filling

Farmer account-based tracking

API integration with government portals

13. Conclusion

Niti-Setu transforms bureaucratic agricultural documentation into an explainable, voice-accessible eligibility engine.

It bridges the gap between policy and people using AI-driven document intelligence.