import type { ReactNode } from "react";
import "./globals.css";
import ModeratorModeToggle from "../components/ModeratorModeToggle";

export const metadata = {
  title: "SlashNews",
  description: "Community-driven social news platform"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ModeratorModeToggle />
      </body>
    </html>
  );
}
