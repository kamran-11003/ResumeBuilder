# Software Requirements Specification (SRS) for SmartResumeAI

---

## 1. Introduction

### 1.1 Purpose
SmartResumeAI is an AI-powered resume builder platform that allows users to generate job-specific, LaTeX-styled resumes and cover letters using LinkedIn/GitHub login, auto data fetching, LLaMA 3 question-generation, ATS optimization, and LaTeX templates. This SRS outlines the functional and non-functional requirements, system design, and implementation roadmap.

### 1.2 Scope
- AI-assisted resume builder  
- OAuth login (LinkedIn, Google, GitHub)  
- Resume templates (LaTeX-based)  
- Job description-based question generation (LLaMA 3)  
- ATS (Applicant Tracking System) checker  
- Tailored cover letter generator  
- User profile with versioning  
- Export as PDF  

### 1.3 Audience
- Developers  
- Product Managers  
- AI/ML Engineers  
- Investors  

### 1.4 Definitions
- **LLaMA 3**: Language model used for question generation and resume/letter writing  
- **ATS**: System used by recruiters to filter resumes based on keywords  

---

## 2. Functional Requirements

### 2.1 User Registration and Login
- OAuth integration for Google, LinkedIn, and GitHub  
- Store fetched data (education, experience, skills, etc.)

### 2.2 Resume Template Selection
- UI for choosing from LaTeX-based templates  
- Real-time LaTeX preview editor  

### 2.3 Resume Customization Flow
- Input job description  
- LLaMA 3 analyzes and generates missing info questions  
- User answers; data stored in profile  
- Resume generated using combined data  

### 2.4 ATS Optimization
- Extract keywords from job description  
- Compare against resume  
- Highlight missing or weak sections  
- One-click improvements  

### 2.5 Cover Letter Generation
- Based on resume + job description  
- Support tone customization (formal, friendly, enthusiastic)

### 2.6 User Profile System
- Store all data fetched and entered  
- Resume/cover letter history  
- Custom question sets and answers  

### 2.7 Resume Exporting
- Compile LaTeX to PDF  
- Download/export/share resume links  

---

## 3. Non-Functional Requirements
- **Performance**: Resume generation < 10s  
- **Security**: OAuth2 + HTTPS  
- **Scalability**: Microservices-based backend, scalable AI inference API  
- **Usability**: Responsive UI, intuitive LaTeX editor, onboarding tutorial  

---

## 4. System Architecture
- **Frontend**: Next.js + TailwindCSS  
- **Backend**: Node.js / Python (FastAPI or Django)  
- **AI API**: LLaMA 3 via Ollama or OpenRouter  
- **Database**: PostgreSQL + MongoDB  
- **Storage**: AWS S3 for PDFs  
- **Resume Compiler**: LaTeX (pdflatex or tectonic)  

---

## 5. Roadmap

### Phase 1 (Weeks 1–4)
- Setup OAuth login  
- Fetch and store user data from LinkedIn/GitHub  
- Build template selector UI + LaTeX rendering system  

### Phase 2 (Weeks 5–8)
- Integrate LLaMA 3 for question generation  
- Design user profile and question answer storage  
- Create job description input and ATS analysis tool  

### Phase 3 (Weeks 9–12)
- Resume generator and PDF exporter  
- Cover letter generator  
- Resume versioning and sharing  

### Phase 4 (Weeks 13–16)
- Final UI polish  
- Subscription and freemium model setup  
- Launch Beta  

---

## 6. Monetization Plan

### Freemium Model:
- Free tier: 2 resumes + 1 cover letter/month  
- Premium: $9/month or $99/year  

### Premium Features:
- Unlimited resumes/cover letters  
- Advanced ATS scoring  
- Premium templates  
- Job search assistant  
- AI grammar/tone improvement  

### Marketing Strategy:
- Partner with LinkedIn influencers  
- SEO-optimized landing pages (\"AI Resume Builder\", \"ATS-friendly Resume\")  
- LinkedIn Ads targeting job seekers  
- Startup directories (ProductHunt, Betalist)  
- University partnerships for student discounts  

---

## 7. Future Features
- **Auto Job Application Bot**: Apply to jobs using saved resume/cover letter  
- **Resume Audit Feedback**: Recruiter-like AI feedback  
- **Chrome Extension**: Scrape job descriptions from job boards  
- **Job Tracker**: Track applications, responses, status  
- **Interview Simulator**: AI-generated interview questions with feedback  

---

## 8. Constraints
- Legal: Compliance with LinkedIn/GitHub TOS  
- Ethical: Transparent AI use, no fake data generation  

---

## 9. Appendix
- Example prompt to LLaMA 3:  
  _\"Based on this job description and user’s profile, what info is missing? Generate questions.\"_  
- Sample LaTeX template  
- Open-source libraries list  
