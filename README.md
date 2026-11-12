# Parcelix — Smart Parcel & Logistics Management

Parcelix is a smart courier and logistics management platform built with **React** and **FastAPI**. It helps users book parcels, track deliveries, and manage shipments efficiently. Administrators can manage parcels and users through a dedicated dashboard.

## Features

- User registration and login
- JWT-based authentication
- Role-based access control for users and administrators
- Parcel booking and tracking
- Parcel management (Create, Read, Update, Delete)
- User management for administrators
- Password reset functionality
- Search and filtering support
- Admin and user dashboards
- Secure authentication and authorization

## Technology Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- DaisyUI
- React Icons
- React Hot Toast

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- SQLite for local development
- PostgreSQL for production

## Project Structure

```text
courier-logistics/
├── backend/
│   ├── app/
│   ├── .env.example
│   ├── requirements.txt
│   └── create_admin.py
├── frontend/
│   ├── src/
│   ├── public/
│   └── .env.example
└── README.md
```

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Create a Python virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment.

   **Windows (Git Bash):**

   ```bash
   source venv/Scripts/activate
   ```

   **Windows (PowerShell):**

   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Create a `.env` file using `.env.example` as a reference.

6. Configure the required environment variables.

7. Start the development server:

   ```bash
   uvicorn app.main:app --reload
   ```

Backend API: http://127.0.0.1:8000

API Documentation: http://127.0.0.1:8000/docs

### Frontend Setup

1. Open another terminal and navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file using `.env.example` as a reference.

4. Configure `VITE_API_BASE_URL` to point to your backend API.

5. Start the development server:

   ```bash
   npm run dev
   ```

Frontend: http://localhost:5173

## Environment Variables

Refer to the following example files for the required environment configuration:

- `backend/.env.example`
- `frontend/.env.example`

**Security:** Never commit real environment files, passwords, database credentials, JWT secret keys, or other sensitive information to version control.

## Live Demo

- **Frontend:** https://comforting-axolotl-d296aa.netlify.app/
- **Backend API:** https://courierconnect-logistics.onrender.com
- **API Documentation:** https://courierconnect-logistics.onrender.com/docs
- **GitHub Repository:** https://github.com/NusratJahanKaifa/Courier-and-Logistics-Management-Platform

## License

No license has been specified yet.
