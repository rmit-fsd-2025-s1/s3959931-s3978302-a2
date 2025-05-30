export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="tutor-dashboard-container">
      {/* Tutor-specific layout elements */}
      {children}
    </section>
  );
}
