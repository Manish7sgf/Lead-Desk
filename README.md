# LeadDesk Mini — Full-Stack Lead Intake & Admin Triage System

LeadDesk Mini is a full-stack lead capture web application with a public lead intake form and a secure, real-time admin triage dashboard.

**Stack**: React + Vite + TailwindCSS (Frontend) | FastAPI + Uvicorn + Pydantic (Backend) | MongoDB Atlas (Database) | JWT HTTP Bearer (Auth).

---

## Live Deployment URLs & Test Credentials

- **Frontend App (Vercel)**: `https://leaddesk-mini.vercel.app` (or your deployed Vercel URL)
- **Backend API (Render)**: `https://leaddesk-mini-backend.onrender.com` (or your deployed Render URL)

### Test Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

> [!NOTE]
> **Render Free Tier Cold-Start Notice**: If the backend service has been idle, Render's free tier puts the web instance to sleep. The initial API request (login or form submission) may take 30–50 seconds to cold-start. Subsequent requests will be near-instantaneous.

---

## 1. Local Development Setup

### Prerequisites
- Python 3.9+ installed
- Node.js (v18+) and npm installed
- MongoDB connection string (or run using default fallback)

### Step 1: Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables (optional, defaults provided)
cp .env.example .env

# 5. Run the FastAPI development server
uvicorn app.main:app --reload --port 8000
```
*Backend API docs will be available at `http://localhost:8000/docs`.*

### Step 2: Frontend Setup
```bash
# Open a new terminal window and navigate to frontend directory
cd frontend

# 1. Install npm packages
npm install

# 2. Start the Vite development server
npm run dev
```
*Frontend app will be running at `http://localhost:5173`.*

---

## 2. Data Model (Schemas)

### MongoDB Collection: `leads`
```json
{
  "_id": "ObjectId('65b1234567890abcdef12345')",
  "name": "Alex Morgan",
  "email": "alex@company.com",
  "budget_range": "$5k-20k",
  "message": "Looking to overhaul our client onboarding portal with modern UX.",
  "status": "New",
  "created_at": "2026-07-24T18:15:00.000000+00:00"
}
```
- `budget_range`: Enum (`"<$1k"`, `"$1k-5k"`, `"$5k-20k"`, `"$20k+"`)
- `status`: Enum (`"New"`, `"Contacted"`, `"Closed"`) — default is `"New"`

### MongoDB Collection: `users` (Admin Authentication)
```json
{
  "_id": "ObjectId('65b9876543210fedcba54321')",
  "username": "admin",
  "password_hash": "$2b$12$...",
  "role": "admin"
}
```

---

## 3. Authentication Approach (JWT Bearer Token Flow)

- **Login Endpoint (`POST /api/auth/login`)**: Validates submitted admin credentials. Upon verification, issues a signed JWT access token encoding the username subject (`sub`) and expiration time.
- **Token Storage**: The frontend stores the token in `localStorage` (`leaddesk_token`).
- **Protected Requests**: The Axios client automatically injects `Authorization: Bearer <token>` on all outbound API calls.
- **Backend Protection (`Depends(get_current_admin)`)**: Protected FastAPI endpoints (`GET /api/leads`, `PATCH /api/leads/{id}`) intercept incoming Bearer tokens, decode the signature using `SECRET_KEY`, and enforce authorization before processing.
- **Route Guard & Session Expiration**: Frontend `AuthContext` guards `/admin`. If an invalid or expired token is presented, Axios catches the HTTP `401 Unauthorized` response, purges local storage, and redirects the user to `/login`.

---

## 4. Key Design Decisions & Rationale

1. **MongoDB Atlas (Document Model) over SQL**:
   *Rationale*: Lead inquiries frequently evolve as businesses capture new metadata (e.g. phone numbers, source channels, custom tags). MongoDB provides a flexible schema-less structure while allowing indexed sorting on `created_at` and instant string regex searching across names and emails.
2. **Stateless JWT Auth over Stateful Server Sessions**:
   *Rationale*: Hosting frontend on Vercel and backend on Render means static asset hosting and API servers are decoupled across distinct domains. JWT Bearer tokens provide stateless, cross-origin security without requiring shared Redis session storage or complex sticky cookies.
3. **Sleek, Table-First Triage UX over Generic Card Grids**:
   *Rationale*: Many admin templates clutter the UI with non-essential widgets and generic purple gradients. LeadDesk Mini prioritizes high-density readability: a concise metrics header, real-time search, clear budget pills, and inline status dropdowns for rapid triage.

---

## 5. Loom Walkthrough Script (2–3 Minute Video Guide)

- **Introduction (0:00 - 0:20)**:
  - Welcome viewer & state app name: *LeadDesk Mini*.
  - Point out public lead intake form & mandatory footer credit: `"Built for Digital Heroes Training Task"`.
- **Public Lead Submission (0:20 - 0:50)**:
  - Demonstrate client-side validation by clicking *Submit* with empty fields.
  - Fill out fields: Name (*"Jane Doe"*), Email (*"jane@techcorp.io"*), Budget (*"$5k-20k"*), Message (*"Need custom SaaS web application"*).
  - Submit form & showcase success confirmation screen.
- **Admin Authentication & Triage (0:50 - 1:45)**:
  - Click *Admin Portal* in top navbar. Note auto-redirect to `/login` due to route protection.
  - Enter incorrect credentials to demonstrate error alert.
  - Log in using valid admin credentials (`admin` / `admin123`).
  - Arrive at `/admin` dashboard — showcase Jane Doe's lead appearing at the top with status `"New"`.
- **Live Search & Status Update (1:45 - 2:20)**:
  - Type *"jane"* into the search bar to demonstrate real-time list filtering.
  - Change lead status from `"New"` to `"Contacted"` using the inline status dropdown.
  - Refresh the page to verify the updated status persisted in MongoDB database.
- **Logout & Security Conclusion (2:20 - 2:30)**:
  - Click *Logout* button in top navbar.
  - Attempt to navigate back to `/admin` manually — confirm immediate redirect to `/login`.
  - Wrap up video.

---

## 6. AI Usage Disclosure

- **Where AI was used**: AI was utilized to draft initial boilerplate templates for FastAPI pydantic validation schemas, setup Vite setup scripts, and craft responsive TailwindCSS layout classes.
- **What was manually refined/changed afterward**:
  - Custom JWT Bearer dependency logic was refactored to support fallback hashing and robust exception handling.
  - Added in-memory fallback handling inside database module so local development works seamlessly even if MongoDB Atlas credentials are not yet configured.
  - Custom designed the status badge pills, modal preview window for long lead messages, and explicit validation message mapping on the frontend.

---

## 7. Assumptions Made

- **Budget Ranges**: Defined standard business budget brackets (`<$1k`, `$1k-5k`, `$5k-20k`, `$20k+`) based on typical agency inquiry intake forms.
- **CORS Handling**: Configured FastAPI `CORSMiddleware` with dynamic origin parsing via `ALLOWED_ORIGINS` to allow seamless local development (`localhost:5173`) and cross-domain Vercel deployment.
- **Admin Provisioning**: Single-admin access seeded automatically on server startup with configurable environment variables (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
- **Footer Credit**: Visible on both public landing page and protected admin routes linked directly to `https://digitalheroesco.com` as required.
