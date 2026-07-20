<h1 align="center">📈 Bull's AI</h1>

<p align="center">
  <strong>A high-frequency equities analytics platform and full-stack financial trading dashboard.</strong>
</p>

The goal was to design a high-throughput, low-latency financial dashboard capable of visualizing high-density data matrices in real-time, structurally decoupled from a serverless backend orchestration layer running context-aware RAG vector pipelines. 

👉 **You can check this out** [bulls-ai.vercel.app](https://bulls-ai.vercel.app/)

---

## ✨ Core Features & Functionality

* **Interactive Market Analytics:** A high-performance trading layout built to track custom equities baskets and render real-time pricing trends seamlessly.
* **Intelligent Financial Assistant:** Integrated a LIVE **RAG (Retrieval-Augmented Generation)** AI engine powered by Groq LLM. The assistant actively queries an embedded knowledge base using custom document vector ingestion to deliver context-aware financial research about the stock market and macroeconomics.
* **Production-Ready Data Architecture:** Built with structural scaling in mind, the architecture transitions smoothly from browser memory storage (`LocalStorage`) to a structured, live production database backend.
* **Premium Dashboard UX:** A clean, space-optimized dark theme crafted to present dense financial data beautifully without cluttering the interface.

---

## ⚡ The Tech Stack

I selected this modern stack to ensure fast compilation, modular components, and scalable database performance:

* **Frontend Framework:** `React` (Functional components, custom state management hooks)
* **Build Tooling:** `Vite` (Optimized for lightning-fast Hot Module Replacement)
* **Styling & Layout:** `Tailwind CSS` (Custom utility configurations for structural dark-mode grids)
* **Database & Cloud Backend:** `Supabase` (Configured with a structured relational `PostgreSQL` schema)
* **Serverless Compute:** `TypeScript Edge Functions` (Handling seamless backend cloud integrations)
* **Hosting & CI/CD:** `Vercel` (Configured with production and preview environment pipelines)

---

## 🚀 Running the Project Locally

If you want to explore the codebase or spin up a local development server, follow these quick steps:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Isha2790/bulls_ai.git](https://github.com/Isha2790/bulls_ai.git)

2. **Navigate into the directory:**
   ```bash
   cd bulls_ai

3. **Install dependencies:**
   ```bash
   npm install

4. **Launch the app**
   ```bash
   npm run dev

Built with Love- Isha❤️
