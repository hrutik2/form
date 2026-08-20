# Backend

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your MongoDB Atlas connection string.
3. Install dependencies with `pip install -r requirements.txt`.
4. Run with `uvicorn app.main:app --reload`.

Default seeded admin:

- Email: `admin@example.com`
- Password: `admin123`
