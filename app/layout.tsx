import type { Metadata } from "next";
import "@livekit/components-styles";
import "./globals.css";

export const metadata: Metadata = {
  title: "Turkord",
  description: "Minimal Discord Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen w-screen overflow-hidden bg-background text-textMain font-sans">
        {children}
      </body>
    </html>
  );
}
