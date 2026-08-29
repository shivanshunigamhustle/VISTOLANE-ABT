import "@/styles/tokens.css";
import "@/styles/globals.css";

export const metadata = {
  title: "Vistolane — development",
  robots: { index: false, follow: false },
};

/**
 * Root layout for the development-only route group.
 *
 * Next.js allows one root layout per route group when no layout sits above
 * them, so this owns <html> and <body> for /kitchen-sink exactly as the (site)
 * layout does for the public routes. It is deliberately separate: nothing in
 * here should inherit site chrome, and nothing here ships.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export default function DevLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg font-ui text-label antialiased">
        {children}
      </body>
    </html>
  );
}
