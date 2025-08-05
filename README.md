# 🩺 Doctor Appointment Booking - Backend API

This is the backend service for a Doctor Appointment Booking system. It is built with **Node.js**, **Express.js**, and **MongoDB** (via **Mongoose**) to provide REST APIs for:

- Managing doctor slot schedules
- Viewing and booking available slots
- Cancelling appointments
- Viewing bookings by date or in total

---

## 📁 Folder Structure

```
/backend
├── controllers/
│   ├── appointmentController.js
│   └── doctorSlotController.js
├── models/
│   ├── Appointment.js
│   └── DoctorSlot.js
├── routes/
│   └── router.js
├── utils/
│   └── responseHandler.js
├── .env
├── app.js
└── package.json
```

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/appointment-booking-backend.git
cd appointment-booking-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set environment variables

Create a `.env` file at the root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/appointmentDB
FRONTEND_URL=http://localhost:3000
```

### 4. Start the server

```bash
npm run dev  # or npm start
```

Server runs at: `http://localhost:5000`

---

## 🔌 API Endpoints

### 🗓️ Doctor Slot Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/slots` | Add a new time range slot for a doctor |
| `GET`  | `/doctor-slots/:doctorId` | Get all defined slots (not filtered) for a doctor |
| `PUT`  | `/slots/:slotId` | Update a doctor’s slot by slot ID |
| `DELETE`| `/slots/:slotId` | Delete a doctor’s slot by slot ID |
| `GET`  | `/slots/:doctorId?date=YYYY-MM-DD` | Get **available** slots (excluding booked ones) for a specific doctor and date |
| `GET`  | `/all-slots/:doctorId?date=YYYY-MM-DD` | Get **all** slots (booked + unbooked) for a doctor on a given date |
| `GET`  | `/doctors` | Get list of all distinct doctor IDs with active slots |

---

### 🩺 Appointment Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/book` | Book an appointment (requires doctorId, date, time, patientName) |
| `DELETE` | `/book/:bookingId` | Cancel an existing appointment |
| `GET`  | `/bookings/:date` | Get all appointments for a given date |
| `GET`  | `/bookings` | Get all appointments (optionally filter on frontend) |

---

## 🧠 Features

- Slot generation for flexible durations (e.g., 15/30/45 mins)
- Bookings conflict check
- Return proper HTTP status codes (`400`, `409`, `201`, etc.)
- Modular code with controllers and utility functions

---

## 🧑‍💻 Author

**Akash Diwakar**  
[LinkedIn →](https://www.linkedin.com/in/akash-diwakar-112b601ba/)
