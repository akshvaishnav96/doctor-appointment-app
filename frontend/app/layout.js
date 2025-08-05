import Navbar from '../components/Navbar.js';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-800">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}