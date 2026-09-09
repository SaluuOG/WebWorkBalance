import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WebWorkBalance",
  description: "Dein privater Radar für lokale Website-Chancen und neue Kunden.",
  applicationName: "WebWorkBalance",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WebWorkBalance",
  },
  other: {
    "codex-preview": "development",
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/wwb-icon-v10-64.png", type: "image/png", sizes: "64x64" },
      { url: "/wwb-icon-v10-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/wwb-icon-v10-64.png",
    apple: "/wwb-icon-v10-180.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#080b0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body>{children}</body>
    </html>
  );
}
