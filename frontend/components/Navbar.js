"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl flex items-center  font-bold text-[#08707f] hover:text-[#08606d] transition-colors "
            >
              <Image
                src="/logo.png"
                width={80}
                height={80}
                alt="Doctor Symbol"
                className="rounded-full"
              />
              Doctor Appointment System
            </Link>
          </div>

          <div className="flex space-x-4">
            {pathname.startsWith("/doctor") ? (
              <>
                <Link
                  href="/doctor/add-slot"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/doctor/add-slot")
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Add Slots
                </Link>
                <Link
                  href="/doctor/manage-slots"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/doctor/manage-slots")
                      ? "bg-orange-600 text-white"
                      : "text-slate-700 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  Manage Slots
                </Link>
                <Link
                  href="/doctor/view-bookings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/doctor/view-bookings")
                      ? "bg-purple-600 text-white"
                      : "text-slate-700 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                >
                  View Bookings
                </Link>{" "}
              </>
            ) : (
              ""
            )}
            {pathname === "/book-appointment" && (
              <Link
                href="/book-appointment"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/book-appointment")
                    ? "bg-green-600 text-white"
                    : "text-slate-700 hover:text-green-600 hover:bg-green-50"
                }`}
              >
                Book Appointment
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
