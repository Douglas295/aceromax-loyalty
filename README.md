# 🏆 Aceromax Loyalty Points System

A modern, full-stack loyalty points management system built with Next.js, TypeScript, and PostgreSQL. This application allows customers to earn and redeem points through purchases at Aceromax branches, with comprehensive admin management capabilities.

## ✨ Features

### 🎯 Customer Features
- **User Registration & Authentication** - Secure account creation with role-based access
- **Points Dashboard** - Real-time balance tracking with visual indicators
- **Receipt Submission** - Easy folio and amount submission for point earning
- **Points Redemption** - Request point redemption with admin approval
- **Transaction History** - Comprehensive view with table/card toggle
- **Branch Information** - View assigned branch details and point values
- **Responsive Design** - Mobile-first approach with modern UI

### 🔧 Admin Features
- **User Management** - Create, view, and manage customer accounts
- **Branch Management** - Configure branch locations and point values
- **Transaction Approval** - Review and approve pending point transactions
- **Dashboard Analytics** - Overview of system metrics and user activity
- **Admin Logs** - Track all administrative actions

### 🎨 UI/UX Features
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Interactive Components** - Smooth animations and hover effects
- **View Toggle** - Switch between table and card views for transactions
- **Search & Filtering** - Advanced filtering by status, type, and date
- **Real-time Updates** - Live data updates with toast notifications
- **Accessibility** - WCAG compliant with proper focus management

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.5.3** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Headless UI** - Unstyled, accessible UI components
- **React Hot Toast** - Elegant notifications

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js** - Authentication and session management
- **Prisma** - Type-safe database ORM
- **PostgreSQL** - Robust relational database
- **bcrypt** - Password hashing and security

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript** - Static type checking
- **Prisma Studio** - Database management interface

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database
- **Git** for version control

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/codarkle/aceromax-loyalty.git
cd aceromax-loyalty
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
JWT_SECERT="your-production-auth-secret"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
aceromax-loyalty/
├── prisma/
│   ├── migrations/          # Database migration files
│   ├── schema.prisma        # Database schema definition
│   └── seed.ts             # Database seeding script
├── public/
│   ├── icons/              # SVG icons and assets
│   └── images/             # Static images
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── api/            # API route handlers
│   │   ├── dashboard/      # Customer dashboard
│   │   ├── login/          # Authentication pages
│   │   └── profile/        # User profile pages
│   ├── components/         # Reusable React components
│   │   ├── auth/           # Authentication components
│   │   ├── home/           # Homepage components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # UI component library
│   ├── lib/                # Utility functions and configurations
│   └── middleware.ts       # Next.js middleware
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── License
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles
- **Customer**: Can submit receipts, view points, request redemptions
- **Admin**: Can manage users, approve transactions, view analytics
- **Superadmin**: Full system access and configuration

### Security Features
- Password hashing with bcrypt
- Session-based authentication with NextAuth.js
- Role-based access control
- Protected API routes
- CSRF protection

## 🚀 Deployment

### Railway (Recommended)
1. Deploy with PostgreSQL database
2. DATABASE_URL setup for .env

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

 
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Roadmap

### Upcoming Features
- [ ] Email notifications for transaction updates
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Bulk transaction processing
- [ ] Integration with POS systems
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Advanced user permissions

### Performance Improvements
- [ ] Database query optimization
- [ ] Caching implementation
- [ ] Image optimization
- [ ] Bundle size optimization

---

**Built with ❤️ for Aceromax Loyalty Program**