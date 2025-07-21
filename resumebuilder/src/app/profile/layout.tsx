import DashboardNav from '../dashboard/DashboardNav';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardNav />
      {children}
    </>
  );
} 