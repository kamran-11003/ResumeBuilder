import DashboardNav from '../dashboard/DashboardNav';

export default function BuildResumeAILayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
} 