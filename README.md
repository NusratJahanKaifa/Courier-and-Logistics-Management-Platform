# CourierConnect — Courier & Logistics Management Platform

CourierConnect is a courier and logistics management platform built with React and FastAPI. It helps users manage parcel deliveries and provides administrators with parcel and user management features.

## Features

- User registration and login
- JWT-based authentication
- Role-based access for users and administrators
- Parcel booking and tracking
- Parcel management
- User management for administrators
- Password reset functionality
- Search and filtering support

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
- JWT authentication
- SQLite for local development
- PostgreSQL support for production

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

## Setup

### Backend

1. Open a terminal in the `backend` directory.
2. Create and activate a Python virtual environment.
3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file based on `.env.example`.
5. Configure the required environment variables.
6. Start the development server:

   ```bash
   uvicorn app.main:app --reload
   ```

API documentation: http://127.0.0.1:8000/docs

### Frontend

1. Open a terminal in the `frontend` directory.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`.
4. Configure `VITE_API_BASE_URL` to point to your backend.
5. Start the development server:

   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:5173.

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the required configuration templates.

**Security:** Never commit real environment files, passwords, database credentials, or secret keys to version control.

## Live Demo

- **Frontend:** https://comforting-axolotl-d296aa.netlify.app/
- **Backend API:** https://courierconnect-logistics.onrender.com
- **API Documentation:** https://courierconnect-logistics.onrender.com/docs
- **GitHub Repository:** https://github.com/NusratJahanKaifa/Courier-and-Logistics-Management-Platform

## License

No license has been specified yet.
