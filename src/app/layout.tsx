import "./globals.css";
import React from "react";
import { agentConfig } from "./agent.config";

export const metadata = {
  title: agentConfig.name,
  description: "Lightweight server-chat widget",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui" }}>
        {children}
      </body>
    </html>
  );
}
