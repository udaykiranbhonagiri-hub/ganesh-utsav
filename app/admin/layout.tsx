import AdminNav from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <AdminNav />
      {children}
    </div>
  );
}