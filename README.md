# PV Store CRM

Operational CRM for a mobile-device store, built to centralize leads, customers, products, inventory, contracts, service orders and daily commercial indicators.

> **Project status:** functional engineering project. The repository demonstrates product and integration work, but is not presented as a finished multi-tenant SaaS or as commercially validated software.

## Product scope

The application provides an authenticated operational workspace with the following modules:

- dashboard
- leads
- customers
- products
- inventory
- contracts
- Kanban workflow
- checklists
- service orders
- configuration

The dashboard reads owner-scoped data from Supabase and calculates indicators such as:

- new leads
- active contracts
- monthly sales
- total revenue and expenses
- balance
- average ticket
- conversion rate
- products sold and available inventory

## Document and export workflows

The repository includes utilities for operational document generation and export, including:

- service-order PDF generation
- receipts
- contracts
- warranties
- checklists
- spreadsheet exports
- QR-code support

## Architecture

```text
React interface
      ↓
Supabase Auth
      ↓
Owner-scoped queries
      ↓
PostgreSQL data
```

The current application uses an `owner_id` boundary in its data queries. This is a useful ownership model for the present scope, but it should not be confused with a complete organization-based multi-tenant architecture.

## Technology stack

- React 18
- Vite 7
- Supabase Auth and PostgreSQL
- Chart.js and react-chartjs-2
- React Hook Form
- jsPDF, pdf-lib and jsPDF AutoTable
- SheetJS and Papa Parse
- QRCode
- ESLint

## Running locally

### Requirements

- Node.js 20 or newer
- npm
- a configured Supabase project

### Installation

```bash
git clone https://github.com/Joao-Matheus-Amorim/crmpvstore.git
cd crmpvstore
npm install
cp .env.example .env.local
npm run dev
```

Configure the environment variables before starting the application:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

The application intentionally fails fast when these variables are absent. No live project values are embedded in the source code.

## Available commands

```bash
npm run dev      # development server
npm run build    # production build
npm run lint     # static analysis
npm run preview  # preview the production build
```

## Engineering boundaries

The repository currently demonstrates:

- authenticated React application structure
- owner-scoped Supabase access
- operational dashboards and charting
- CRUD-oriented business modules
- document and spreadsheet generation
- desktop and mobile navigation patterns

Areas that should be strengthened before presenting the system as production-ready SaaS:

- explicit database migration documentation
- automated unit and end-to-end tests
- verified RLS policy suite
- organization and membership model
- granular authorization
- observability and recovery paths
- deployment and backup runbooks

## Why this repository remains public

This project shows an earlier stage of my product engineering work: turning a real store workflow into a connected operational interface. More recent projects in my profile demonstrate deeper multi-tenancy, RLS, permission modeling, durable background operations and automated verification.

## Author

**João Matheus Amorim**

- [GitHub profile](https://github.com/Joao-Matheus-Amorim)
- [LinkedIn](https://www.linkedin.com/in/jo%C3%A3o-matheus-70b61196/)
- [Email](mailto:joaomatheus.lab@gmail.com)
