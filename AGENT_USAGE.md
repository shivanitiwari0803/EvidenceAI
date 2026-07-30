# EvidenceAI — Agent Usage & Architectural Rules

This document outlines workspace conventions, execution instructions, and subagent guidelines for the **EvidenceAI Research Assistant** application.

---

## 🛠️ Monorepo Commands

Always run scripts from the project root:

```bash
# Install dependencies for both server and client
npm run install:all

# Run backend development server (Port 5000)
npm run dev:server

# Run frontend development server (Port 5173)
npm run dev:client

# Build production client bundle
npm run build:client
```

---

## 📐 Architecture Rules

1. **Keep Controllers Thin**: Express controllers must delegate business logic, validation, AI generation, and database calls to the Service layer (`ResearchService`, `PlanService`, `AIService`).
2. **Standardized Responses**: Always return responses using `ApiResponse` and `sendSuccess` / `sendError` from `server/utils/apiResponse.js`.
3. **Resilient Data Access**: Services in `server/services/` support both live MongoDB Atlas connections and fallback in-memory stores so local dev/tests run with 0 dependencies.
4. **React Context State**: Client state is managed centrally in `ResearchContext.jsx` and notifications via `ToastContext.jsx`.
