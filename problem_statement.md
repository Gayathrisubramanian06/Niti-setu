"Niti-Setu" - Voice-Based Scheme Eligibility Engine
Focus: Voice Interface | RAG (Retrieval-Augmented Generation) | Document Processing | Rule-Based AI

1. Background:
Government launches 100+ agricultural schemes annually with combined budgets of ₹50,000+ crores. However, adoption rates stay below 30% because eligibility criteria are buried in complex 50-page PDFs. Farmers can't decode bureaucratic language to check if they qualify.

2. Current Problem:
1. PDF Bureaucracy

Scheme guidelines written in technical English/Hindi
Eligibility rules hidden in Section 4.1.2, subsection (c)
Impact: Farmers miss benefits they're entitled to
2. Generic Chatbots

Provide generic answers, not personalized eligibility
No proof or citations from official documents
Impact: Farmers don't trust the advice
3. Manual Form Filling

Application forms require reading entire guidelines
No guidance on required documents
Impact: 40-50% applications rejected due to errors
3. Goal:
Build a consultant AI that converts PDF bureaucracy into personalized Yes/No eligibility decisions with proof.

Beyond chatbots → Create a platform that:

Ingests official scheme PDFs automatically
Analyzes farmer profile against eligibility rules
Provides binary decisions with document citations
Simplifies application process
4. Expected Solution (MVP Requirements):
1. Voice-Enabled Profile Input
Capture farmer details via:

Voice Input: Speech-to-text in Hindi/English
Form Fallback: Manual entry option
Data Collected: State, district, land holding (acres), crop type, social category
Output: Structured farmer profile

2. RAG Engine (AI Backend)
Process scheme documents:

PDF Ingestion: Pre-process 2-3 real scheme PDFs (PM-KISAN, PM-KUSUM, Agri-Infrastructure Fund)
Vector Search: Find "Eligibility Criteria" sections
Profile Matching: LLM compares farmer data vs PDF rules
Citation Extraction: Identify exact paragraph/page supporting decision
Demo Goal: Input profile → Get "Eligible/Not Eligible" with PDF proof in 10 seconds

3. Proof Card Generator
Display results clearly:

Eligibility Status: Visual card (✓ Eligible for ₹6,000/year)
Document Proof: Screenshot or text snippet from PDF
Citation: "Page 4, Paragraph 3: 'All farmers with landholding less than 2 hectares...'"
Next Steps: List required documents for application
Validation: Test with 10 real farmer profiles, verify accuracy against manual PDF reading

4. User Dashboard
Real-time interface:

Profile Summary: Saved farmer details
Scheme Cards: List of applicable schemes
Proof Display: Expandable citations from PDFs
Impact Metrics:
Schemes analyzed
Eligibility checks performed
Average response time
5. "Level Up" Features:
Advanced Features (Choose 2-3)

Auto Form Filler: Pre-fill application PDFs using pdflib
Multilingual TTS: Read results in Hindi/Marathi/Tamil
Document Checklist: Auto-generate required documents list
Scheme Comparison: "You qualify for 3 schemes, here's the best one"
Application Tracker: Monitor submission status
6. Tech Stack:
Core

Backend: Node.js/Express
Database: MongoDB (vector storage for embeddings)
AI/ML

Orchestration: LangChain
LLM: OpenAI API / Gemini / Llama
Embeddings: text-embedding-ada-002 or sentence-transformers
Speech-to-Text: Web Speech API / Google Cloud Speech
Frontend

Framework: React.js
Voice Input: Browser SpeechRecognition API
External APIs

Government scheme PDFs from official portals