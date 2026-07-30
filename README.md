# LeadDesk Mini 

LeadDesk Mini is a production-grade lead-capture SaaS platform designed for high-converting lead intake and pipeline management. It features a public-facing landing page with real-time form validation and anti-spam protection, paired with a secure `/admin` management dashboard to view, search, paginate, and update lead statuses across the conversion pipeline.

---

## 1. Project Overview

LeadDesk Mini provides a complete end-to-end lead management workflow. Visitors can submit project inquiries via a sleek responsive form. Administrators access a protected dashboard gated behind real JWT authentication stored in HTTP-only cookies, with capabilities to search leads by name or email, filter by pipeline status (`New`, `Contacted`, `Closed`), and perform optimistic status transitions.

---

## 2. Data Models

### 2.1 Lead (`LeadSchema`)
- **`_id`**: ObjectId (auto-generated)
- **`name`**: String (required, 2–80 characters, trimmed)
- **`email`**: String (required, valid email, lowercase, trimmed)
- **`budgetRange`**: String Enum (`"<1k"`, `"1k-5k"`, `"5k-20k"`, `"20k+"`)
- **`message`**: String (required, 10–1000 characters, trimmed)
- **`status`**: String Enum (`"New"`, `"Contacted"`, `"Closed"` — default: `"New"`)
- **`ipAddress`**: String (captured server-side for rate limiting & spam prevention)
- **`createdAt` / `updatedAt`**: Date (auto-managed Mongoose timestamps)

**Design Rationale:**
- Status is enforced as an Enum to guarantee pipeline state integrity and prevent arbitrary string values.
- Text index `LeadSchema.index({ name: "text", email: "text" })` enables fast, indexed text searches across name and email fields without scanning entire collections.

### 2.2 AdminUser (`AdminUserSchema`)
- **`_id`**: ObjectId (auto-generated)
- **`email`**: String (required, unique, lowercase, trimmed)
- **`passwordHash`**: String (required, bcrypt hash, `select: false` by default)
- **`createdAt`**: Date (auto timestamp)

**Design Rationale:**
- No public user registration endpoint exists. Accounts are created securely via a one-time seed script using environment variables.
- `passwordHash` has `select: false` to ensure password hashes are never leaked in general user queries.

---

## 3. Authentication & Security Architecture

### JWT + httpOnly Cookie Authentication Flow
1. **Login Request**: The admin submits credentials to `POST /api/auth/login`.
2. **Password Verification**: The backend fetches `AdminUser` with `+passwordHash` and compares the input using `bcrypt.compare`.
3. **Cookie Issuance**: Upon successful verification, the server generates a signed JWT token (7-day expiration) and sets it in an `httpOnly`, `secure` cookie named `token`.
4. **Cookie Security**:
   - `httpOnly: true`: Prevents client-side JavaScript access, neutralizing cross-site scripting (XSS) token theft.
   - `secure: true` (in production): Ensures token transmission strictly over HTTPS.
   - `sameSite: "none"` (in production): Required for cross-domain cookie transmission between frontend (Vercel) and backend (Render).
5. **Session Verification**: On frontend load, `AuthContext` calls `GET /api/auth/me`. The `requireAuth` middleware verifies the incoming token cookie and returns admin profile details.
6. **Logout**: `POST /api/auth/logout` clears the token cookie.

**Why httpOnly Cookies over localStorage?**
Storing JWT tokens in `localStorage` leaves applications vulnerable to XSS attacks where malicious third-party scripts or injected packages can steal tokens. Storing JWTs inside `httpOnly` cookies makes token extraction impossible via JavaScript.

---

## 4. Local Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone & Configure Environment Variables
Copy `.env.example` to `server/.env` and `client/.env`:

```bash
# In server/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/leaddesk?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@leaddesk.com
ADMIN_PASSWORD=SuperSecurePassword123!
```

```bash
# In client/.env
VITE_API_URL=http://localhost:5000/api
```

### 2. Install Dependencies & Seed Admin Account
```bash
# Install backend dependencies & seed admin user
cd server
npm install
npm run seed:admin

# Install frontend dependencies
cd ../client
npm install
```

### 3. Run Applications Locally
```bash
# Start backend dev server (Port 5000)
cd server
npm run dev

# In a separate terminal, start frontend dev server (Port 5173)
cd client
npm run dev
```

Visit `http://localhost:5173` for the landing page and `http://localhost:5173/admin/login` for the admin portal.

---

## 5. API Reference

Base Path: `/api`

| Endpoint | Method | Access | Description |
|---|---|---|---|
| `/leads` | `POST` | Public | Submit new lead (Rate limited: 5/10 min, Honeypot check) |
| `/auth/login` | `POST` | Public | Authenticate admin & receive httpOnly JWT cookie (Rate limited: 10/15 min) |
| `/auth/logout` | `POST` | Public | Clear JWT auth cookie |
| `/auth/me` | `GET` | Protected | Verify active session & return admin user info |
| `/leads` | `GET` | Protected | List paginated leads with `search`, `status`, `page`, `limit` params |
| `/leads/:id/status` | `PATCH` | Protected | Update lead status (`"New" \| "Contacted" \| "Closed"`) |
| `/leads/:id` | `GET` | Protected | Retrieve single lead details |

---

## 6. Deployment Notes

> TODO: add deployed URL here
- **Frontend Live URL**: `TODO: add deployed URL here`
- **Backend API Live URL**: `TODO: add deployed URL here`

*Note for production configuration:* Ensure `CLIENT_URL` on Render matches your exact Vercel frontend URL, and `NODE_ENV` is set to `production` so cookie flags automatically adjust to `sameSite: "none"` and `secure: true`.

---

## 7. Test Credentials

> TODO: add seeded admin test credentials here after deployment
- **Admin Email**: `admin@leaddesk.com`
- **Admin Password**: `SuperSecurePassword123!`

---

## 8. Video Walkthrough

> TODO: add Loom link here
