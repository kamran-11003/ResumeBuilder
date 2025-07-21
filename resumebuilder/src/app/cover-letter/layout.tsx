import DashboardNav from '../dashboard/DashboardNav';

export default function CoverLetterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
} 