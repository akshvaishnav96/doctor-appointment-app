"use client";
import { useEffect, useState } from "react";
import { api } from "../../../lib/api.js";

export default function ManageSlotsPage() {
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingSlot, setEditingSlot] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editModalError, setEditModalError] = useState("");
  const [deleteSlotId, setDeleteSlotId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState("");

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (doctorId) {
      loadSlots();
    }
  }, [doctorId]);

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
      const slots = await api.getDoctorSlots(doctorId);
      setSlots(slots);
    } catch (error) {
      setMessage(`Error loading slots: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (e) => {
    const selectedDoctor = e.target.value;
    setDoctorId(selectedDoctor);
    if (!selectedDoctor) {
      setSlots([]);
    }
  };

  const handleEditSlot = (slot) => {
    setEditingSlot(slot);
    setEditModalError("");
    setShowEditModal(true);
  };

  const handleUpdateSlot = async (e) => {
    e.preventDefault();
    if (!editingSlot) return;
    setEditModalError("");
    try {
      const result = await api.updateSlot(editingSlot._id, {
        startTime: editingSlot.startTime,
        endTime: editingSlot.endTime,
        slotDuration: editingSlot.slotDuration,
      });
      if (result.error) {
        setEditModalError(result.error);
      } else {
        setMessage("Slot updated successfully!");
        setShowEditModal(false);
        setEditingSlot(null);
        loadSlots();
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setEditModalError(error.message);
    }
  };

  const handleDeleteSlot = (slotId) => {
    setDeleteSlotId(slotId);
    setDeleteModalError("");
    setShowDeleteModal(true);
  };

  const confirmDeleteSlot = async () => {
    if (!deleteSlotId) return;
    setDeleteModalError("");
    try {
      const result = await api.deleteSlot(deleteSlotId);
      if (result.error) {
        setDeleteModalError(result.error);
      } else {
        setMessage("Slot deleted successfully!");
        loadSlots();
        setShowDeleteModal(false);
        setDeleteSlotId(null);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      setDeleteModalError(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const deleteModal = showDeleteModal && (
   <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-white/95 p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Delete Slot</h3>
        {deleteModalError && (
          <div className="p-3 mb-4 rounded bg-red-100 text-red-700">
            {deleteModalError}
          </div>
        )}
        <p className="mb-4">
          Are you sure you want to delete this slot? This action cannot be
          undone.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={confirmDeleteSlot}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteSlotId(null);
              setDeleteModalError("");
            }}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">
        Manage Doctor Slots
      </h2>
      {deleteModal}

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

      {/* Doctor Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-slate-700">
          Select Doctor
        </label>
        <select
          value={doctorId}
          onChange={handleDoctorChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select Doctor ID</option>
          {doctors.map((id) => (
            <option key={id} value={id}>
              Doctor {id}
            </option>
          ))}
        </select>
      </div>

      {/* Slots List */}
      {doctorId && (
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">
              Slots for Doctor {doctorId}
            </h3>
            <span className="text-sm text-slate-600 font-medium">
              {slots.length} slot{slots.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-slate-600 font-medium">Loading slots...</div>
            </div>
          ) : slots.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border-b">Date</th>
                    <th className="text-left p-3 border-b">Start Time</th>
                    <th className="text-left p-3 border-b">End Time</th>
                    <th className="text-left p-3 border-b">Duration</th>
                    <th className="text-left p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map((slot) => (
                    <tr key={slot._id} className="hover:bg-gray-50">
                      <td className="p-3 border-b">{formatDate(slot.date)}</td>
                      <td className="p-3 border-b font-medium">
                        {slot.startTime}
                      </td>
                      <td className="p-3 border-b font-medium">
                        {slot.endTime}
                      </td>
                      <td className="p-3 border-b">
                        {slot.slotDuration} minutes
                      </td>
                      <td className="p-3 border-b">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSlot(slot)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSlot(slot._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-slate-600 font-medium">
                No slots found for this doctor
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSlot && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 p-6 rounded-lg max-w-md w-full mx-4 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Slot</h3>
            {editModalError && (
              <div className="p-3 mb-4 rounded bg-red-100 text-red-700">
                {editModalError}
              </div>
            )}
            <form onSubmit={handleUpdateSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Date
                </label>
                <input
                  type="date"
                  value={editingSlot.date.split("T")[0]}
                  disabled
                  className="w-full p-3 border rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editingSlot.startTime}
                  onChange={(e) =>
                    setEditingSlot({
                      ...editingSlot,
                      startTime: e.target.value,
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  End Time
                </label>
                <input
                  type="time"
                  value={editingSlot.endTime}
                  onChange={(e) =>
                    setEditingSlot({ ...editingSlot, endTime: e.target.value })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">
                  Slot Duration
                </label>
                <select
                  value={editingSlot.slotDuration}
                  onChange={(e) =>
                    setEditingSlot({
                      ...editingSlot,
                      slotDuration: parseInt(e.target.value),
                    })
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {[15, 30, 45, 60].map((d) => (
                    <option key={d} value={d}>
                      {d} minutes
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Update Slot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingSlot(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
