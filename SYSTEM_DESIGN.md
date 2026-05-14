# Jobby System Design & Architecture
## Comprehensive Technical Specification

This document provides an exhaustive breakdown of the Jobby platform's architecture, data flow, and directory structure. It is designed for developers who want to understand the system's "wiring."

---

## 1. Directory Structure & Responsibilities

The project follows a modular Next.js App Router architecture.

### 1.1 `src/app/` (Routing & UI)
- **`(protected)/dashboard/`**: Contains the core user experience.
    - `analysis/[analysisId]/page.tsx`: The primary view for analysis results, integrating charts and AI feedback.
    - `history/page.tsx`: A trend-focused view of past analyses.
- **`api/`**: Serverless route handlers.
    - `uploadthing/`: Manages secure binary file uploads.
    - `analysis/[analysisId]/export/`: Generates JSON/PDF export payloads.

### 1.2 `src/lib/` (The Engine Room)
- **`scoring.ts`**: The "Heart" of the system. Contains the deterministic NLP pipeline, TF-IDF keyword extraction, and risk heuristic logic.
- **`openrouter.ts`**: Handles external LLM orchestration, prompt engineering, and failover/retry logic.
- **`analysis-service.ts`**: A high-level orchestrator that joins the deterministic and AI stages.
- **`resume-parser.ts`**: Handles multi-format (PDF/DOCX) extraction and text normalization.
- **`env.ts`**: Centralized, type-safe environment variable management using `zod`.

### 1.3 `src/components/` (UI Layer)
- **`dashboard/`**: Specialized components like `charts.tsx` (Recharts integration) and `sidebar.tsx`.
- **`ui/`**: Low-level, reusable primitives (Buttons, Inputs, Cards) built with Radix UI.

---

## 2. Detailed Data Flow

### 2.1 The Analysis Lifecycle
1.  **Ingestion:** User uploads a file via `UploadThing`. The file is stored in a S3-compatible bucket, and a reference is returned.
2.  **Extraction:** `resume-parser.ts` pulls the buffer, identifies the MIME type, and uses `pdf-parse` or `mammoth` to extract raw text.
3.  **Deterministic Phase (`scoring.ts`):**
    - **Tokenization:** Text is broken into units, stop-words are removed.
    - **Feature Counting:** Term frequencies are calculated for both Resume and Job.
    - **Vector Math:** Cosine Similarity is calculated to find the "Semantic Anchor."
    - **Heuristic Scoring:** Weighted logic calculates the ATS Score.
4.  **AI Reasoning Phase (`openrouter.ts`):**
    - A JSON-structured prompt is built containing the deterministic facts.
    - The `openrouter/free` router picks the best available model.
    - The response is parsed and validated against a strict Zod schema.
5.  **Persistence:** The complete result (Scores + AI Summary) is saved to PostgreSQL via Prisma.

---

## 3. Database Schema (Prisma)

The system uses a relational model optimized for quick retrieval of historical trends.

- **`User`**: Stores Clerk metadata and profile-level skills.
- **`Resume`**: Links to the UploadThing file and stores the extracted text (to avoid re-parsing costs).
- **`Analysis`**: The central entity. Stores the ATS Score, Risk Scores, and raw JSON blobs for deterministic breakdowns and AI reasoning.
- **`AiRequestLog`**: Tracks API usage and latency for monitoring.

---

## 4. Advanced Logic: Deterministic Heuristics

### 4.1 Scam Risk Calculation
The system uses a **Weighted Penalty System**.
- **Urgency Flags (Weight 12):** "Immediate joining", "Limited seats".
- **Financial Flags (Weight 26):** "Security deposit", "Registration fee".
- **Contact Flags (Weight 15):** "WhatsApp only", "Telegram".
- **The Score:** $\text{ScamScore} = \min(100, \sum (\text{matchCount} \times \text{weight}))$.

### 4.2 Ghost Job Risk Calculation
Identified by "Low-Specificity" markers:
- **Future Pipeline:** "Talent pool", "Future opportunities".
- **Vague Salary:** "Best in industry", "Competitive".
- **Missing Requirements:** Lack of specific "Years of experience" or "Requirements" headers.

---

## 5. Deployment & Security
- **Authentication:** Clerk handles JWT-based session management and MFA.
- **Rate Limiting:** Implemented via a custom middleware or Redis (upgradable) to prevent OpenRouter cost spikes.
- **Type Safety:** The entire project is 100% TypeScript, ensuring that the "JSON shape" from the AI matches the UI expectations.

**For Machine Learning subject details and algorithm theory, see [report.md](./report.md).**
