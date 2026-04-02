# Restaurant Owner Frontend

This frontend is the owner-side interface for the dine-in QR ordering system. It lets a restaurant owner sign up, log in, and move into a dashboard where incoming table orders can be viewed by status.

## Technologies Used

- React 19
- Vite
- React Router DOM
- Plain CSS
- Fetch API
- Browser localStorage for session persistence

## What This Frontend Contains

- Signup page for restaurant owners
- Login page for returning owners
- OTP verification page
- Dashboard view after authentication
- Route protection for the owner dashboard
- Order board grouped into `new`, `pending`, and `accepted`
- Backend-connected order status updates
- Responsive layout for desktop and mobile

## How It Works

1. The owner lands on an authentication screen.
2. They can choose `Sign up` or `Login`.
3. Signup sends the owner data to the backend.
4. The owner verifies the account using the OTP emailed from the backend.
5. Login is allowed only after verification.
6. The dashboard loads restaurant orders from the backend.
7. Each order card can be moved between `new`, `pending`, and `accepted`.

## Main Files

- `src/App.jsx`: auth flow, dashboard logic, and local state
- `src/components/`: reusable routed UI parts
- `src/pages/`: route-level pages
- `src/services/`: backend API calls
- `src/App.css`: component-specific layout and dashboard styling
- `src/index.css`: global theme, typography, and page background

## Running the Frontend

Use these commands inside the `Frontend` folder:

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
```

Create your frontend env file from `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

## Notes

- Session data is stored in `localStorage`, but signup/login/verification and orders are now connected to the backend APIs.
- Use `.env.example` as the template for the frontend environment file.
- This README is intentionally separate from the backend README so each side of the project can be maintained independently.
