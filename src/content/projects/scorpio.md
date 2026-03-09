---
title: "Scorpio"
icon: "i-tabler-telescope"
description: "Transforming Physics Education through AI-Driven Socratic Tutoring."
published: 2026-01-31
tags:
    topics: ["education", "ai", "physics", "tutoring"]
    projects: ["scorpio"]
    types: ["showcase"]
image: /images/projects/scorpio.png
github: "https://github.com/RushilMahadevu/scorpio"
demo: "https://scorpioedu.org/"
status: "in-progress"
pin: 0
---

**Scorpio** is a research-driven educational platform engineered to transform physics instruction. By integrating a novel 4-layer AI constraint architecture with a high-performance, space-themed interface, Scorpio bridges the gap between traditional Learning Management Systems (LMS) and the dynamic cognitive requirements of physics problem-solving.

## 🏗️ Technical Architecture

Scorpio's architecture is built for concurrency, type safety, and real-time synchronization.

### 🛡️ The 4-Layer Constraint System

At the heart of Scorpio's AI tutoring capabilities is a proprietary constraint architecture designed to ensure pedagogical validity and eliminate hallucinations. The system enforces strict adherence through four distinct layers:

| Layer | Constraint | Purpose |
| :--- | :--- | :--- |
| **01** | Domain | Restricts knowledge exclusively to physics principles. |
| **02** | Pedagogical | Enforces the Socratic method; direct answers are prohibited. |
| **03** | Notation | Mandates proper LaTeX formatting and SI unit adherence. |
| **04** | Composite | Synchronizes all layers for research-grade tutoring. |

### 🔄 Data & Synchronization

*   **Real-Time State:** Powered by Cloud Firestore with optimistic UI updates for zero-latency interaction.
*   **Asset Management:** Client-side processed submissions (PDFs/Images) stored via optimized base64 in Firebase Storage.

## 🚀 Core Capabilities

### 🎓 Research-Grade AI Tutoring

The Scorpio AI Tutor is a context-aware pedagogical agent, not a generic chatbot.

*   **Context Retention:** Maintains deep awareness of specific assignments and problem states.
*   **Adaptive Guidance:** Dynamically scales hint complexity based on student performance.
*   **Academic Integrity:** Hardened against jailbreak attempts and direct-answer harvesting.

### 🔢 Advanced Mathematical Rendering

Precision is non-negotiable in physics. Our custom rendering engine includes:

*   **KaTeX Integration:** Blazing fast client-side LaTeX rendering.
*   **Visual Math Builder:** An intuitive UI for constructing complex equations without raw LaTeX knowledge.

### 🌌 Immersive User Experience

A "Space-Themed" aesthetic designed to reduce cognitive load and boost engagement.

*   **Parallax Depth:** Multi-layered backgrounds powered by Framer Motion.
*   **Glassmorphism:** Context-aware backdrop-blur interfaces using Radix UI primitives.

## 🔬 Research & Efficacy

Scorpio includes a dedicated research dashboard to monitor the performance of its AI architecture. System metrics track:

*   **Rule Adherence %:** The frequency with which the AI successfully maintains Socratic constraints.
*   **Response Quality:** Automated evaluation of pedagogical relevance and clarity.
*   **Token Efficiency:** Optimization of prompt length versus output quality to reduce latency.

> **Data Insight:** Experimental results indicate that the Full Constraint Stack significantly outperforms standard models in educational utility, maintaining a high quality score across varying difficulty levels.

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 | Server Components, Streaming, and Routing |
| **Language** | TypeScript 5.7 | Strict type safety and developer ergonomics |
| **Styling** | Tailwind CSS | Utility-first styling with perceptually uniform colors |
| **UI Library** | Shadcn UI | Accessible, headless component primitives |
| **Motion** | Framer Motion | Physics-based animations and gesture handling |
| **Backend** | Firebase | Auth, Firestore (NoSQL), Functions, Storage |
| **AI Model** | Gemini 2.5 Flash | Multimodal reasoning and constraint adherence |
| **Math** | KaTeX | Fast, accessible equation rendering |

## 📂 Project Structure

```bash
├── src/
│   ├── app/            # Next.js App Router (Student/Teacher Dashboards)
│   ├── components/     # Reusable UI (Shadcn + Custom Math Components)
│   ├── contexts/       # Global State (Auth, Space Effects)
│   ├── hooks/          # Custom React Hooks
│   ├── lib/            # Core Logic (Firebase Admin, Gemini AI, Utils)
│   └── proxy.ts        # Edge routing & middleware logic
├── public/             # Static Assets (Models, Architecture PDFs)
├── functions/          # Firebase Cloud Functions (Background Processing)
└── firestore.rules     # Database Security Layers
```
