"use client";
import { useState } from "react";
import { api } from "../../../lib/api.js";
import { FaUserMd } from "react-icons/fa";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TextField } from "@mui/material";
import { format } from "date-fns";
import Image from "next/image.js";

export default function AddSlotPage() {
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    startTime: "",
    endTime: "",
    slotDuration: "15",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await api.addSlot(form);
      if (result.error) {
        setMessage(`Error: ${result.error}`);
      } else {
        setMessage("Slot added successfully!");
        setForm({
          doctorId: "",
          date: "",
          startTime: "",
          endTime: "",
          slotDuration: "15",
        });
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-100 to-blue-50 flex items-center justify-center p-2">
      <div className="w-full max-w-md bg-white shadow-xl rounded-xl p-4 transition-all">
        <h2 className="flex items-center justify-center text-xl font-semibold text-slate-800 mb-3 space-x-2">
          <Image
            src="/stethoscope-form-female-gender-symbol-doctor-women-isolated-white-background_188237-1019.avif"
            width={180}
            height={80}
            alt="Doctor Symbol"
            className="rounded-full"
          />
          <span>Medical Appointment</span>
        </h2>

        {message && (
          <div
            className={`p-3 mb-4 rounded-md text-sm font-medium transition-all ${
              message.includes("Error")
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {message}
          </div>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Doctor ID
              </label>
              <input
                name="doctorId"
                type="number"
                required
                placeholder="Enter numeric ID"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                value={form.doctorId}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Availability Date
              </label>
              <DatePicker
                value={form.date ? new Date(form.date) : null}
                onChange={(newValue) => {
                  if (newValue instanceof Date && !isNaN(newValue)) {
                    setForm({
                      ...form,
                      date: format(newValue, "yyyy-MM-dd"),
                    });
                  }
                }}
                minDate={new Date()}
                format="yyyy-MM-dd"
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    size: "small",
                    className:
                      "border border-slate-300 rounded-md bg-white text-sm",
                  },
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Time
              </label>
              <input
                name="startTime"
                type="time"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                value={form.startTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Time
              </label>
              <input
                name="endTime"
                type="time"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
                value={form.endTime}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Slot Duration
              </label>
              <select
                name="slotDuration"
                value={form.slotDuration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
              >
                {[15, 30, 45, 60].map((d) => (
                  <option key={d} value={d}>
                    {d} minutes
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Adding Slot..." : "Add Slot"}
            </button>
          </form>
        </LocalizationProvider>
      </div>
    </div>
  );
}
