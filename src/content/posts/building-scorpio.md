---
title: "Building Scorpio: Verifiable AI Physics Tutoring at Scale"
icon: "i-tabler-atom"
published: 2025-11-20
description: "An deep dive into the 4-layer constraint architecture and pedagogical engineering behind Scorpio."
tags:
  topics: ["ai", "education", "engineering", "physics"]
  projects: ["scorpio"]
  types: ["technical"]
pin: 0
toc: true
---

# Building Scorpio: Verifiable Physics Tutoring

Physics is not just a collection of formulas; it is a framework for understanding the universe. However, for many students, that framework is obscured by "answer-seeking" behavior. When I set out to build **Scorpio**, my goal wasn't to build another "AI Homework Helper." I wanted to build a **Verifiable Physics Tutoring LMS** that forces students to think, while ensuring every interaction is grounded in scientific truth.

## The Problem: The "Hallucination" Gap in Education

Generic LLMs are dangerous in a physics context. They prioritize plausibility over correctness, often "hallucinating" derivations or skipping crucial unit conversions. In a learning environment, a wrong step is more than just an error—it’s a pedagogical failure.

To solve this, I moved away from simple prompting and engineered a **4-Layer Constraint Architecture**.

## Engineering for Pedagogical Integrity

The core of Scorpio is a system of "Hard Constraints" that the AI must satisfy before any output reaches the student.

### 🛡️ The Layered Defense
1.  **Domain Constraint:** Filters out non-physics queries to keep the student focused.
2.  **Pedagogical (Socratic) Constraint:** This is the most critical layer. It programmatically prevents the AI from providing direct answers. Instead, it must identify the student's specific misconception and offer a targeted hint.
3.  **Notation & Unit Constraint:** Mandates strict adherence to SI units and standard LaTeX formatting for all mathematical expressions.
4.  **Composite Logic:** A final verification pass that ensures the response is consistent with the current problem state stored in our Firestore database.

## Technical Implementation: Real-Time & Physics-First

The frontend isn't just a shell—it's an interactive laboratory.

*   **Real-Time Sync:** Using Firebase's snapshot listeners, student progress and AI "thought chains" are synced across sessions with zero perceived latency.
*   **Mathematical Precision:** We integrated a custom KaTeX rendering engine that handles complex multi-line derivations. I also built a **Visual Math Builder** to help students construct equations without needing to learn raw LaTeX.
*   **Space-Themed UX:** To reduce "physics anxiety," I designed a high-performance "glassmorphic" interface. It uses Framer Motion for physics-based UI interactions, mirroring the concepts being taught.

## Impact & The Path to Davidson Fellows

Scorpio was submitted to the **2026 Davidson Fellows Scholarship**. In initial pilot groups at Sage Ridge, we saw a marked shift: students stopped asking "What is the answer?" and started asking "Why does this force vector change?" 

The system tracks **Rule Adherence %** and **Response Quality metrics**, allowing us to verify that our AI constraints are actually working.

## Reflections on AI Engineering

Building Scorpio taught me that the future of AI in education isn't about *more* intelligence—it's about *governed* intelligence. By setting strict boundaries, we actually create more freedom for the student to explore, fail safely, and eventually, achieve a breakthrough in understanding.

---

**Related Project:**

**Scorpio** — AI Physics Tutoring LMS  
[Explore the Architecture →](/projects/scorpio/)