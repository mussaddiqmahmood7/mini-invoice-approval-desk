# 🔨 Sledge — Mini Invoice Approval Desk

> **The Builders AI Office** | Full Stack Engineering Assignment  
> Built by **Mussaddiq Mahmood** (`mussaddiqmahmood7@gmail.com`)

A production-grade, industrial-aesthetic invoice approval desk designed for modern construction builders and subcontractors. Built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Drizzle ORM** over **PostgreSQL**.

---

## 🏗️ Table of Contents

1. [Features & Design System](#-features--design-system)
2. [Database Schema & Architecture](#-database-schema--architecture)
3. [Invoice Status Lifecycle](#-invoice-status-lifecycle)
4. [REST API Reference](#-rest-api-reference)
5. [Sample Construction Invoices & Duplicate Handling](#-sample-construction-invoices--duplicate-handling)
6. [Quickstart & Setup Instructions](#-quickstart--setup-instructions)
7. [Testing & Verification](#-testing--verification)

---

## 🎨 Features & Design System

- **Industrial Builder Aesthetic**: Crafted specifically for the construction tech domain using deep zinc/slate tones (`zinc-950`, `zinc-900`), high-visibility amber accent (`#F59E0B` — *Sledge* signature), and monospaced tabular numerals (`tabular-nums font-mono`) for precision financial accounting.
- **Top KPI Stats Bar**: Real-time aggregate count and dollar volume metrics across all 4 operational states (`Processing`, `Needs Review`, `Approved`, `Rejected`).
- **3 Tab Ledger Navigation**:
  - `Processing`: Invoices in intake / OCR / automated extraction pipeline.
  - `Needs review`: Invoices flagged for review, highlighted with amber pulse badges for duplicate conflicts.
  - `Approved & Rejected`: Finalized ledger decisions with audit history.
- **Search & Vendor Filters**: Instant multi-condition query engine by invoice number, contractor name, and trade vendor dropdown.
- **Slide-Over Detail View (Drawer)**:
  - Slide-over drawer displaying contractor details, tax ID, and dates.
  - **Duplicate Comparison Diff**: High-confidence side-by-side visual diff matching the flagged invoice against the original ledger invoice.
  - Line items breakdown with quantities, unit rates, and totals.
  - Chronological audit history timeline detailing transitions, actors, and notes.
- **Contractor Action Desk**:
  - **Approve**: Instant one-click approval with audit log recording.
  - **Reject**: Modal prompt requiring a contractual/audit reason (with pre-configured quick presets for construction change orders and rate discrepancies).
- **1-Click Seed & Reset**: Accessible directly via UI top bar or CLI (`pnpm db:seed`).

---

## 🗄️ Database Schema & Architecture

The database schema is managed using **Drizzle ORM** with PostgreSQL.

```mermaid
erDiagram
    invoices ||--o{ invoice_items : "contains"
    invoices ||--o{ invoice_status_history : "records"
    invoices ||--o| invoices : "duplicate_of"

    invoices {
        uuid id PK
        varchar invoice_number UK
        varchar vendor_name
        text vendor_address
        varchar vendor_tax_id
        timestamp issue_date
        timestamp due_date
        varchar currency
        numeric subtotal
        numeric tax_amount
        numeric total_amount
        varchar status
        jsonb flags
        uuid duplicate_of_id FK
        text notes
        timestamp created_at
        timestamp updated_at
    }

    invoice_items {
        uuid id PK
        uuid invoice_id FK
        text description
        numeric quantity
        numeric unit_price
        numeric amount
        timestamp created_at
    }

    invoice_status_history {
        uuid id PK
        uuid invoice_id FK
        varchar from_status
        varchar to_status
        varchar actor
        text note
        timestamp created_at
    }
```

### Table Breakdown

1. **`invoices`**:
   - `id`: UUID Primary Key (`gen_random_uuid()`).
   - `invoice_number`: Unique invoice identifier (e.g., `INV-STL-2094`).
   - `vendor_name`: Subcontractor or trade supplier name.
   - `duplicate_of_id`: **Self-referencing foreign key** pointing back to `invoices.id`. Enabled with `ON DELETE SET NULL`.
   - `flags`: JSONB array storing machine-readable tags (e.g., `["DUPLICATE_SUSPECTED"]`, `["UNAUTHORIZED_OVERTIME_RATE"]`).
   - `status`: String enum (`PROCESSING`, `NEEDS_REVIEW`, `APPROVED`, `REJECTED`).
2. **`invoice_items`**:
   - `invoice_id`: Foreign key with `ON DELETE CASCADE`.
   - Itemized descriptions, quantities, unit prices, and extended amounts.
3. **`invoice_status_history`**:
   - `invoice_id`: Foreign key with `ON DELETE CASCADE`.
   - Immutable audit trail tracking every transition from `from_status` to `to_status`, timestamp, actor, and reason.

---

## 🔄 Invoice Status Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PROCESSING: OCR Intake / Ingestion
    PROCESSING --> NEEDS_REVIEW: Anomaly / Duplicate / Threshold Exceeded
    PROCESSING --> APPROVED: Auto-match PO & Draw Cleared
    PROCESSING --> REJECTED: Contract Discrepancy
    NEEDS_REVIEW --> APPROVED: Engineer Verifies Daily Logs
    NEEDS_REVIEW --> REJECTED: Engineer Flags Duplicate / Unauthorized Rate
```

### Transition Guarantees
- Every update to `invoices.status` executes inside an **atomic database transaction**.
- A new record in `invoice_status_history` is written concurrently to maintain a 100% verifiable audit trail.
- Redundant transitions (e.g., attempting to approve an already approved invoice) are rejected with HTTP 400.

---

## 🔌 REST API Reference

### 1. List Invoices with Aggregates
- **Endpoint**: `GET /api/invoices`
- **Query Parameters**:
  - `tab`: `processing` | `needs_review` | `approved_rejected` | `all`
  - `search`: Filter by invoice number or vendor name (case-insensitive)
  - `vendor`: Filter by specific contractor name
- **Response**:
  ```json
  {
    "success": true,
    "data": [ /* invoices with items and statusHistory */ ],
    "stats": {
      "processingCount": 2,
      "processingAmount": 27680,
      "needsReviewCount": 2,
      "needsReviewAmount": 85600,
      "approvedCount": 1,
      "approvedAmount": 14120,
      "rejectedCount": 1,
      "rejectedAmount": 6750,
      "totalCount": 6,
      "totalAmount": 134150
    },
    "vendors": [ "Apex Concrete & Masonry Supply", "Titan Structural Steel Fabricators", ... ]
  }
  ```

### 2. Get Invoice Detail & Duplicate Comparison
- **Endpoint**: `GET /api/invoices/:id`
- **Response**: Returns invoice object with nested `items`, `statusHistory`, and populated `duplicateOf` relation for instant diffing.

### 3. Update Invoice Status
- **Endpoint**: `PATCH /api/invoices/:id/status`
- **Body** (Zod-validated):
  ```json
  {
    "status": "APPROVED", // or "REJECTED"
    "note": "Approved for draw #4 payment based on certified compaction logs",
    "actor": "Mussaddiq Mahmood (Project Engineer)"
  }
  ```
- **Response**: HTTP 200 with updated invoice and new audit log entry.

### 4. Seed Database
- **Endpoint**: `POST /api/seed`
- **Response**: Resets and populates the database with 6 construction invoices.

---

## 📦 Sample Construction Invoices & Duplicate Handling

The seed dataset models real-world commercial construction billing:

| Invoice # | Contractor / Vendor | Amount | Status | Scenario Details |
| :--- | :--- | :---: | :---: | :--- |
| `INV-CON-1041` | Apex Concrete & Masonry | \$18,450.00 | `PROCESSING` | 4000 PSI foundation pour + 38M boom pump rental |
| `INV-STL-2094` | Titan Structural Steel | \$42,800.00 | `NEEDS_REVIEW` | High-strength W14x90 steel beams (Original submission) |
| `INV-STL-2094-DUP` | Titan Structural Steel | \$42,800.00 | `NEEDS_REVIEW` | **Duplicate Flagged**: Matches `INV-STL-2094` on items & total |
| `INV-ELC-3105` | VoltWorks Electrical | \$9,230.00 | `PROCESSING` | 480V 3-phase commercial main distribution panel |
| `INV-EXC-4012` | Bulldog Earthmoving | \$14,120.00 | `APPROVED` | Mass excavation + offsite clean fill hauling |
| `INV-PLM-5088` | Keystone Plumbing | \$6,750.00 | `REJECTED` | Rejected: Emergency overtime rate (\$165/hr) exceeds agreement |

---

## 🚀 Quickstart & Setup Instructions

### Prerequisites
- Node.js 18+ or 22+
- pnpm (or npm)
- Docker (optional for local database)

### Option 1: 1-Command Local PostgreSQL (Docker Compose)

1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Default connection string is already configured for local Docker: `postgres://postgres:postgrespassword@localhost:5433/sledge_invoices`)*
3. Push schema migrations:
   ```bash
   pnpm db:push
   # or: npm run db:push
   ```
4. Seed the sample invoices:
   ```bash
   pnpm db:seed
   # or: npm run db:seed
   ```
5. Start the development server:
   ```bash
   pnpm dev
   # or: npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

### Option 2: Cloud PostgreSQL (Neon / Supabase)

1. Create a database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Set your `DATABASE_URL` in `.env`:
   ```env
   # Neon example:
   DATABASE_URL="postgresql://user:password@ep-something.us-east-2.aws.neon.tech/sledge_invoices?sslmode=require"

   # Supabase example:
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
3. Push schema:
   ```bash
   pnpm db:push
   ```
4. Seed data:
   ```bash
   pnpm db:seed
   ```
5. Start app:
   ```bash
   pnpm dev
   ```

---

## 🎙️ Note for Sledge Application

> As requested in the email, Mussaddiq Mahmood will include the 1-minute audio recording reading the passage:
>
> *"Every building starts with a plan. Before a single wall goes up, a team decides what the building will look like and how it will be used. Workers measure the land, order materials, and set a schedule.*
> 
> *Building something big takes many people working together. Carpenters frame the walls. Electricians run the wires. Plumbers connect the pipes. Each person depends on the others to finish their part on time.*
> 
> *Good communication keeps a project moving. When someone changes a plan, everyone needs to know quickly. A small mistake on paper can become a big problem on the job site.*
> 
> *Today, new tools help teams stay organized. Instead of searching through stacks of paper, workers can check a phone or tablet to see what needs to be done next.*
> 
> *In the end, every finished building is proof of careful planning, hard work, and teamwork."*
