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
git clone https://github.com/your-username/aceromax-loyalty.git
cd aceromax-loyalty
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aceromax_loyalty"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: Email configuration for notifications
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@aceromax.com"
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
# or
yarn dev
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
└── README.md
```

## 🗄️ Database Schema

### Core Models

#### User
- **id**: Unique identifier (UUID)
- **name**: User's full name
- **email**: Unique email address
- **password**: Hashed password
- **phone**: Optional phone number
- **role**: customer | admin | superadmin
- **businessType**: Type of business
- **branchId**: Associated branch
- **createdAt/updatedAt**: Timestamps

#### Branch
- **id**: Unique identifier (UUID)
- **name**: Branch name
- **address**: Physical address
- **price**: Point value in MXN
- **createdAt**: Creation timestamp

#### PointsTransaction
- **id**: Unique identifier (UUID)
- **userId**: Associated user
- **branchId**: Associated branch
- **folio**: Receipt/invoice number
- **description**: Transaction description
- **type**: earn | redeem
- **points**: Points amount
- **amount**: Monetary amount
- **status**: pending | confirmed | redeemed | rejected
- **createdAt/updatedAt**: Timestamps

#### AdminLog
- **id**: Unique identifier (UUID)
- **adminId**: Admin who performed action
- **action**: Action description
- **details**: JSON details
- **createdAt**: Timestamp

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

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js handlers

### Points Management
- `GET /api/points/balance` - Get user's point balance
- `GET /api/points/history` - Get transaction history
- `POST /api/points/purchases` - Submit receipt for points
- `POST /api/points/redeem` - Request point redemption

### Admin Operations
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/[id]` - Update user
- `GET /api/admin/branches` - List branches
- `POST /api/admin/branches` - Create branch
- `GET /api/admin/dashboard` - Admin dashboard data
- `POST /api/admin/points/approve` - Approve pending transactions

### User Management
- `GET /api/user/branch` - Get user's branch information
- `GET /api/profile` - Get user profile

## 🎨 UI Components

### Custom Components
- **Button** - Styled button with variants
- **Checkbox** - Accessible checkbox component
- **MonthPicker** - Date selection component
- **Navigation** - Main navigation bar
- **UserMenu** - User dropdown menu
- **SignIn/SignUp** - Authentication forms

### Layout Components
- **Footer** - Site footer with links
- **Navigation** - Main site navigation
- **UserMenu** - User account menu

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Configure build settings for Next.js
- **Railway**: Deploy with PostgreSQL database
- **DigitalOcean**: Use App Platform with managed database

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
```

## 🧪 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:migrate   # Run database migrations
```

### Database Management
```bash
# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation wiki

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