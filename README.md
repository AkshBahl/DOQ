# DOQ - Doctor Q | AI Health Companion

A modern, AI-powered healthcare platform built with Next.js, React, and TypeScript. DOQ combines AI-driven symptom assessment, provider matching, and personalized health insights to provide a comprehensive health companion experience.

## 🚀 Features

### Core Functionality
- **AI-Powered Health Assessment**: Real-time symptom analysis using Google Gemini AI
- **Intelligent Chat Assistant**: AI health consultation with contextual responses
- **Provider Matching**: Find and connect with healthcare professionals
- **Health Profile Management**: Comprehensive health information tracking
- **Subscription Management**: Flexible pricing tiers (Free, Premium, Family)
- **Real-time Authentication**: Secure user authentication with Supabase

### Technical Features
- **Modern Tech Stack**: Next.js 15, React 19, TypeScript
- **AI Integration**: Google Gemini API for health assessments and chat
- **Database**: Supabase for data persistence and authentication
- **UI Components**: shadcn/ui with Tailwind CSS
- **Responsive Design**: Mobile-first approach
- **Type Safety**: Full TypeScript implementation

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd DOQ
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Google Gemini API
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key from Settings > API

#### Database Schema
Run the following SQL in your Supabase SQL editor:

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  emergency_contact TEXT,
  subscription_tier TEXT DEFAULT 'free',
  health_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health profiles table
CREATE TABLE public.health_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  allergies JSONB DEFAULT '[]',
  medications JSONB DEFAULT '[]',
  conditions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments table
CREATE TABLE public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  pain_level TEXT NOT NULL,
  duration TEXT NOT NULL,
  medications_taken TEXT NOT NULL,
  additional_symptoms TEXT,
  urgency_level TEXT NOT NULL,
  confidence_score INTEGER NOT NULL,
  recommendations TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('user', 'ai')),
  content TEXT NOT NULL,
  confidence INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own health profile" ON public.health_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments" ON public.assessments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id);
```

### 5. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add the key to your `.env.local` file

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
DOQ/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── assessment/    # Health assessment API
│   │   └── chat/          # AI chat API
│   ├── dashboard/         # Main dashboard
│   ├── assessment/        # AI health assessment
│   ├── chat/             # AI chat interface
│   ├── providers/        # Provider directory
│   ├── health-profile/   # Health information management
│   ├── subscription/     # Subscription management
│   └── profile/          # User profile settings
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   └── navigation.tsx   # Main navigation
├── lib/                 # Utility functions and configurations
│   ├── supabase.ts      # Supabase client
│   ├── gemini.ts        # Gemini AI client
│   └── auth.tsx         # Authentication context
├── hooks/               # Custom React hooks
└── middleware.ts        # Authentication middleware
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key | Yes |
| `NEXT_PUBLIC_APP_URL` | Application URL | No |

### Subscription Tiers

- **Free**: 3 AI consultations per month, basic features
- **Premium**: Unlimited AI consultations, advanced features ($19.99/month)
- **Family**: Premium features for up to 6 family members ($39.99/month)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security

- Row Level Security (RLS) enabled on all database tables
- Authentication middleware protecting routes
- Environment variables for sensitive data
- Input validation and sanitization
- HTTPS enforcement in production

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth` - Sign in/Sign up

### Health Assessment

- `POST /api/assessment` - Submit symptom assessment

### AI Chat

- `POST /api/chat` - Send chat message

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

## 🔮 Future Enhancements

- [ ] Payment processing integration
- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced AI models (Infermedica)
- [ ] Telemedicine integration
- [ ] Health data import/export
- [ ] Multi-language support
- [ ] Advanced analytics dashboard