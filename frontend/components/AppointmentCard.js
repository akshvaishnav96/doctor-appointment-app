export default function AppointmentCard({ appointment }) {
  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h3 className="text-lg font-semibold">{appointment.doctor}</h3>
      <p>Patient: {appointment.patient}</p>
      <p>Date: {appointment.date}</p>
    </div>
  );
}
