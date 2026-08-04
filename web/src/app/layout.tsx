import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Knowledge Spiral Lab — SECI × AI",
  description:
    "An interactive simulation of Nonaka & Takeuchi's SECI model extended with tacit machine knowledge. Build the spiral, not the answer.",
  keywords: [
    "SECI model",
    "Nonaka",
    "Takeuchi",
    "knowledge creation",
    "tacit knowledge",
    "LLM",
    "agentic AI",
    "knowledge management",
    "ba",
  ],
  openGraph: {
    title: "The Knowledge Spiral Lab — SECI × AI",
    description:
      "Run the knowledge spiral with humans and AI agents. Based on Nonaka & Takeuchi's SECI model, extended with tacit machine knowledge.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
