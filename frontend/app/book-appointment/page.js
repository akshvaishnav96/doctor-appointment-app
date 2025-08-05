"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker as MuiDatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import Image from "next/image.js";

export default function BookAppointmentPage() {
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientName, setPatientName] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const todayDateObj = new Date(today);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (doctorId && currentDate) {
      loadSlots();
      loadAllSlots();
    }
  }, [doctorId, currentDate]);

  const loadDoctors = async () => {
    try {
      const doctors = await api.getDoctors();
      setDoctors(doctors);
    } catch (error) {
      setMessage(`Error loading doctors: ${error.message}`);
    }
  };

  const loadSlots = async () => {
    setLoading(true);
    try {
      const slots = await api.getSlots(doctorId, currentDate);
      setAvailableSlots(slots);
    } catch (error) {
      setMessage(`Error loading slots: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAllSlots = async () => {
    try {
      const allSlots = await api.getAllSlots(doctorId, currentDate);
      setAllSlots(allSlots);
    } catch (error) {
      console.error("Error loading all slots:", error);
    }
  };

  const handleDoctorChange = (e) => {
    const selectedDoctor = e.target.value;
    setDoctorId(selectedDoctor);
    if (selectedDoctor) {
      setCurrentDate(today);
    } else {
      setAvailableSlots([]);
      setCurrentDate("");
    }
  };

  const handleDateChange = (direction) => {
    const current = new Date(currentDate);
    direction === "prev"
      ? current.setDate(current.getDate() - 1)
      : current.setDate(current.getDate() + 1);
    setCurrentDate(current.toISOString().split("T")[0]);
  };

  const handleCustomDate = (date) => {
    if (!date) return;
    const iso = date.toISOString().split("T")[0];
    if (iso >= today) setCurrentDate(iso);
  };

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookingConfirm = async () => {
    if (!patientName.trim()) {
      setMessage("Please enter patient name");
      return;
    }
    try {
      const result = await api.bookAppointment({
        doctorId: parseInt(doctorId),
        date: currentDate,
        time: selectedSlot,
        patientName: patientName.trim(),
      });

      if (result.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage("Appointment booked successfully!");
        setShowBookingModal(false);
        setPatientName("");
        setSelectedSlot(null);
        await loadSlots();
        await loadAllSlots();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleBookingCancel = () => {
    setShowBookingModal(false);
    setPatientName("");
    setSelectedSlot(null);
    setMessage("");
  };

  const generateDateOptions = () => {
    const options = [];
    const startDate = new Date(today);
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const iso = date.toISOString().split("T")[0];
      options.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
        }),
        value: iso,
      });
    }
    return options;
  };

  const now = new Date();

  // Filter all slots to only include times in the future (only if the selected date is today)
  const filteredSlots = allSlots.filter((slot) => {
    if (!currentDate) return true;

    const [hour, minute] = slot.time.split(":").map(Number);
    const slotDate = new Date(currentDate);
    slotDate.setHours(hour, minute, 0, 0);

    if (new Date(currentDate).toDateString() === now.toDateString()) {
      return slotDate > now; // Only allow future times on today's date
    }

    return true; // Allow all for future dates
  });

  // Now separate morning and afternoon from filtered slots
  const morningSlots = filteredSlots.filter((slot) => {
    const [hour] = slot.time.split(":").map(Number);
    return hour < 12;
  });

  const afternoonSlots = filteredSlots.filter((slot) => {
    const [hour] = slot.time.split(":").map(Number);
    return hour >= 12;
  });

  return (
    <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-3xl font-bold mb-6 text-slate-900">
          Book Appointment
        </h2>
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

        <div className="mb-4">
          <select
            value={doctorId}
            onChange={handleDoctorChange}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Doctor</option>

            {doctors.map((id) => (
              <option key={id} value={id}>
                Doctor {id}
              </option>
            ))}
          </select>
        </div>

        {doctorId && (
          <div className="bg-white shadow rounded-lg p-4">
            <div className="mb-4">
              <div className="text-lg font-semibold mb-2">
                Doctor {doctorId}
              </div>
              <div className="text-sm text-gray-500">
                Experienced healthcare provider for your needs
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {generateDateOptions().map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentDate(date.value)}
                  className={`px-4 py-2 text-sm rounded-lg border-2 shadow-sm transition-all text-center flex-shrink-0 flex flex-col items-center justify-center
                  ${
                    currentDate === date.value
                      ? "bg-blue-600 text-white border-blue-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-semibold">
                    {date.label.split(" ")[0]}
                  </span>
                  <span>{date.label.split(" ")[1]}</span>
                </button>
              ))}
              <div className="w-[160px]">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <MuiDatePicker
                    label="Pick date"
                    value={currentDate ? new Date(currentDate) : null}
                    minDate={todayDateObj}
                    onChange={handleCustomDate}
                    slotProps={{
                      textField: {
                        variant: "outlined",
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="text-center py-8 text-gray-600">
                  Loading slots...
                </div>
              ) : allSlots.length > 0 ? (
                <>
                  {morningSlots.length > 0 ? (
                    <h4 className="text-sm font-medium text-slate-500 uppercase mb-2">
                      Morning
                    </h4>
                  ) : (
                    ""
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                    {morningSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          !slot.isBooked && handleSlotClick(slot.time)
                        }
                        disabled={slot.isBooked}
                        className={`p-2 border rounded-lg text-sm transition-colors ${
                          slot.isBooked
                            ? "border-red-300 bg-red-50 text-red-700 cursor-not-allowed"
                            : "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                        }`}
                      >
                        <div>{slot.time}</div>
                        <div className="text-xs">
                          {slot.isBooked ? "Booked" : "Available"}
                        </div>
                      </button>
                    ))}
                  </div>
                  {afternoonSlots.length > 0 ? (
                    <h4 className="text-sm font-medium text-slate-500 uppercase mb-2">
                      Afternoon
                    </h4>
                  ) : (
                    ""
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {afternoonSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          !slot.isBooked && handleSlotClick(slot.time)
                        }
                        disabled={slot.isBooked}
                        className={`p-2 border rounded-lg text-sm transition-colors ${
                          slot.isBooked
                            ? "border-red-300 bg-red-50 text-red-700 cursor-not-allowed"
                            : "border-green-300 bg-green-50 text-green-800 hover:bg-green-100"
                        }`}
                      >
                        <div>{slot.time}</div>
                        <div className="text-xs">
                          {slot.isBooked ? "Booked" : "Available"}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No slots available
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-4 hidden md:block">
        <Image
          src="/stethoscope-form-female-gender-symbol-doctor-women-isolated-white-background_188237-1019.avif"
          width={600}
          height={1200}
          alt="Doctor Symbol"
          className="rounded-full"
        />

        <div className="text-2xl font-bold text-slate-800 mt-4">
          Crypto Care
        </div>

        <div className="text-sm text-gray-500 mt-1">
          Modern clinic experience tailored to your health needs
        </div>

        <div className="mt-4 text-sm text-gray-600 space-y-3 leading-relaxed">
          <p>
            Booking your appointment has never been easier. Choose from a wide
            range of doctors, specialties, and time slots that suit your
            schedule.
          </p>
          <p>
            At <strong>Crypto Care</strong>, we believe in transparency, trust,
            and timely care. Your health data is safe, and your comfort is our
            priority.
          </p>

          <p className="font-medium text-slate-700 italic">
            “The best time to care for your health was yesterday. The next best
            time is now.”
          </p>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Confirm Booking</h3>
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

            <p className="mb-4">
              Book appointment for <strong>{selectedSlot}</strong> on{" "}
              {new Date(currentDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              ?
            </p>

            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="w-full p-3 border rounded-lg mb-4"
              autoFocus
            />

            <div className="flex space-x-3">
              <button
                onClick={handleBookingConfirm}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
              <button
                onClick={handleBookingCancel}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
