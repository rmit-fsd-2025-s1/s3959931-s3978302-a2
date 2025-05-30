export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="lecturer-dashboard-container">
      {/* Lecturer-specific layout elements, e.g., sidebar, header variant */}
      {children}
    </section>
  );
}
