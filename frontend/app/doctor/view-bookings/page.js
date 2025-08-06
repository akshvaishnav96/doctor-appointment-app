"use client";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

export default function ViewBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelModalError, setCancelModalError] = useState("");

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadDoctors();
    loadBookings();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [selectedDate, selectedDoctor]);

  const loadDoctors = async () => {
    try {
      const doctors = await api.getDoctors();
      setDoctors(doctors);
    } catch (error) {
      setMessage(`Error loading doctors: ${error.message}`);
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    try {
      const bookings = await api.getAllBookings(
        selectedDate || null,
        selectedDoctor || null
      );
      setBookings(bookings);
    } catch (error) {
      setMessage(`Error loading bookings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleDoctorChange = (e) => {
    setSelectedDoctor(e.target.value);
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedDoctor("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString;
  };

  // Cancel a booking
  const handleCancelBooking = async (bookingId) => {
    setCancelBookingId(bookingId);
    setCancelModalError("");
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!cancelBookingId) return;
    setCancelModalError("");
    try {
      const result = await api.cancelBooking(cancelBookingId);
      if (result.error) {
        setCancelModalError(result.error);
      } else {
        setMessage("Booking cancelled successfully!");
        loadBookings();
        setShowCancelModal(false);
        setCancelBookingId(null);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setCancelModalError(error.message);
    }
  };

  const cancelModal = showCancelModal && (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Cancel Booking</h3>
        {cancelModalError && (
          <div className="p-3 mb-4 rounded bg-red-100 text-red-700">
            {cancelModalError}
          </div>
        )}
        <p className="mb-4">Are you sure you want to cancel this booking?</p>
        <div className="flex space-x-3">
          <button
            onClick={confirmCancelBooking}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Yes, Cancel
          </button>
          <button
            onClick={() => {
              setShowCancelModal(false);
              setCancelBookingId(null);
              setCancelModalError("");
            }}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">
        View Bookings
      </h2>
      {cancelModal}

      {message && (
        <div
          className={`p-3 mb-4 rounded ${
            message.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-slate-200">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Filters</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-700">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Doctor</label>
            <select
              value={selectedDoctor}
              onChange={handleDoctorChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Doctors</option>
              {doctors.map((id) => (
                <option key={id} value={id}>
                  Doctor {id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Bookings {selectedDate && `for ${formatDate(selectedDate)}`}
            {selectedDoctor && ` - Doctor ${selectedDoctor}`}
          </h3>
          <span className="text-sm text-gray-500">
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading bookings...</div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border-b">Date</th>
                  <th className="text-left p-3 border-b">Time</th>
                  <th className="text-left p-3 border-b">Doctor ID</th>
                  <th className="text-left p-3 border-b">Patient Name</th>
                  <th className="text-left p-3 border-b">Mobile</th>
                  <th className="text-left p-3 border-b">Booked At</th>
                  <th className="text-left p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking._id || index} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{formatDate(booking.date)}</td>
                    <td className="p-3 border-b font-medium">
                      {formatTime(booking.time)}
                    </td>
                    <td className="p-3 border-b">Doctor {booking.doctorId}</td>
                    <td className="p-3 border-b">{booking.patientName}</td>
                    <td className="p-3 border-b">{booking.patientMobile}</td>
                    <td className="p-3 border-b text-sm text-gray-500">
                      {new Date(booking.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 border-b">
                      <button
                        onClick={() => handleCancelBooking(booking._id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {selectedDate || selectedDoctor
                ? "No bookings found for the selected filters"
                : "No bookings found. Add some appointments to see them here."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
