import DashboardNav from '../dashboard/DashboardNav';

export default function MyResumesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
} 