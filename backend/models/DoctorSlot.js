import mongoose from "mongoose";

const doctorSlotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Doctor ID must be an integer",
      },
    },
    date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const slot = this;
          const [hour, min] = slot.startTime.split(":").map(Number);
          const slotDateTime = new Date(value);
          slotDateTime.setHours(hour, min, 0, 0);

          return slotDateTime > new Date();
        },
        message: "Slot start time must be in the future",
      },
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      message: "Start time must be in HH:MM format",
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      message: "End time must be in HH:MM format",
    },
    slotDuration: {
      type: Number,
      enum: [15, 30, 45, 60],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries (not unique - allows multiple slots per doctor per date)
// This allows doctors to have multiple time ranges on the same date
doctorSlotSchema.index({ doctorId: 1, date: 1 }, { unique: false });

export default mongoose.model("DoctorSlot", doctorSlotSchema);
