import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctorId: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Doctor ID must be an integer'
    }
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'Date must be today or in the future'
    }
  },
  time: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    message: 'Time must be in HH:MM format'
  },
  patientName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Patient name must be at least 2 characters long'],
    maxlength: [50, 'Patient name cannot exceed 50 characters']
  },
}, {
  timestamps: true
});

// Compound index to prevent double booking
appointmentSchema.index({ doctorId: 1, date: 1, time: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);

