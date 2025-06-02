export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Include shared auth UI elements here if any, e.g., a specific header/footer for auth pages */}
      {children}
    </section>
  );
}
