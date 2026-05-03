# 🛫 AeroGuide: AI Airport Companion - Project Context

This document serves as the full architectural and operational context for AeroGuide, intended to bring any new AI assistant or developer up to speed instantly.

## 🌟 Project Overview
AeroGuide is a **privacy-first, local-AI driven airport assistant** designed to personalize the traveler experience. It provides context-aware guidance based on user profiles (travel frequency, age, diet, accessibility needs). Built for a hackathon, the focus is on navigation, food/shopping discovery with SKUs, security compliance, and time-to-gate estimation.

## 🛠️ Tech Stack
- **Frontend:** React 19 (Vite) + Vanilla CSS (Glassmorphism design)
- **Backend:** FastAPI (Python 3.14)
- **AI Engine:** 
  - **LLM:** Qwen 2.5 (0.5B) running locally via **Ollama** (60s timeout)
  - **RAG:** Custom Python Keyword Matching with contextual document chunking
  - **TTS:** Windows Native SAPI5 (Microsoft Speech API) via COM in background threads
  - **STT:** Google Web Speech API (configured for `hi-IN` to support Hinglish)
- **Database:** SQLite (for persistent user profiles)

## 🏗️ Core Architecture & Business Logic

### 1. Dynamic Personalization (`Backend/Chatbot.py`)
The system builds a **Dynamic System Prompt** based on:
- **Travel Frequency:** First-time (detailed) vs. Frequent (concise) vs. Occasional (moderate)
- **Dietary Preferences:** Filters food recommendations (Veg, Jain, Vegan)
- **Accessibility:** Wheelchair routes, visual impairment, infant care
- **Age:** Senior citizen adaptations

### 2. Structured RAG (`Backend/RAGService.py`)
**CRITICAL:** The RAG was completely rewritten to create **contextual document chunks** instead of atomic key-value fragments. It loads 4 data sources:
1. `airport_knowledge.json` - Gates, amenities, PNR database, protocols
2. `food_database.json` - 18 restaurants with menus, prices, dietary tags
3. `security_procedures.json` - 3 airports (DEL, BOM, BLR), 6 destination countries
4. `shopping_database.json` - 6 shops with duty-free SKUs, prices, and offers

Each location/shop/restaurant becomes ONE complete document with all its details together.

### 3. Multi-Airport Security (`Data/security_procedures.json`)
Supports DEL, BOM, and BLR airports with:
- Domestic and International security procedures with time estimates
- Prohibited items lists with icons
- Country-specific warnings (UAE, USA, Singapore, UK, Japan, Australia)
- Penalty information

### 4. Shopping & Duty-Free (`Data/shopping_database.json`)
Includes duty-free shops, electronics, books, souvenirs, and luxury stores with:
- Individual product SKUs and prices
- Active offers and promotions
- Terminal and gate proximity data

## 🚀 Setup & Execution
1. **Ollama:** Download from ollama.com → `ollama pull qwen2.5:0.5b`
2. **Python:** `pip install fastapi uvicorn requests python-multipart pywin32 SpeechRecognition`
3. **Backend:** `python main.py` (runs on port 8000)
4. **Frontend:** `npm install` then `npm run dev` (runs on port 5173)

## ⚠️ Critical Bug Fix History
- **ChromaDB/HuggingFace Removed:** Caused C-level memory access violations on Windows. Replaced with pure Python keyword search. **Do NOT re-add langchain-chroma or sentence-transformers.**
- **Ollama Timeout:** Set to 60 seconds. First query after cold start needs warmup time.
- **TTS Threading:** Uses daemon threads to prevent FastAPI blocking.

## 📁 API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| POST | `/api/chat` | Main AI chat with RAG context |
| POST | `/api/users/profile` | Create user profile |
| GET | `/api/users/{id}` | Get user profile |
| POST | `/api/food/recommendations` | Food search with filters |
| GET | `/api/food/categories` | Cuisine categories |
| GET | `/api/security/rules` | Security procedures (supports `airport_code`, `flight_type`, `destination` params) |
| POST | `/api/security/check-items` | Check if items are prohibited |
| GET | `/api/shopping` | Shopping/duty-free data |
| GET | `/api/shopping/offers` | All active offers |

---
*Created for the Hackathon Finalization Stage.*
