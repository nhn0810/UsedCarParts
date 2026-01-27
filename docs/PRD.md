# Product Requirements Document (PRD): Used Car Parts E-commerce (Carrot Market Style)

## 1. Executive Summary
**Project Name:** Used Auto Parts Market (Hypothetical Name: *Carrot Parts*)
**Goal:** To build a minimalist, mobile-first e-commerce platform for used car parts, leveraging a serverless architecture (Next.js + Supabase) to ensure high performance, SEO optimization, and ease of maintenance.
**Target Audience:** Car owners looking for affordable parts, independent mechanics, and car enthusiasts.
**Key Differentiator:** "Carrot Market" aesthetic – clean, simple, and trustworthy, contrasting with the typically cluttered and outdated interfaces of existing auto parts sites.

## 2. Technical Architecture

### 2.1 Stack
-   **Frontend & Framework:** Next.js 14+ (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS (Mobile-first, Custom Design Tokens)
-   **Database:** Supabase (PostgreSQL)
-   **Authentication:** Supabase Auth
-   **Storage:** Supabase Storage (for product images)
-   **Deployment:** Vercel

### 2.2 Core Principles
-   **Serverless First:** No dedicated backend server. Logic handled via Server Actions and Route Handlers.
-   **SEO Optimized:** Heavy use of Server Server Components (RSC) for initial page loads and data fetching.
-   **Dynamic Navigation:** Menu and filters driven by DB content, not hardcoded.

## 3. Core Features

### 3.1 Global Navigation Bar (GNB)
-   **Logo:** Simple, localized text or icon.
-   **Search:** Integrated search bar with "Search as you type" or submission-based keyword search (utilizing Supabase Full Text Search).
-   **Menu/Auth:** Login/Logout toggle, accessible menu for profile and settings.

### 3.2 Dynamic Categorization
-   **Brands:** Fetched from `brands` table (e.g., Hyundai, Kia, BMW).
-   **Categories:** Fetched from `categories` table (e.g., Engine, Suspension, Interior).
-   **Filter UI:** 3-Depth interaction model:
    1.  Select Brand
    2.  Select Category
    3.  Select Year (Optional)

### 3.3 Product Listing
-   **Layout:**
    -   **Mobile:** Linear list or 2-column grid.
    -   **Desktop:** Extended grid (responsive).
-   **Card Component:**
    -   Large, high-quality thumbnail (object-cover).
    -   Title (Part Name).
    -   Price (Bold, strictly formatted).
    -   Meta info (Year, Region/Status) in muted colors.
-   **Pagination:** Infinite scroll or "Load More" button preferred for mobile experience.

### 3.4 Product Detail (Future Scope - Phase 2)
-   Detailed images carousel.
-   Seller profile summary.
-   "Chat" or "Buy" call-to-action.

### 3.5 Admin / Management (Future Scope)
-   Dashboard to add/edit brands and categories (affects frontend immediately).

## 4. Data Model (Schema)

### 4.1 Tables
-   **profiles**: `id` (references auth.users), `username`, `avatar_url`, `created_at`.
-   **brands**: `id`, `name` (unique), `logo_url`.
-   **categories**: `id`, `name`, `parent_id` (self-referencing for sub-categories).
-   **products**:
    -   `id`: UUID
    -   `title`: Text
    -   `description`: Text
    -   `price`: Integer
    -   `images`: Text[] (Array of URLs)
    -   `brand_id`: FK to brands
    -   `category_id`: FK to categories
    -   `year`: Integer
    -   `status`: Enum ('available', 'reserved', 'sold')
    -   `user_id`: FK to profiles
    -   `created_at`: Timestamp

## 5. UI/UX Guidelines
-   **Color Palette:**
    -   Primary: Deep Orange (Carrot-like) or a trustworthy Blue.
    -   Background: `bg-gray-50` for lists, `bg-white` for cards.
    -   Text: `text-gray-900` (Primary), `text-gray-500` (Secondary).
-   **Typography:** Sans-serif (Inter or Pretendard), crisp and legible.
-   **Spacing:** Generous padding (p-4), rounded corners (rounded-xl or 2xl).
-   **Interactions:** Smooth transitions on hover, active states for filters.

## 6. Implementation Plan
1.  **Setup:** Initialize Next.js, configure Tailwind, setup Supabase client.
2.  **DB:** Create tables and RLS policies in Supabase.
3.  **Foundation:** Create generic UI components (Card, Button, Input).
4.  **Feature - Filters:** Implement the dynamic filter logic communicating with DB.
5.  **Feature - Listing:** Create the main feed reading from `products`.
6.  **Refine:** Polish UI, ensure responsiveness.

---
*Created by Antigravity Agent*
