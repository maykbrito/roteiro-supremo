# Roteiro Supremo v2 — Design Spec

## Overview

Rebuild the Roteiro Supremo from a multi-step wizard into a single-screen block editor using BlockNoteJS.org. 
The user sees the full script structure as editable blocks, fills them in directly, and gets AI assistance at both the block and document level.

Two screens total: a **Dashboard** (list/manage scripts) and an **Editor** (single-page BlockNote editor).

## Problem Statement

The current wizard (left panel) + preview (right panel) layout requires constant back-and-forth between editing and reviewing. The user never sees their script as a whole while writing. The new design merges editing and viewing into one surface — what you type is what you see.

## Architecture

### Tech Stack (changes from v1)

| Layer | v1 | v2 |
|---|---|---|
| Editor | Custom textarea wizard | BlockNote.js (`@blocknote/react`, `@blocknote/mantine`) |
| AI | `@google/genai` (unused) | `@blocknote/xl-ai` + Convex actions calling Gemini API |
| Sync | Custom `useAutoSave` hook (debounced JSON) | `@convex-dev/prosemirror-sync` (real-time block-level sync) |
| Auth | None | Convex Auth (`@convex-dev/auth`) with Google OAuth |
| Routing | None (SPA) | Simple client-side router (2 routes: dashboard, editor) |

Everything else stays: React 19, Vite, Tailwind CSS 4, Convex backend, Motion for animations.

### Screen 1: Dashboard

Simple grid/list of the user's scripts. Each card shows:
- Script title (from Module 0)
- Last edited timestamp
- Progress indicator (X/Y blocks filled — a field counts as "filled" if it has any non-whitespace inline content)
- Delete action

Plus a "New Script" button that creates a fresh script from the template and navigates to the editor.

### Screen 2: Editor (core of the app)

A single dark-themed page with the BlockNote editor occupying the center column (max-width ~720px, centered). The document is pre-loaded with the template structure.

**Top bar:**
- Back arrow ("Roteiros") — returns to dashboard
- Script title (editable inline)
- "Analisar com IA" button — triggers full-document AI analysis

**Document structure (pre-loaded template):**

Each module is a custom BlockNote block. The template contains these blocks in order:

1. **Module 0 — A Vitrine**
   - Titulo do Video (inline content)
   - Ideia da Thumbnail (inline content)

2. **Module 1 — 30 Segundos Cruciais**
   - Objetivo do Video (inline content)
   - Dificuldade / Problema (inline content)
   - Descoberta (inline content)
   - Objecoes (inline content)

3. **Module 2-3 — Quem e Voce?**
   - Apresentacao (inline content)
   - Credenciais (inline content)
   - Estrategia de Conexao (inline content)

4. **Module 4 — O Recheio**
   - Parte 1 (inline content)
   - Parte 2 (inline content)
   - Parte 3 (inline content)

5. **Module 5-6 — A Saida Invisivel**
   - Transicao (inline content)
   - CTA Escolhido (inline content)
   - Video Recomendado (inline content)

## Custom BlockNote Blocks

### Block Hierarchy — How Modules and Fields Relate

BlockNote documents are flat arrays of blocks (no parent-child nesting). To group `scriptField` blocks under a `moduleHeader`, we use a **convention-based approach**:

- Each `moduleHeader` block has a `moduleId` prop (e.g., `"0"`, `"1"`, `"2-3"`)
- Each `scriptField` block has a matching `moduleId` prop
- In the template, fields are placed immediately after their module header in document order
- Collapsing a module sets `collapsed: true` on the `moduleHeader`. The `Editor.tsx` wrapper reads all blocks, and for any `moduleHeader` with `collapsed: true`, it sets `display: none` on subsequent `scriptField` blocks with matching `moduleId` via the editor's DOM (using `editor.domElement` and CSS class selectors). This avoids removing/re-inserting blocks from the document, preserving content.

This is similar to how Notion handles toggle headings — the blocks are siblings in the document, and visibility is controlled at the render layer.

### `moduleHeader` block

A non-editable section header that marks the start of each module. Renders the module badge (e.g., "MODULO 0"), the module title, and contains the micro learning callout.

```typescript
propSchema: {
  moduleId: { default: "0" },
  moduleNumber: { default: "0" },
  moduleTitle: { default: "A Vitrine" },
  microLearning: { default: "" }, // The educational tip text
  collapsed: { default: false },  // Whether the module's fields are collapsed
}
content: "none"
```

**Render:** Lime accent badge + title. A clickable chevron toggles `collapsed` (via `editor.updateBlock`). Below the title, a collapsible callout with the micro learning tip (lime left border, lightbulb icon). The callout is toggled independently from the module collapse.

### `scriptField` block

An editable field within a module. This is where the user types their content.

```typescript
propSchema: {
  label: { default: "" },         // e.g., "Titulo do Video"
  placeholder: { default: "" },   // e.g., "Clique para digitar o titulo..."
  moduleId: { default: "0" },     // Which module this belongs to
}
content: "inline"  // Supports rich text editing
```

**Render:** A label above an editable area with placeholder text. Each field has an AI "Sugerir" button next to its label. The block's wrapper `div` gets a CSS class `module-field-{moduleId}` for collapse targeting.

## AI Integration

### Level 1: Per-block suggestion ("Sugerir" button)

Each `scriptField` block has a small "Sugerir" button next to its label. This is a **hand-rolled feature** (not using `AIExtension`/`invokeAI()`):

1. Gathers context: the script title, the module name, the field label, and any content already written in other fields
2. Calls a Convex action (`suggestFieldContent`) that sends a prompt to Gemini API
3. While loading, shows a skeleton/shimmer animation in the field
4. The suggestion is inserted into the field via `editor.updateBlock()`, replacing the inline content
5. A small floating bar appears below the field (absolutely positioned React component, rendered inside the block's render function) with "Aceitar" / "Descartar" buttons
6. Component state tracks: `{ status: "idle" | "loading" | "reviewing", originalContent: InlineContent[], suggestionContent: InlineContent[] }`
7. "Aceitar" clears the state (content stays as-is); "Descartar" calls `editor.updateBlock()` to restore `originalContent`
8. If the field already has content, the original is saved to component state before the suggestion replaces it

### Level 2: Full document analysis ("Analisar com IA" button)

A button in the top bar that:

1. Serializes the entire document to JSON
2. Sends it to a Convex action that analyzes the complete script
3. Returns feedback on: retention hooks, CTA effectiveness, content flow, missing elements
4. Displays the analysis in a slide-out panel (right side) with actionable suggestions
5. While analyzing, the button shows a loading spinner and text changes to "Analisando..."

### Level 3: Native BlockNote AI (select text > rewrite/improve)

BlockNote's `@blocknote/xl-ai` provides a built-in AI menu when users select text. This requires:

1. **AI model configuration:** `@blocknote/xl-ai` expects a model from the Vercel AI SDK (`ai` package). We use `createOpenAICompatible` from `@ai-sdk/openai-compatible` pointed at our Convex HTTP proxy
2. **Convex HTTP action as proxy:** A Convex HTTP endpoint (`POST /api/ai/blocknote`) implements the OpenAI-compatible chat completions API (`/v1/chat/completions`). It receives the request, translates it to Gemini format, calls Gemini API, and streams the response back in OpenAI SSE format
3. **Configuration in editor setup:**

```typescript
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { AIExtension } from "@blocknote/xl-ai";

const aiProvider = createOpenAICompatible({
  name: "convex-gemini",
  baseURL: `${import.meta.env.VITE_CONVEX_URL.replace('.cloud', '.site')}/api/ai/blocknote`,
});

const editor = useCreateBlockNote({
  extensions: [new AIExtension({ model: aiProvider("gemini-3-flash-preview") })],
});
```

**HTTP endpoint request/response format:**
- Request: `{ model: string, messages: ChatMessage[], stream: boolean }`
- Response: Server-Sent Events with `data: {"choices":[{"delta":{"content":"..."}}]}` chunks
- This is the standard OpenAI chat completions streaming format

**Dependencies:** `@blocknote/xl-ai`, `@ai-sdk/openai-compatible`, `ai`

### AI Backend

A Convex action file (`convex/ai.ts`) and an HTTP endpoint file (`convex/http.ts`):

**`convex/ai.ts` (actions):**
- `suggestFieldContent` — takes script context + field info, returns suggestion text via Gemini
- `analyzeScript` — takes full document JSON, returns structured analysis with improvement suggestions

**Gemini model:** `gemini-3-flash-preview` for all AI operations. Environment variable `GEMINI_API_KEY` stored in Convex dashboard.

**`convex/http.ts` (HTTP endpoint):**
- `POST /api/ai/blocknote` — proxy for BlockNote's native AI menu. Receives BlockNote AI requests, forwards to Gemini API, streams responses back. This is required because `@blocknote/xl-ai` expects an HTTP endpoint that speaks the OpenAI-compatible chat completions format. The endpoint translates between Gemini and OpenAI formats.

## Data Model (Convex Schema)

### Updated schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  scripts: defineTable({
    userId: v.id("users"), // references authTables.users
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_updated", ["userId", "updatedAt"]),
});
```

The `users` table is provided by `authTables` and managed by Convex Auth. We don't define it ourselves. The `scripts` table references `users._id` via `userId`.

### Linking scripts to prosemirror documents

The `@convex-dev/prosemirror-sync` component's `useBlockNoteSync` hook takes a string ID for the document. We use the script's `_id` (which is a string in Convex) as this ID directly.

```typescript
// In Editor.tsx
const sync = useBlockNoteSync(api.prosemirrorSync, scriptId);
```

The `scripts` table stores only metadata. The document content lives entirely in the prosemirror-sync component's internal tables (managed by the component, not our schema).

### Template Initialization and ProseMirror Conversion

BlockNote's `useBlockNoteSync` hook from `@convex-dev/prosemirror-sync/blocknote` handles the conversion between BlockNote blocks and ProseMirror nodes internally. The workflow:

1. On "New Script", call a Convex mutation that creates the `scripts` metadata row
2. On the frontend, `useBlockNoteSync` is called with the script ID. If no document exists yet, `sync.create()` is called
3. For the initial document, we use BlockNote's editor API to convert our template `Block[]` array into a ProseMirror `Node`:

```typescript
// Create a temporary editor to convert blocks to ProseMirror format
const tempEditor = BlockNoteEditor.create({ schema: customSchema });
tempEditor.replaceBlocks(tempEditor.document, SCRIPT_TEMPLATE);
const pmDoc = tempEditor.prosemirrorState.doc.toJSON();
sync.create(pmDoc);
```

This ensures the template is correctly serialized in ProseMirror's format for the sync layer.

## Authentication

Use **Convex Auth** (`@convex-dev/auth`) with Google OAuth as the sign-in method. Convex Auth manages user records internally via its own `authTables` — no separate `users` table needed.

**Setup:**
1. Install `@convex-dev/auth` and `@auth/core@0.37.0`
2. Run `npx @convex-dev/auth` to initialize (generates `convex/auth.config.ts`, `convex/auth.ts`, `convex/http.ts`)
3. Add `authTables` to `convex/schema.ts`
4. Configure Google OAuth provider in `convex/auth.ts`

**Schema with authTables:**
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  scripts: defineTable({
    userId: v.id("users"), // references authTables.users
    title: v.string(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_updated", ["userId", "updatedAt"]),
});
```

Note: `authTables` provides the `users` table automatically. The `scripts.userId` references the auth-managed `users` table.

**Auth provider config (`convex/auth.ts`):**
```typescript
import Google from "@auth/core/providers/google";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [Google],
});
```

**Client setup (`src/main.tsx`):**
```typescript
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

<ConvexAuthProvider client={convex}>
  <App />
</ConvexAuthProvider>
```

**User flow:**
1. User opens app → `ConvexAuthProvider` checks auth state
2. If not authenticated → shows login screen with Google sign-in button
3. Login uses `signIn("google")` from `@convex-dev/auth/react`
4. Convex Auth handles the OAuth flow and creates/updates the user in its internal `users` table
5. Backend functions use `ctx.auth.getUserIdentity()` to get the authenticated user
6. To get the user's `_id` for the `scripts` table, query `users` by `tokenIdentifier`

**Environment variables:**
- `AUTH_GOOGLE_ID` — Google OAuth client ID (set in Convex dashboard)
- `AUTH_GOOGLE_SECRET` — Google OAuth client secret (set in Convex dashboard)
- `CONVEX_SITE_URL` — The HTTP Actions URL for OAuth callback

**Dependencies:** `@convex-dev/auth`, `@auth/core@0.37.0`

## Micro Learning

Each module has a predefined educational tip stored in the `moduleHeader` block's `microLearning` prop. These tips are hardcoded in the template (they're part of the methodology, not user content).

**Tips content (same as v1):**

- Module 0: "O titulo e a thumbnail sao responsaveis por 80% dos cliques. Pense neles como a vitrine da sua loja."
- Module 1: "Os primeiros 30 segundos decidem se o espectador fica ou sai. Use o gancho ODA: Objetivo, Dificuldade, Ancora."
- Module 2-3: "O espectador precisa confiar em voce antes de absorver o conteudo. Mostre quem voce e de forma autentica."
- Module 4: "Use a Regra de 3: divida o conteudo em 3 partes claras. Isso facilita a compreensao e retencao."
- Module 5-6: "Nunca termine abruptamente. A saida invisivel faz o espectador sentir que o proximo passo e natural."

These render as collapsible callouts with a lime left border. Expanded by default for first-time users, collapsible once read.

## Routing

Use `wouter` (lightweight ~1.5KB router) with two routes:

- `/` — Dashboard (script list)
- `/editor/:scriptId` — Editor with BlockNote

```typescript
// src/App.tsx
import { Route, Switch } from "wouter";

function App() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/editor/:scriptId" component={Editor} />
    </Switch>
  );
}
```

## Theming

BlockNote uses Mantine's theme system. For the dark theme:

```typescript
const editor = useCreateBlockNote({
  // ... other config
});

<BlockNoteView editor={editor} theme="dark" />
```

Additional dark theme styling is applied via Tailwind CSS on the page wrapper and custom CSS variables for BlockNote's internal elements (background, text colors, borders) to match a **lime-on-dark** aesthetic. The accent color is lime/green (e.g., `#84cc16` / Tailwind's `lime-500`) instead of orange.

## Template Definition

The script template is a constant array of BlockNote blocks defined in `src/blocks/template.ts`. It contains the full module structure with all fields. Example:

```typescript
const SCRIPT_TEMPLATE: PartialBlock[] = [
  { type: "moduleHeader", props: { moduleId: "0", moduleNumber: "0", moduleTitle: "A Vitrine", microLearning: "O titulo e a thumbnail sao responsaveis por 80% dos cliques..." } },
  { type: "scriptField", props: { label: "Titulo do Video", placeholder: "Clique para digitar o titulo...", moduleId: "0" } },
  { type: "scriptField", props: { label: "Ideia da Thumbnail", placeholder: "Descreva a ideia da thumbnail...", moduleId: "0" } },
  // ... remaining modules follow the same pattern
];
```

The template conversion to ProseMirror format for `sync.create()` is described in the "Template Initialization and ProseMirror Conversion" section above.

## Migration from v1

This is a rebuild, not a migration. The v1 wizard code (`App.tsx`, `Preview.tsx`, `Microlearning.tsx`, `types.ts`) will be replaced entirely. The Convex schema changes (adds `users` table, changes `scripts` structure). Existing scripts in the old format are not migrated — this is acceptable given the project is pre-production.

## Out of Scope

- Collaborative editing (multi-user on same document) — prosemirror-sync supports it but we don't need it for v1 of the rebuild
- Export to PDF/DOCX
- Template customization (users creating their own module structures)
- Payment/billing
- Mobile-specific layout (responsive is fine, but no dedicated mobile app)

## File Structure (target)

```
src/
  main.tsx                    # Entry point with ConvexAuthProvider
  App.tsx                     # Router (dashboard vs editor)
  index.css                   # Tailwind + custom theme
  components/
    Dashboard.tsx             # Script list/grid
    ScriptCard.tsx            # Individual script card
    Editor.tsx                # BlockNote editor wrapper
    EditorTopBar.tsx          # Back, title, AI analyze button
    AIAnalysisPanel.tsx       # Slide-out panel for full analysis results
    LoginScreen.tsx           # Google auth login (uses @convex-dev/auth/react)
  blocks/
    moduleHeader.tsx          # Custom BlockNote block: module header + micro learning
    scriptField.tsx           # Custom BlockNote block: editable field
    schema.ts                 # BlockNote schema with custom blocks
    template.ts               # The default script template (array of blocks)
  hooks/
    useAuth.ts                # Auth hook for ConvexProviderWithAuth
  lib/
    utils.ts                  # cn() utility (keep from v1)
convex/
  schema.ts                   # Updated schema (authTables + scripts)
  convex.config.ts            # App config with prosemirror-sync component
  auth.ts                     # Convex Auth setup with Google provider
  auth.config.ts              # Generated by npx @convex-dev/auth
  scripts.ts                  # CRUD for script metadata
  ai.ts                       # AI actions (suggest, analyze)
  http.ts                     # HTTP routes (Convex Auth + BlockNote AI proxy)
  prosemirrorSync.ts          # Sync API exports
```

## Success Criteria

1. User can create a new script and see the full template structure immediately
2. User can edit any field inline and see changes in real-time
3. Micro learning tips are visible and collapsible per module
4. AI can suggest content for individual fields
5. AI can analyze the complete script and provide feedback
6. Scripts auto-save to Convex in real-time (no save button)
7. User must log in to access their scripts
8. Dashboard shows all user's scripts with basic metadata
