import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create a free OpenDesign account and start generating editable UI with AI.",
  alternates: { canonical: "/signup" },
  robots: { index: true, follow: true },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
