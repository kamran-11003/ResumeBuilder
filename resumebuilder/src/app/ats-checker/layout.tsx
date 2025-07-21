import DashboardNav from '../dashboard/DashboardNav';

export default function ATSCheckerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
} 