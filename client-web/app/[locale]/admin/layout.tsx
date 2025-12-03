import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuth } from '@/components/admin/AdminAuth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuth>
      <div className="min-h-screen bg-white">
        <AdminSidebar />
        <div className="lg:pl-[284px]">
          <AdminHeader />
          <main className="py-[33px]">
            <div className="mx-auto px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminAuth>
  );
}