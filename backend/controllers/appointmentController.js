import Appointment from "../models/Appointment.js";
import DoctorSlot from "../models/DoctorSlot.js";
import { sendSuccess, sendError } from "../utils/responseHandler.js";
import { generateSlots } from "../utils/slotUtils.js";

/**
 * Books an appointment for a patient with a doctor at a specific time slot.
 *
 * - Validates: All fields present, time is in the future, slot exists and is available.
 * - Prevents double booking.
 */
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, time, patientName } = req.body;

    // Input validation
    if (!doctorId || !date || !time || !patientName) {
      return sendError(res, "All fields are required", 400);
    }
    // Validate patient name — must contain only letters (A-Z, a-z)
    if (!/^[A-Za-z ]+$/.test(patientName)) {
      return sendError(
        res,
        "Patient name must contain only letters and spaces",
        400
      );
    }

    // Step 1: Fetch all defined slot ranges for this doctor and date
    const slots = await DoctorSlot.find({ doctorId: parseInt(doctorId), date });
    if (!slots || slots.length === 0) {
      return sendError(
        res,
        "No slots available for this doctor on this date",
        400
      );
    }

    // Step 2: Generate all discrete time slots from the defined ranges
    let allAvailableSlots = [];
    for (const slot of slots) {
      const slotsForRange = generateSlots(
        slot.startTime,
        slot.endTime,
        slot.slotDuration
      );
      allAvailableSlots.push(...slotsForRange);
    }
    allAvailableSlots = [...new Set(allAvailableSlots)]; // De-duplicate

    // Step 3: Validate if requested time exists in generated slot list
    if (!allAvailableSlots.includes(time)) {
      return sendError(res, "Invalid time slot", 400);
    }

    // Step 4: Ensure appointment is not in the past
    const requestedDateTime = new Date(`${date}T${time}`);
    if (requestedDateTime < new Date()) {
      return sendError(res, "Cannot book in the past", 400);
    }

    // Step 5: Check if this time slot is already booked
    const exists = await Appointment.findOne({
      doctorId: parseInt(doctorId),
      date,
      time,
    });
    if (exists) {
      return sendError(
        res,
        {
          message: "Slot already booked",
          details: "Please choose another available time",
        },
        409
      );
    }

    // Step 6: Book the appointment
    const appointment = await new Appointment({
      doctorId: parseInt(doctorId),
      date,
      time,
      patientName,
    }).save();

    return sendSuccess(
      res,
      {
        message: "Appointment booked successfully",
        appointment,
      },
      201
    );
  } catch (err) {
    console.error("Error booking appointment:", err);
    return sendError(res, err);
  }
};

/**
 * Cancels (deletes) an existing appointment based on the booking ID.
 *
 * - Validates: Booking exists.
 * - Deletes: Removes from database.
 */
export const cancelAppointment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Appointment.findById(bookingId);
    if (!booking) {
      return sendError(res, "Booking not found", 404);
    }

    await Appointment.findByIdAndDelete(bookingId);
    return sendSuccess(res, { message: "Booking cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    return sendError(res, err);
  }
};

/**
 * Gets all bookings for a specific date.
 *
 * - Optional query param: doctorId to filter by doctor.
 * - Used by admin or doctor dashboard views.
 */
export const getBookingsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const { doctorId } = req.query;

    const query = { date };
    if (doctorId) query.doctorId = parseInt(doctorId);

    const bookings = await Appointment.find(query).sort({ time: 1 });
    return res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    return sendError(res, err);
  }
};

/**
 * Returns all bookings in the system.
 *
 * - Query params: optional `date` and `doctorId` to filter.
 * - Sorted by date and time.
 */
export const getAllBookings = async (req, res) => {
  try {
    const { date, doctorId } = req.query;

    const query = {};
    if (date) query.date = date;
    if (doctorId) query.doctorId = parseInt(doctorId);

    const bookings = await Appointment.find(query).sort({ date: 1, time: 1 });
    return res.json(bookings);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    return sendError(res, err);
  }
};
