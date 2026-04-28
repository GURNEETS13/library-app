# Library Management System

Built with React + Vite

## How to Run
npm install
npm run dev

Open browser at http://localhost:5173

## Login Credentials

| Role  | Username | Password | Access |
|-------|----------|----------|--------|
| Admin | adm      | adm      | Maintenance + Reports + Transactions |
| User  | user     | user     | Reports + Transactions only |

## Features

### Transactions
- Check book availability
- Issue a book (max 15 days)
- Return a book
- Pay fine (₹10 per day overdue)

### Reports
- Master list of Books
- Master list of Movies
- Master list of Memberships
- Active Issues
- Overdue Returns
- Issue Requests

### Maintenance (Admin only)
- Add/Update Membership
- Add/Update Books and Movies
- User Management

## Tech Stack
- React 18
- Vite
- CSS-in-JS (inline styles)