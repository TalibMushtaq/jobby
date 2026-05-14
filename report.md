# Technical Report: AI-Driven Resume Analysis & ATS Optimization
## Academic Reference & Machine Learning Methodology

This report provides an exhaustive deep-dive into the "Jobby" platform. It explores the intersection of Natural Language Processing (NLP), Information Retrieval (IR), and Large Language Models (LLMs). This document is intended as a primary source for academic research in Machine Learning applications for Human Resources (HR-Tech).

---

## 1. Executive Summary
Jobby is an intelligent orchestration layer designed to solve the "Black Box" problem of Applicant Tracking Systems (ATS). By using a multi-stage analytical pipeline, it provides users with both quantitative metrics (scores) and qualitative reasoning (AI advice).

## 2. Theoretical Foundations of the Scoring Engine

### 2.1 Lexical Analysis & Tokenization Pipeline
The first step in any NLP task is converting unstructured text into a structured format. Jobby uses a customized tokenization pipeline:
1.  **Normalization:** Converting to lowercase and stripping non-alphanumeric characters.
2.  **Stop-word Removal:** Filtering out common but low-signal words (e.g., "the", "is", "at") using the `natural` library's stop-word lexicon.
3.  **Stemming/Lemmatization:** While currently lightweight, the system identifies core concepts by reducing words to their base forms (e.g., "Developing" -> "Develop").

### 2.2 Vector Space Model (VSM) & Cosine Similarity
To compare a Resume ($D_r$) and a Job Description ($D_j$), we treat them as vectors in a high-dimensional space where each dimension corresponds to a unique term.

#### The Math:
The Cosine Similarity ($\text{sim}$) between two vectors $\mathbf{A}$ and $\mathbf{B}$ is:
$$\text{similarity}(\mathbf{A}, \mathbf{B}) = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \sqrt{\sum_{i=1}^{n} B_i^2}}$$

In Jobby, $A_i$ and $B_i$ are the **Term Frequencies (TF)**.
- **Why Cosine Similarity?** Unlike Euclidean distance, Cosine Similarity is length-invariant. This is crucial for resumes: a 3-page resume shouldn't be penalized just because it contains more words than a 1-page job description, provided the *ratio* of relevant keywords is high.

### 2.3 Feature Extraction: TF-IDF (Term Frequency-Inverse Document Frequency)
While simple counting works for some cases, it fails to distinguish between "common" words and "significant" words. Jobby uses TF-IDF to identify **Top Keywords**.

- **Term Frequency (TF):** Measures how frequently a term occurs in a document.
  $$TF(t, d) = \frac{\text{count of term } t \text{ in document } d}{\text{total terms in document } d}$$
- **Inverse Document Frequency (IDF):** Measures how important a term is across a corpus.
  $$IDF(t, D) = \log\left(\frac{N}{|\{d \in D : t \in d\}|}\right)$$

**Jobby's Implementation:** The system treats the Resume and Job Description as a small corpus. Terms that appear uniquely and frequently in the Job Description but are missing in the Resume are identified as the "Skill Gap."

---

## 3. Machine Learning Pathways & Advanced Architectures

### 3.1 Named Entity Recognition (NER) for HR
Current extraction uses lexicons (dictionaries). The next evolution is **Statistical NER**.
- **The Model:** Bi-LSTM-CRF (Bidirectional Long Short-Term Memory with Conditional Random Fields) or Transformer-based NER (e.g., **RoBERTa-large**).
- **The Goal:** To identify not just "Java," but to classify it as a `SKILL`, distinguish "Google" as an `ORGANIZATION`, and "3 years" as a `DURATION`.

### 3.2 Semantic Embeddings (Beyond Keywords)
Lexical matching fails on synonyms (e.g., "Machine Learning" vs "Statistical Modeling"). 
- **Proposed Algorithm:** **Doc2Vec** or **Sentence-Transformers**.
- **Mechanism:** These models use a "sliding window" to learn the context of words. In a vector space, the vector for `Python` would be geographically near `Django` and `FastAPI`, allowing the system to give "partial credit" for related technologies.

### 3.3 Classification of Risk (Scam/Ghost Jobs)
The current system uses a **Rule-Based Classifier**.
- **Transition to ML:** A **Support Vector Machine (SVM)** or **Random Forest** trained on the "Fake Jobs" dataset (e.g., the EMSCAD dataset).
- **Features for ML:** 
    - Sentiment Polarity (Scams often have high "Urgency" sentiment).
    - Syntactic Complexity (Scams often use repetitive, low-complexity language).
    - Link Entropy (Ratio of external links to total text).

---

## 4. System Logic & Orchestration

### 4.1 The Reasoning Gap
LLMs (like those accessed via OpenRouter) are excellent at synthesis but prone to "hallucinations." Jobby mitigates this by using the **Deterministic Anchor Pattern**:
1.  Local NLP calculates the exact hard facts (e.g., "Score is 68%").
2.  The LLM is given these facts and told: *"Explain why the score is 68%. Do not invent new facts."*
3.  This ensures the AI's "creativity" is bounded by mathematical reality.

### 4.2 Data Calculation Summary Table

| Metric | Current Method | ML Subject Alternative |
| :--- | :--- | :--- |
| **ATS Score** | Weighted Heuristic | Multi-layer Perceptron (MLP) |
| **Skill Match** | Lexicon/Regex | Transformer-based NER |
| **Similarity** | Cosine (TF) | Soft Cosine Similarity (WordEmbeddings) |
| **Risk** | Keyword Flags | Gradient Boosted Decision Trees (GBDT) |

---

## 6. Glossary of NLP Terms for ML Reports

- **Corpus:** A collection of written texts, especially the entire set of documents being analyzed.
- **N-gram:** A contiguous sequence of $n$ items from a given sample of text. (e.g., "Machine Learning" is a bigram).
- **Part-of-Speech (POS) Tagging:** The process of marking up a word in a text as corresponding to a particular part of speech (noun, verb, adjective, etc.).
- **Latent Semantic Analysis (LSA):** A technique in NLP of analyzing relationships between a set of documents and the terms they contain by producing a set of concepts related to the documents and terms.
- **Overfitting:** In an ML context, when a model learns the "noise" in the training data rather than the actual pattern, making it perform poorly on new resumes.

---

## 7. Conclusion for ML Subject
Jobby serves as a proof-of-concept for **Human-in-the-loop AI**. It demonstrates that while LLMs provide the "interface," the "intelligence" must be grounded in traditional IR (Information Retrieval) principles like TF-IDF and Vector Space modeling to remain reliable and explainable (XAI).
