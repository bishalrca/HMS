# Hospital Management System (HMS) - Med_Minus

A modern, production-grade **Hospital Management System (HMS)** built for college project defense presentation. Featuring a **modular static HTML/CSS/JS frontend** and a **Django REST Framework (DRF) + PostgreSQL backend**.

---

## 🏛️ Architecture Overview

```
Hospital_Management_System/
├── static/
│   ├── css/
│   │   ├── global.css        # Root design system, CSS variables, resets & buttons
│   │   ├── header.css        # Fixed navigation bar & mobile menu styling
│   │   ├── home.css          # Hero section & metric counter icons
│   │   ├── about.css         # Hospital mission & background row
│   │   ├── services.css      # Services cards grid
│   │   ├── doctors.css       # Doctor profiles grid & social links
│   │   ├── appointment.css   # Appointment booking form & status badges
│   │   ├── review.css        # Patient reviews with curved pseudo header & star ratings
│   │   ├── blogs.css         # Article grid with zoom hover effects
│   │   ├── footer.css        # Footer columns & credit text
│   │   └── style.css         # Master import sheet for all modular styles
│   ├── js/
│   │   ├── api.js            # Central API Service Client (DRF fetch + offline fallback)
│   │   ├── main.js           # Header navbar toggle & global page events
│   │   ├── doctors.js        # Dynamic doctors loader & renderer
│   │   ├── appointment.js    # Asynchronous appointment booking form submission
│   │   ├── reviews.js        # Dynamic client review renderer
│   │   └── blogs.js          # Dynamic blog articles renderer
│   └── image/                # SVG/JPG image assets
├── pages/                    # Dedicated standalone HTML pages
│   ├── about.html
│   ├── services.html
│   ├── doctors.html
│   ├── appointment.html
│   ├── reviews.html
│   └── blogs.html
├── index.html                # Master landing page linking modular static assets
└── backend/                  # Django REST Framework backend reference
    ├── environment.yml       # Conda environment definition for env3.11
    ├── requirements.txt      # Pip requirements file
    ├── manage.py
    ├── hms_backend/          # Django settings & root URLs
    └── api/                  # DRF API app (Models, Views, Serializers, URLs)
```

---

## 🚀 Setup & Execution Guide

### 1. Conda Environment Setup

Activate your Conda environment (`env3.11`):

```bash
conda activate env3.11
```

If you need to create or re-install dependencies into `env3.11`:

```bash
cd backend
conda env update -f environment.yml --prune
# OR using pip inside activated conda env:
pip install -r requirements.txt
```

### 2. Django Backend Server Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Apply database migrations:

```bash
python manage.py migrate
```

Start the Django REST Framework development server:

```bash
python manage.py runserver 127.0.0.1:8000
```

The API endpoints will be accessible at:
- **Doctors**: `GET /api/doctors/`
- **Appointments**: `POST /api/appointments/`
- **Reviews**: `GET /api/reviews/`
- **Blogs**: `GET /api/blogs/`

### 3. Frontend Execution

Open `index.html` directly in your browser or serve it using any HTTP static server:

- Simply double-click `index.html`, or
- Use VS Code Live Server extension.

---

## ⚡ Offline Fallback Mode

The JavaScript layer (`static/js/api.js`) is engineered with **hybrid resilience**:
- When the Django DRF backend is running (`http://127.0.0.1:8000/api`), the application fetches live PostgreSQL data.
- If the server is offline during a presentation or demo preview, `api.js` gracefully logs a fallback notice and serves pre-configured mock data so the presentation never fails.

---

## 💻 Tech Stack
- **Frontend**: HTML5, Modular CSS3 (Vanilla CSS variables), JavaScript (ES6+ Async/Await, Fetch API), FontAwesome 5.
- **Backend**: Python 3.11 (Conda `env3.11`), Django 4.2+, Django REST Framework, Django Cors Headers.
- **Database**: PostgreSQL (with SQLite fallback for rapid testing).
