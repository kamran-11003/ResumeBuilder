# 🚀 AI Resume Builder - Professional Resume Creation Platform

A comprehensive, AI-powered resume builder built with Next.js, TypeScript, and MongoDB. Create ATS-optimized resumes with AI assistance, LaTeX compilation, and professional templates.

## 🚀 Features

### 🤖 AI-Powered Features
- **Smart Resume Generation** - AI analyzes job descriptions and creates targeted resumes
- **Dynamic Question Generation** - AI generates relevant questions based on job requirements
- **Cover Letter Creation** - AI-powered cover letter generation with tone selection
- **ATS Optimization** - AI analyzes and optimizes resumes for Applicant Tracking Systems

### 📄 Professional Output
- **LaTeX Compilation** - High-quality PDF generation using LaTeX
- **Multiple Templates** - Modern, Classic, Creative, and Minimal designs
- **Real-time Preview** - See changes instantly as you build
- **Professional Formatting** - ATS-friendly formatting and structure

### Authentication & Integration
- **OAuth Support** - Google, GitHub, and LinkedIn integration
- **LinkedIn Import** - Automatically pull profile data from LinkedIn
- **Manual Entry** - Option to enter details manually
- **Secure Authentication** - NextAuth.js with JWT tokens

### Resume Sections
- Personal Information & Contact Details
- Work Experience with achievements
- Education & Certifications
- Skills & Technologies
- Projects & Portfolio
- Languages & Certifications
- Awards & Publications
- Volunteer Experience
- References

### User Experience
- **Responsive Design** - Works on all devices
- **Smooth Animations** - GSAP + Framer Motion
- **Modern UI** - Tailwind CSS with beautiful components
- **Drag & Drop** - Easy file uploads for ATS checking
- **Search & Filter** - Organize and find resumes quickly

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **GSAP + ScrollTrigger** for animations
- **Framer Motion** for component animations
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for backend functionality
- **MongoDB** with Mongoose for data storage
- **NextAuth.js** for authentication
- **LaTeX compilation** using node-latex and pdflatex

### AI Integration
- **Google Gemini API** for AI-powered features
- **Structured prompting** for consistent outputs
- **Fallback mechanisms** for reliability

## 📋 Prerequisites

- **Node.js 18+**
- **MongoDB** (local or Atlas)
- **LaTeX installation** (pdflatex)
- **Google Gemini API key**
- **OAuth provider accounts** (Google, GitHub, LinkedIn)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd resumebuilder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/resumebuilder

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# AI Integration
GEMINI_API_KEY=your-gemini-api-key
```

### 4. OAuth Provider Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

#### LinkedIn OAuth
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add OAuth 2.0 redirect URLs: `http://localhost:3000/api/auth/callback/linkedin`

### 4. Install LaTeX
   - **Windows**: Install [MiKTeX](https://miktex.org/) or [TeX Live](https://www.tug.org/texlive/)
   - **macOS**: Install [MacTeX](https://www.tug.org/mactex/)
   - **Linux**: Install TeX Live: `sudo apt-get install texlive-full`

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
resumebuilder/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── ai/            # AI endpoints
│   │   │   │   ├── generate-questions/
│   │   │   │   ├── generate-resume/
│   │   │   │   ├── generate-cover-letter/
│   │   │   │   └── analyze-ats/
│   │   │   └── auth/          # Authentication endpoints
│   │   ├── auth/              # Authentication pages
│   │   ├── build-resume-ai/   # AI resume builder
│   │   ├── cover-letter/      # Cover letter generator
│   │   ├── ats-checker/       # ATS checker page
│   │   ├── profile/           # User profile management
│   │   ├── build-resume/      # Manual resume builder
│   │   ├── my-resumes/        # Resume management page
│   │   └── page.tsx           # Landing page
│   ├── lib/                   # Utility libraries
│   │   ├── ai/                # AI services
│   │   │   └── gemini.ts      # Gemini AI integration
│   │   ├── latex/             # LaTeX compiler
│   │   │   └── compiler.ts    # PDF generation
│   │   ├── models/            # MongoDB models
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── db.ts              # Database connection
│   │   └── mongodb.ts         # MongoDB client
│   └── components/            # Reusable components
├── public/                    # Static assets
├── PROJECT_BLUEPRINT.md       # Technical specifications
└── README.md
```

## 🎯 Website Workflow

### Landing Page
- Animated sections explaining features
- Built with GSAP + ScrollTrigger for smooth scroll effects
- Navigation with Profile, ATS Checker, Cover Letter, Build Resume, My Resumes

### Authentication Flow
1. **OAuth Login** via Google, GitHub, LinkedIn
2. **LinkedIn Integration**: Pulls basic info (name, role, experience, skills)
3. **Manual Entry**: Users can enter details manually if not using LinkedIn

### AI-Powered Resume Builder (`/build-resume-ai`)
1. **Job Description Input**: User pastes job description
2. **AI Question Generation**: Gemini analyzes and creates targeted questions
3. **Dynamic Questionnaire**: User answers AI-generated questions
4. **LaTeX Generation**: AI creates professional LaTeX code
5. **PDF Compilation**: Backend compiles LaTeX to PDF
6. **Preview & Download**: User gets professional resume

### Cover Letter Generator (`/cover-letter`)
- AI-generated cover letters based on job description
- Multiple tone options (Formal, Enthusiastic, Professional)
- Job-specific customization
- PDF export with professional formatting

### Core Pages
1. **Profile** - User profile management with LinkedIn import
2. **Build Resume AI** - AI-powered resume generation
3. **Cover Letter** - AI cover letter generator
4. **ATS Checker** - Upload and analyze resume compatibility
5. **Build Resume** - Manual multi-section resume builder
6. **My Resumes** - Manage and organize saved resumes

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🗄️ Database Schema

The application uses a comprehensive MongoDB schema with the following main collections:

### User Model
- **Authentication**: Email, OAuth accounts
- **Personal Info**: Name, contact details, summary
- **Professional Data**: Experience, education, skills, projects
- **Resume Management**: Multiple resumes with templates
- **Preferences**: Settings, privacy, notifications
- **Analytics**: Usage statistics and tracking

## 🎨 Customization

### Adding New Templates
1. Create template component in `src/components/templates/`
2. Add template data to the templates array
3. Update template selection logic

### Adding New Resume Sections
1. Update the User model in `src/lib/models/User.ts`
2. Add section component to build-resume page
3. Update section rendering logic

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- OAuth 2.0 integration
- Input validation and sanitization
- MongoDB injection protection

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms
- Set up MongoDB Atlas for database
- Configure environment variables
- Build and deploy using platform-specific instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- AI-powered resume suggestions
- Advanced ATS scoring algorithms
- Resume sharing and collaboration
- Integration with job boards
- Mobile app development
- Advanced analytics and insights
