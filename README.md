# RecoverAI — AI Business Recovery & Receivables Management System

**RecoverAI** is a modern, high-performance, responsive SaaS web application engineered to help modern businesses recover overdue invoices, manage delinquent receivables, orchestrate customer follow-ups, and automate contextual payment communications using AI.

Designed with a Stripe- and Linear-grade design aesthetic, RecoverAI enforces strict accounting ledger integrity, multi-tenant business isolation, and zero-hallucination compliance.

---

## 1. Key Features

- **Executive Receivables Dashboard**: Real-time KPI summaries (Total Outstanding, Overdue Amount, Collections This Month, Follow-ups Due Today), 6-month collection vs. receivables trajectory chart, overdue alerts, and actionable AI recommendations.
- **Full Invoice Management**: Complete lifecycle tracking with overdue days calculation, partial and full payment recording, CSV batch import, CSV export, and filtering by payment terms and aging brackets.
- **Customer Directory**: Customer profiles, credit terms (Net 15, Net 30, Net 45), complete invoice ledgers, and contact audit logs.
- **Follow-up Scheduling Engine**: Queue-based workflow (*Today's Queue*, *Overdue*, *Upcoming*, *Completed*, *All Records*), message preview, manual call logging, and reschedule capabilities.
- **AI Payment Recovery Assistant**: Contextual payment reminder generation powered by OpenAI GPT-4o (with deterministic fallback). Reminders strictly use verified database ledger amounts and due dates—zero legal threats or hallucinations.
- **Immutable Audit Trail**: Chronological event tracking of invoice creation, payment clearances, reminder dispatches, and customer communications.
- **Financial Analytics & Reporting**: Aging analysis (1–30, 31–60, 61–90, 90+ days), portfolio donut breakdown, top debtor distribution, and collection velocity metrics.
- **Tenant Security & Isolation**: Business-level query filtering on all models, bcrypt password hashing, and JWT bearer authentication.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19 with Vite 8
- **Language**: JavaScript (ESM)
- **Styling**: Vanilla CSS3 design system with customized HSL tokens, CSS variables, and responsive layout
- **Icons**: Lucide React
- **Charts**: Recharts
- **Routing**: React Router DOM (v7)
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios with automatic JWT interceptors

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js 5
- **Database**: MongoDB (Atlas or local) with Mongoose 9
- **Authentication**: JSON Web Tokens (JWT) + bcryptjs
- **Security & Rate Limiting**: express-rate-limit, CORS, tenant query scoping
- **AI Integration**: OpenAI GPT-4o / configurable AI synthesis service

---

## 3. Directory Structure

```
recoveryai/
├── backend/
│   ├── server.js                  # Main Express entry point & middleware mounting
│   ├── config/
│   │   ├── db.js                  # MongoDB Mongoose connection with fallback handling
│   │   └── seed.js                # Initial tenant & ledger seeding for fresh databases
│   ├── models/
│   │   ├── Business.js            # Tenant entity schema
│   │   ├── User.js                # User accounts with bcrypt hashing & role scoping
│   │   ├── Customer.js            # Client accounts with terms & contact information
│   │   ├── Invoice.js             # Financial invoices with backend recalculation hooks
│   │   ├── Payment.js             # Verified payment transaction ledger
│   │   ├── FollowUp.js            # Scheduled customer communication records
│   │   └── Activity.js            # Immutable audit trail events
│   ├── controllers/
│   │   ├── authController.js      # Register, login, getMe
│   │   ├── customerController.js  # Customer CRUD & balance aggregation
│   │   ├── invoiceController.js   # Invoice CRUD, recalculation & CSV import
│   │   ├── paymentController.js   # Ledger payment recording & audit trail
│   │   ├── followUpController.js  # Follow-up queues & status lifecycle
│   │   ├── aiController.js        # Contextual reminder generation
│   │   └── reportController.js    # Dashboard KPIs, aging analysis & trends
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── followUpRoutes.js
│   │   ├── aiRoutes.js
│   │   └── reportRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT protection & tenant context attachment
│   │   └── errorMiddleware.js     # 404 & custom error formatters
│   ├── services/
│   │   ├── aiService.js           # OpenAI GPT-4o synthesis engine
│   │   └── reminderService.js     # Scheduling & audit helper
│   └── utils/
│       ├── currency.js            # INR formatting utilities
│       └── invoiceCalculations.js # Ledger validation & overdue formulas
├── src/
│   ├── App.jsx                    # Routing & global toast provider
│   ├── index.css                  # Core design tokens, typography, and card system
│   ├── components/
│   │   ├── common/                # StatCard, StatusBadge, PriorityBadge, Modal, ConfirmDialog, etc.
│   │   ├── layout/                # Sidebar, Topbar, AppLayout
│   │   ├── invoices/              # InvoiceFormModal, InvoiceDetailModal, PaymentModal, CsvImportModal
│   │   ├── customers/             # CustomerFormModal, CustomerDetailModal
│   │   └── followups/             # FollowUpFormModal, MessagePreviewModal
│   ├── pages/
│   │   ├── OverviewPage.jsx       # Dashboard overview with Recharts & tables
│   │   ├── InvoicesPage.jsx       # Complete invoice listing, filters & CSV export
│   │   ├── CustomersPage.jsx      # Customer directory with live balances
│   │   ├── FollowUpsPage.jsx      # Queue-based follow-up scheduler
│   │   ├── AiAssistantPage.jsx    # Interactive AI reminder generator
│   │   ├── ActivityHistoryPage.jsx# Chronological audit feed
│   │   ├── ReportsPage.jsx        # Aging analysis & receivables analytics
│   │   └── SettingsPage.jsx       # Business profile, AI guardrails & account settings
│   ├── services/
│   │   ├── api.js                 # Axios API service with JWT interceptor
│   │   ├── aiService.js           # Client-side AI fallback service
│   │   └── mockData.js            # Baseline fictional demo data
│   └── utils/
│       └── currency.js            # INR currency formatting & status computation
├── package.json
└── vite.config.js                 # Vite dev server with proxy to backend port 5000
```

---

## 4. Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (optional for local persistence; defaults to graceful fallback when MongoDB is not running locally)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd recoveryai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the configuration variables suit your environment:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/recoverai
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Development Servers

**Run Frontend Dev Server (Vite):**
```bash
npm run dev
```
The frontend will start at `http://localhost:5173`.

**Run Backend API Server (Node.js / Express):**
```bash
npm run server
```
Or with automatic reload:
```bash
npm run server:watch
```
The API server will listen on `http://localhost:5000`.

---

## 5. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new business tenant & primary admin | No (Rate Limited) |
| `POST` | `/api/auth/login` | Authenticate with email & password, returns JWT | No (Rate Limited) |
| `GET` | `/api/auth/me` | Fetch active user credentials and business identity | Yes |

### Customer Accounts (`/api/customers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/customers` | List all tenant customers with live aggregated balances | Yes |
| `GET` | `/api/customers/:id` | Fetch customer profile and invoice history | Yes |
| `POST` | `/api/customers` | Create new client record | Yes |
| `PUT` | `/api/customers/:id` | Update client details and payment terms | Yes |
| `DELETE` | `/api/customers/:id` | Remove customer record | Yes |

### Invoices (`/api/invoices`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/invoices` | List invoices with filters (`status`, `search`, `overduePeriod`) | Yes |
| `GET` | `/api/invoices/:id` | Fetch detailed invoice record | Yes |
| `POST` | `/api/invoices` | Create invoice with backend ledger recalculation | Yes |
| `PUT` | `/api/invoices/:id` | Update invoice details | Yes |
| `DELETE` | `/api/invoices/:id` | Delete invoice | Yes |
| `POST` | `/api/invoices/import-csv` | Bulk import an array of parsed CSV invoice rows | Yes |

### Payments (`/api/invoices/:id/payments`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/invoices/:id/payments` | Record payment, update balance, and log activity | Yes |
| `GET` | `/api/invoices/:id/payments` | List payment ledger for specific invoice | Yes |

### Follow-up Schedules (`/api/follow-ups`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/follow-ups` | List follow-ups with queue filters (`today`, `upcoming`, `overdue`) | Yes |
| `POST` | `/api/follow-ups` | Schedule new customer touchpoint | Yes |
| `PUT` | `/api/follow-ups/:id` | Edit scheduled follow-up parameters | Yes |
| `PATCH` | `/api/follow-ups/:id/status` | Mark completed, rescheduled, or update notes | Yes |

### AI Reminders (`/api/ai`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/ai/generate-reminder` | Generate context-aware reminder from ledger data | Yes (Rate Limited) |

### Dashboard & Reports (`/api`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/dashboard/summary` | Receivables KPIs (Total, Overdue, Collections, Due Today) | Yes |
| `GET` | `/api/dashboard/collection-trend` | 6-month trajectory of collected vs. outstanding | Yes |
| `GET` | `/api/reports/receivables` | Aging brackets (1-30, 31-60, 61-90, 90+) & portfolio distribution | Yes |
| `GET` | `/api/activities` | Chronological audit trail feed with event filtering | Yes |

---

## 6. Financial Integrity & Security Guarantees

1. **Recalculation on the Backend**:
   - `Remaining Amount = Total Amount - Amount Paid`
   - Fully paid invoices automatically clear overdue status (`daysOverdue = 0`).
   - Payment amounts greater than the remaining balance are rejected with a 400 validation error.
2. **Tenant Isolation**:
   - Every database query for customers, invoices, follow-ups, and audit logs is strictly scoped by `businessId`.
   - Users cannot view or modify another company's records.
3. **Zero-Hallucination AI Architecture**:
   - AI prompts receive verified database values (exact invoice number, amount, maturity date).
   - Anti-harassment constraints prevent hostile legal threats or unauthorized settlement promises.
4. **Audit Logging**:
   - Critical events (invoice creation, payment recording, reminder dispatch) automatically generate immutable `Activity` entries.

---

## 7. Production Build & Deployment

### Build the Frontend Bundle:
```bash
npm run build
```
Optimized assets will be compiled into the `dist/` directory.

### Production Environment:
Set `NODE_ENV=production` in your `.env` file and supply a valid MongoDB Atlas connection string.
```bash
NODE_ENV=production
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/recoverai?retryWrites=true&w=majority
```
Then start the Node.js server:
```bash
npm run server
```

---

## 8. License

This project is proprietary software developed for RecoverAI. All rights reserved.
#   r e c o v e r y a i  
 