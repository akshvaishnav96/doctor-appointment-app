import DoctorSlot from "../models/DoctorSlot.js";
import Appointment from "../models/Appointment.js";
import { generateSlots } from "../utils/slotUtils.js";
import { sendError, sendSuccess } from "../utils/responseHandler.js";

/**
 * Create a new time slot for a doctor on a given date.
 * Validates date is in future, no overlaps with existing slots.
 */
export const addSlot = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, slotDuration } = req.body;

    // Mandatory field validation
    if (!doctorId || !date || !startTime || !endTime || !slotDuration) {
      return sendError(res, "All fields are required", 400);
    }

    // Ensure selected datetime is in the future
    const now = new Date();
    const selectedDate = new Date(date);
    const [startHour, startMin] = startTime.split(":").map(Number);
    selectedDate.setHours(startHour, startMin, 0, 0);

    if (selectedDate < now) {
      return sendError(
        res,
        "Slot must be in the future (today with future time is allowed)",
        400
      );
    }

    // Validate time logic
    if (endTime <= startTime) {
      return sendError(res, "End time must be after start time", 400);
    }

    // Check for overlap with existing slots for same doctor and date
    const existingSlots = await DoctorSlot.find({
      doctorId: parseInt(doctorId),
      date,
    });
    const isOverlap = existingSlots.some(
      (slot) => startTime < slot.endTime && slot.startTime < endTime
    );
    if (isOverlap) {
      return sendError(
        res,
        {
          message: "Slot overlaps with an existing slot",
          details: "Selected slot conflicts with an already scheduled slot.",
        },
        409
      );
    }

    // Save new slot
    const slot = await new DoctorSlot({
      doctorId: parseInt(doctorId),
      date,
      startTime,
      endTime,
      slotDuration: parseInt(slotDuration),
    }).save();

    return sendSuccess(
      res,
      {
        message: "Slot added successfully",
        slot,
      },
      201
    );
  } catch (err) {
    console.error("Error adding slot:", err);
    return sendError(res, err);
  }
};

/**
 * Fetches all slots for a doctor.
 * If query param `date` is provided, filters by date.
 */
export const getDoctorSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    if (!doctorId) {
      return sendError(res, "Doctor ID is required", 400);
    }
    const query = { doctorId: parseInt(doctorId) };
    if (date) query.date = date;

    const slots = await DoctorSlot.find(query).sort({ date: 1, startTime: 1 });
    return res.status(200).json(slots);
  } catch (err) {
    console.error("Error fetching doctor slots:", err);
    return sendError(res, err);
  }
};

/**
 * Updates an existing slot's time and duration.
 * Prevents update if bookings already exist in the time range.
 */
export const updateSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const { startTime, endTime, slotDuration } = req.body;

    if (!startTime || !endTime || !slotDuration) {
      return sendError(res, "All fields are required", 400);
    }

    if (endTime <= startTime) {
      return sendError(res, "End time must be after start time", 400);
    }

    // Check if slot exists
    const slot = await DoctorSlot.findById(slotId);
    if (!slot) {
      return sendError(res, "Slot not found", 404);
    }

    // Check overlap with other slots of same doctor on same date
    const existingSlots = await DoctorSlot.find({
      doctorId: slot.doctorId,
      date: slot.date,
      _id: { $ne: slotId },
    });

    const isOverlap = existingSlots.some(
      (s) => startTime < s.endTime && s.startTime < endTime
    );

    if (isOverlap) {
      return sendError(
        res,
        {
          message: "Slot overlaps with an existing slot",
          details:
            "The new time range conflicts with another slot for the doctor.",
        },
        409
      );
    }

    // Prevent update if appointments exist in the current slot
    const existingBookings = await Appointment.find({
      doctorId: slot.doctorId,
      date: slot.date,
      time: { $gte: startTime, $lte: endTime },
    });

    if (existingBookings.length > 0) {
      return sendError(res, "Cannot update slot with existing bookings", 400);
    }

    const updatedSlot = await DoctorSlot.findByIdAndUpdate(
      slotId,
      {
        startTime,
        endTime,
        slotDuration: parseInt(slotDuration),
      },
      { new: true }
    );

    return sendSuccess(res, {
      message: "Slot updated successfully",
      slot: updatedSlot,
    });
  } catch (err) {
    console.error("Error updating slot:", err);
    return sendError(res, err);
  }
};

/**
 * Deletes a slot only if there are no appointments in that slot.
 */
export const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    // Find the slot to be deleted
    const slot = await DoctorSlot.findById(slotId);
    if (!slot) {
      return sendError(res, "Slot not found", 404);
    }

    // Find bookings that overlap with the slot's time range
    const overlappingBookings = await Appointment.find({
      doctorId: slot.doctorId,
      date: slot.date,
      time: { $gte: slot.startTime, $lt: slot.endTime }, // Check if appointment time is within slot range
    });

    // If any bookings exist in the slot's time range, reject deletion
    if (overlappingBookings.length > 0) {
      return sendError(
        res,
        {
          message:
            "Cannot delete slot with existing bookings in its time range",
          details:
            "Please cancel the existing appointments before deleting this slot.",
        },
        400
      );
    }

    // Otherwise, delete the slot
    await DoctorSlot.findByIdAndDelete(slotId);
    return sendSuccess(res, { message: "Slot deleted successfully" });
  } catch (err) {
    console.error("Error deleting slot:", err);
    return sendError(res, err);
  }
};

/**
 * Returns only available (unbooked) time slots for a doctor on a specific date.
 */
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return sendError(res, "Date parameter is required", 400);
    }

    const slots = await DoctorSlot.find({
      doctorId: parseInt(doctorId),
      date,
    });

    if (!slots || slots.length === 0) {
      return sendSuccess(res, { available: [] });
    }

    const booked = await Appointment.find({
      doctorId: parseInt(doctorId),
      date,
    }).select("time -_id");

    const bookedTimes = booked.map((b) => b.time);

    let allAvailableSlots = [];

    for (const slot of slots) {
      const slotsForRange = generateSlots(
        slot.startTime,
        slot.endTime,
        slot.slotDuration
      );
      allAvailableSlots.push(...slotsForRange);
    }

    allAvailableSlots = [...new Set(allAvailableSlots)].sort();
    const available = allAvailableSlots.filter((t) => !bookedTimes.includes(t));

    return sendSuccess(res, { available });
  } catch (err) {
    console.error("Error fetching available slots:", err);
    return sendError(res, err);
  }
};

/**
 * Returns all slots for a doctor on a date, each marked as `isBooked: true/false`.
 */
export const getAllSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) return sendError(res, "Date parameter is required", 400);

    const slots = await DoctorSlot.find({ doctorId: parseInt(doctorId), date });
    if (!slots || slots.length === 0) return res.json([]);

    const booked = await Appointment.find({
      doctorId: parseInt(doctorId),
      date,
    }).select("time -_id");
    const bookedTimes = booked.map((b) => b.time);

    let allSlots = [];
    for (const slot of slots) {
      const slotsForRange = generateSlots(
        slot.startTime,
        slot.endTime,
        slot.slotDuration
      );
      allSlots.push(...slotsForRange);
    }

    allSlots = [...new Set(allSlots)].sort();

    // Return status for UI display
    const slotsWithStatus = allSlots.map((time) => ({
      time,
      isBooked: bookedTimes.includes(time),
    }));

    return res.json(slotsWithStatus);
  } catch (err) {
    console.error("Error fetching all slots:", err);
    return sendError(res, err);
  }
};

/**
 * Returns list of unique doctor IDs that have slots in the system.
 */
export const getDistinctDoctors = async (_, res) => {
  try {
    const doctors = await DoctorSlot.distinct("doctorId");
    return res.json(doctors);
  } catch (err) {
    console.error("Error fetching doctors:", err);
    return sendError(res, err);
  }
};
