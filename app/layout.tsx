import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Agentic Documents Assistant",
	description: "Chatty, the LLM Agentic Documents Assistant.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body suppressHydrationWarning={true} className={inter.className}>
				{children}
			</body>
		</html>
	);
}
