# Project Task Breakdown

This document outlines the step-by-step implementation plan for the Used Car Parts E-commerce platform.

## Phase 1: Project Initialization & Infrastructure (Current Focus)
- [ ] **T1.1**: Initialize Next.js Project
    - App Router, TypeScript, Tailwind CSS, ESLint.
    - Clean up default boilerplate code.
- [ ] **T1.2**: Project Structure Setup
    - Create directories: `components/ui`, `lib/supabase`, `types`, `utils`.
- [ ] **T1.3**: Supabase Setup
    - Create Supabase credentials.
    - Set up environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    - Initialize Supabase Client (`lib/supabase/client.ts`, `lib/supabase/server.ts`).
- [ ] **T1.4**: Vercel Deployment Setup
    - Connect GitHub repository to Vercel.
    - Configure Environment Variables on Vercel.
    - Verify initial deployment.

## Phase 2: Database & Backend Logic
- [ ] **T2.1**: Database Schema Implementation
    - execute SQL for `profiles`, `brands`, `categories`, `products`.
    - Set up RLS (Row Level Security) policies.
- [ ] **T2.2**: Seed Data Generation
    - Create a script or manual SQL to insert initial `brands` and `categories`.
    - Insert sample `products` data.
- [ ] **T2.3**: Type Generation
    - Run Supabase CLI to generate TypeScript types from DB schema (`types/database.types.ts`).

## Phase 3: Core UI & Layout (Mobile First)
- [ ] **T3.1**: Global Layout (RootLayout)
    - Implement `fonts` (Inter/Pretendard).
    - Mobile-responsive container.
- [ ] **T3.2**: Global Navigation Bar (GNB)
    - Logo area.
    - Search input (visual only first).
    - Menu/Auth button.
- [ ] **T3.3**: Component Library Setup (shadcn/ui or Custom)
    - Button, Input, Card, Badge components.

## Phase 4: Product Listing & Filtering (Key Feature)
- [ ] **T4.1**: Product Card Component
    - Image listing, Price formatting, Meta info styling.
- [ ] **T4.2**: Main Feed (Server Component)
    - Fetch products from Supabase.
    - implement Grid layout (2-col mobile, 4-col desktop).
- [ ] **T4.3**: Dynamic Filter Logic
    - Create `SearchFilters` component.
    - Fetch `brands` and `categories` for filter options.
    - Update URL search params on selection.
- [ ] **T4.4**: Filter Backend Integration
    - Modiy Main Feed query to respect URL params (brand, category, search).

## Phase 5: Search Implementation
- [ ] **T5.1**: Text Search Feature
    - Implement debounced search input.
    - Connect to Supabase text search.
    - Show "No results" state.

## Phase 6: Polish & Optimization
- [ ] **T6.1**: SEO Metadata
    - Dynamic titles and descriptions.
- [ ] **T6.2**: Loading States
    - Skeleton screens for Product Grid.
- [ ] **T6.3**: Error Handling
    - Error boundaries for failed fetches.

## Phase 7: Product Details (Phase 2 Preview)
- [ ] **T7.1**: Product Detail Page (`product/[id]`)
    - Dynamic route setup.
    - Fetch single product data.
    - Back button navigation.

---
**Next Step:** Execute Phase 1 (Initialization & Connection).
