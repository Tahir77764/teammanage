# Team Management System

A modern Next.js application for team management where admins can create teams, assign tasks, and monitor task progress while users can update their task status and track deadlines.

## Features

✅ **User Authentication**

- Email/Password signup with OTP verification
- Secure login/logout functionality
- JWT-based session management
- Admin and user role distinction

✅ **Task Management**

- Admins can create and assign tasks to users
- Users can view assigned tasks and update status
- Task status tracking: Pending, In Progress, Completed
- Deadline management

✅ **Team Management**

- Admins can create and manage teams
- Add multiple members to teams
- Team descriptions and details

✅ **Dashboard**

- User dashboard showing task statistics
- Admin dashboard with system-wide analytics
- Task status overview
- User and task counts

✅ **Email Notifications**

- OTP verification emails
- Using Nodemailer for email delivery

## Technology Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS, React Hot Toast
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT, bcryptjs
- **Email:** Nodemailer

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Gmail account (for email notifications)

## Installation

1. **Clone the repository**

```bash
cd teamanage
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the project root:

```env
# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# Email Configuration
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password

# Admin Email
ADMIN_EMAIL=admin@example.com

# JWT Secret
JWT_SECRET=your_secret_key_here
```

### Getting Gmail App Password

1. Enable 2-factor authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password and use it as `EMAIL_PASS`

## Running the Application

### Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
teamanage/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.js
│   │   │   ├── signup/route.js
│   │   │   ├── verify-otp/route.js
│   │   │   ├── logout/route.js
│   │   │   └── me/route.js
│   │   ├── tasks/
│   │   │   ├── create/route.js
│   │   │   ├── get-all-tasks/route.js
│   │   │   ├── get-user-tasks/route.js
│   │   │   └── update-status/route.js
│   │   └── users/
│   │       ├── all/route.js
│   │       └── create-team/route.js
│   ├── admin/
│   │   ├── dashboard/page.jsx
│   │   ├── create-task/page.jsx
│   │   └── teams/page.jsx
│   ├── dashboard/page.jsx
│   ├── login/page.jsx
│   ├── signup/page.jsx
│   ├── verify-otp/page.jsx
│   ├── layout.jsx
│   ├── page.jsx
│   └── globals.css
├── components/
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── ProtectedRoute.jsx
│   ├── DashboardStats.jsx
│   ├── TaskCard.jsx
│   └── Loader.jsx
├── lib/
│   ├── mongodb.js
│   ├── auth.js
│   ├── generateOTP.js
│   └── nodemailer.js
├── models/
│   ├── User.js
│   ├── Task.js
│   ├── Team.js
│   └── OTP.js
├── utils/
│   ├── formatDate.js
│   ├── sendOTP.js
│   └── verifyToken.js
├── styles/
│   └── dashboard.css
├── public/
│   └── assets/
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-otp` - Verify email OTP
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks

- `POST /api/tasks/create` - Create task (Admin only)
- `GET /api/tasks/get-all-tasks` - Get all tasks (Admin only)
- `GET /api/tasks/get-user-tasks` - Get user's tasks
- `PUT /api/tasks/update-status` - Update task status

### Users & Teams

- `GET /api/users/all` - Get all users
- `POST /api/users/create-team` - Create team (Admin only)

## User Roles

### Admin

- Create and assign tasks
- Create and manage teams
- View all tasks and user statistics
- Monitor team performance

### User

- View assigned tasks
- Update task status
- Track task deadlines
- View personal dashboard

## Authentication Flow

1. **Sign Up**
   - User registers with name, email, and password
   - System generates and sends OTP
   - User verifies OTP via email
   - Account is activated

2. **Login**
   - User logs in with email and password
   - JWT token is generated and stored as httpOnly cookie
   - User is redirected to dashboard

3. **Protected Routes**
   - All dashboard and admin routes require valid JWT
   - Middleware validates token before allowing access

## Task Status Flow

1. **Pending** - Task is assigned but not started
2. **In Progress** - User is actively working on the task
3. **Completed** - User has finished the task

## Error Handling

- User-friendly error messages via toast notifications
- API error responses with status codes
- Validation for all form inputs
- Database connection error handling

## Future Enhancements

- Task comments and notes
- Activity history and audit logs
- Task priority levels
- Recurring tasks
- File attachments
- Real-time notifications with WebSocket
- Email reminders for deadlines
- Performance analytics and reports

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an GitHub issue or contact the development team.

---

**Built with ❤️ using Next.js**

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
