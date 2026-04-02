import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'ISO Tank | Engineered For Flow',
    description: 'Premium ISO Tank Container scrollytelling experience designed for bulk liquid transport.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark scroll-smooth">
            <body className="antialiased bg-[#050505] text-white">
                {children}
            </body>
        </html>
    );
}
