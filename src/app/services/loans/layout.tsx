import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Loan Facilitation Services - Home, Education, MF | Beart India Group',
  description: 'Beart India Group assists in securing Home Loans, Education Loans, and Loans Against Mutual Funds. Expert guidance through the application process to find competitive terms.',
  keywords: ['loan services India', 'home loan assistance', 'education loan India', 'loan against mutual funds', 'Beart India Group loans', 'financial support India'],
  alternates: {
    canonical: '/services/loans',
  },
};

export default function LoansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
