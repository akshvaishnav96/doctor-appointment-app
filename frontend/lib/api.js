// lib/api.js
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

export const api = {
  // Add doctor slot availability
  async addSlot(slotData) {
    const response = await fetch(`${API_BASE_URL}/slots`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });
    return response.json();
  },

  // Get all unique doctor IDs
  async getDoctors() {
    const response = await fetch(`${API_BASE_URL}/doctors`);
    return response.json();
  },

  // Get available slots for a doctor on a specific date
  async getSlots(doctorId, date) {
    const response = await fetch(
      `${API_BASE_URL}/slots/${doctorId}?date=${date}`
    );
    return response.json();
  },

  // Get all slots (including booked ones) for a doctor on a specific date
  async getAllSlots(doctorId, date) {
    const response = await fetch(
      `${API_BASE_URL}/all-slots/${doctorId}?date=${date}`
    );
    return response.json();
  },

  // Book an appointment
  async bookAppointment(appointmentData) {
    const response = await fetch(`${API_BASE_URL}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(appointmentData),
    });
    return response.json();
  },

  // Get bookings for a specific date
  async getBookings(date, doctorId = null) {
    const url = doctorId
      ? `${API_BASE_URL}/bookings/${date}?doctorId=${doctorId}`
      : `${API_BASE_URL}/bookings/${date}`;
    const response = await fetch(url);
    return response.json();
  },

  // Get all bookings
  async getAllBookings(date = null, doctorId = null) {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (doctorId) params.append("doctorId", doctorId);

    const url = `${API_BASE_URL}/bookings${
      params.toString() ? "?" + params.toString() : ""
    }`;
    const response = await fetch(url);
    return response.json();
  },

  // Get all slots for a doctor
  async getDoctorSlots(doctorId, date = null) {
    const url = date
      ? `${API_BASE_URL}/doctor-slots/${doctorId}?date=${date}`
      : `${API_BASE_URL}/doctor-slots/${doctorId}`;
    const response = await fetch(url);
    return response.json();
  },

  // Update a slot
  async updateSlot(slotId, slotData) {
    const response = await fetch(`${API_BASE_URL}/slots/${slotId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slotData),
    });
    return response.json();
  },

  // Delete a slot
  async deleteSlot(slotId) {
    const response = await fetch(`${API_BASE_URL}/slots/${slotId}`, {
      method: "DELETE",
    });
    return response.json();
  },

  // Cancel a booking
  async cancelBooking(bookingId) {
    const response = await fetch(`${API_BASE_URL}/book/${bookingId}`, {
      method: "DELETE",
    });
    return response.json();
  },
};
