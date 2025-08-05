import { Router } from "express";
import {
  addSlot,
  getDoctorSlots,
  updateSlot,
  deleteSlot,
  getAvailableSlots,
  getAllSlots,
  getDistinctDoctors,
} from "../controllers/doctorSlotController.js";

import {
  bookAppointment,
  cancelAppointment,
  getBookingsByDate,
  getAllBookings,
} from "../controllers/appointmentController.js";

const router = Router();

// ----- Doctor Slot Routes -----
router.post("/slots", addSlot);
router.get("/doctor-slots/:doctorId", getDoctorSlots);
router.put("/slots/:slotId", updateSlot);
router.delete("/slots/:slotId", deleteSlot);
router.get("/slots/:doctorId", getAvailableSlots);
router.get("/all-slots/:doctorId", getAllSlots);
router.get("/doctors", getDistinctDoctors);

// ----- Appointment Routes -----
router.post("/book", bookAppointment);
router.delete("/book/:bookingId", cancelAppointment);
router.get("/bookings/:date", getBookingsByDate);
router.get("/bookings", getAllBookings);

export default router;
