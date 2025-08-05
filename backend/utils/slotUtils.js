/**
 * Generates an array of time slots between a given start and end time.
 *
 * @param startTime - Start time in "HH:mm" format (e.g., "09:00")
 * @param endTime - End time in "HH:mm" format (e.g., "17:00")
 * @param durationInMinutes - Duration of each slot in minutes (e.g., 30)
 * @returns Array of time slot strings in "HH:mm" format
 */
export function generateSlots(startTime, endTime, durationInMinutes) {
  const timeSlots = [];

  // Convert startTime and endTime strings to minutes since midnight
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  let currentTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  // Generate time slots while there's room for one more full slot
  while (currentTimeInMinutes + durationInMinutes <= endTimeInMinutes) {
    const hour = Math.floor(currentTimeInMinutes / 60);
    const minute = currentTimeInMinutes % 60;

    // Format the hour and minute into "HH:mm"
    const formattedSlot = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    timeSlots.push(formattedSlot);
    currentTimeInMinutes += durationInMinutes;
  }

  return timeSlots;
}
