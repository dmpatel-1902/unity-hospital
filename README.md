# Unity Hospital - Full Stack Website

Ye ek complete full-stack Hospital Management website hai:
- **Frontend**: HTML, CSS (Bootstrap), JavaScript (`public/` folder)
- **Backend**: Node.js + Express + MongoDB (`server.js`, `routes/`, `models/`)

Login, Registration, Appointment Booking, aur Contact Form — sab database (MongoDB) se connected hain.

---

## 🚀 Project run kaise karein (Step by Step)

### Step 1: Node.js install karein
Agar Node.js install nahi hai to [nodejs.org](https://nodejs.org) se install kar lein (v18 ya usse upar).

### Step 2: MongoDB ready karein
Do options hain:

**Option A — Apne computer par MongoDB install karein (Local)**
1. [MongoDB Community Server](https://www.mongodb.com/try/download/community) install karein
2. MongoDB service start karein
3. `.env` file me `MONGO_URI` already local ke liye set hai:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/unity_hospital_db
   ```

**Option B — MongoDB Atlas (Free Cloud DB, koi install nahi chahiye)**
1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) par free account banayein
2. Ek free cluster banayein aur "Connect" > "Drivers" se connection string copy karein
3. `.env` file me `MONGO_URI` ko us connection string se replace kar dein

### Step 3: Email OTP ke liye SMTP setup karein
Registration ke waqt user ko email par ek 6-digit OTP jaata hai (verify karne ke liye). Iske liye aapko `.env` file me apni email credentials daalni hongi.

**Gmail use karne ke liye (sabse aasan):**
1. Apne Google Account me jaayein: **Google Account → Security → 2-Step Verification** ko ON karein (agar pehle se ON nahi hai)
2. Fir **Security → App Passwords** par jaayein
3. Ek naya App Password banayein (app: "Mail", device: "Other") — Google aapko 16-character ka password dega
4. `.env` file kholein aur ye values bharein:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=<wahi 16-character app password jo Google ne diya>
   EMAIL_FROM=your-email@gmail.com
   ```
   ⚠️ Apna normal Gmail password mat use karna — sirf App Password use karein, warna email bhejna fail ho jayega.

**Koi doosri email service use karni ho** (Outlook, Yahoo, Zoho, ya company ka SMTP) to bas `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` apni service ke hisaab se badal dein.

### Step 4: Dependencies install karein
Terminal/CMD me project folder ke andar jaake ye command chalayein:
```bash
npm install
```

### Step 5: Doctors ka data database me daalein (ek baar)
```bash
npm run seed
```
Ye command doctors.html me diye 8 doctors ko database me add kar degi.

### Step 6: Server start karein
```bash
npm start
```

Terminal me ye message aana chahiye:
```
Server running on http://localhost:5000
MongoDB connected
```

### Step 7: Browser me kholein
Browser me jaake ye URL open karein:
```
http://localhost:5000
```

Bas! Ab poori website (Home, Login, Registration, Appointment Booking, Doctors, Contact, etc.) yahin se chalegi — same server frontend aur backend dono serve karta hai.

## 👤 Login ke baad Profile aur Logout
- Login karne ke baad navbar me "REGISTRATION" aur "LOGIN" links ki jagah **"Hi, <naam>"** (My Profile) aur **LOGOUT** dikhega.
- "My Profile" par click karke `profile.html` par apna naam aur email dekh sakte hain.
- "Logout" par click karte hi session clear ho jayega aur wapas guest (Login/Registration) menu dikhega.
- Ye login state browser ke `localStorage` me store hota hai — jab tak logout na karein, saari pages (Home, About, Doctors, etc.) refresh/switch karne par bhi login state yaad rahega.

---

## 📁 Project Structure
```
├── server.js              # Main Express server (frontend + API serve karta hai)
├── seed.js                # Doctors ko database me add karne ki script
├── .env                   # Database connection settings
├── models/                # MongoDB schemas (User, Doctor, Appointment, Contact)
├── routes/                # API routes (/api/auth, /api/appointments, /api/doctors, /api/contact)
└── public/                # Poora frontend (HTML, CSS, images, JS)
    └── assets/js/backend.js   # Frontend ko backend se connect karne wali JS file
```

## 🔌 Available API Endpoints
| Method | Route | Kaam |
|---|---|---|
| POST | `/api/auth/register` | Naya user register karna (isse OTP email par jaata hai) |
| POST | `/api/auth/verify-otp` | OTP verify karke account activate karna |
| POST | `/api/auth/resend-otp` | OTP dobara bhejna |
| POST | `/api/auth/login` | Login karna (sirf verified accounts ke liye) |
| POST | `/api/appointments/book` | Appointment book karna |
| GET | `/api/appointments` | Sab appointments dekhna |
| GET | `/api/doctors` | Sab doctors ki list |
| POST | `/api/doctors/add` | Naya doctor add karna |
| POST | `/api/contact` | Contact form ka message save karna |

## ✉️ Email OTP Verification kaise kaam karta hai
1. User Registration form bharke submit karta hai
2. Backend ek 6-digit OTP generate karke us email par bhejta hai (10 minute tak valid)
3. Registration page par OTP dalne ka box dikhta hai — user code enter karta hai
4. Sahi OTP dalte hi account **verified** ho jaata hai aur user **automatically login** ho kar seedha Home page par chala jaata hai (dobara email/password dalne ki zaroorat nahi)
5. Agar koi verify kiye bina login karne ki koshish kare, to use "Verify now" link milega jo OTP step par le jaayega
6. "Resend OTP" link se naya code mangwaya ja sakta hai

## ⚠️ Common Problems

**"MongoDB connected" nahi dikh raha / DB error aa raha hai**
→ MongoDB service start nahi hui hai, ya `.env` me `MONGO_URI` galat hai. Step 2 dobara check karein.

**Page pe CSS/images nahi dikh rahe**
→ Confirm karein ki `public/assets` folder poora present hai, aur aap site ko `http://localhost:5000` se hi khol rahe hain (seedha HTML file double-click karke nahi).

**Login/Register/Appointment submit karne par error aa raha hai**
→ MongoDB connect nahi hai. Server terminal me error message check karein.
