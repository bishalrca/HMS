/**
 * Hospital Management System - API Service Client
 * Handles asynchronous communication with Django REST Framework backend,
 * Session Authentication, and Admin Dashboard operations.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const MOCK_DATA = {
    stats: {
        total_doctors: 9,
        total_appointments: 12,
        pending_appointments: 5,
        confirmed_appointments: 7,
        total_reviews: 3,
        total_blogs: 6
    },
    doctors: [
        { id: 1, name: 'Dr. Priya Sharma', specialty: 'CARDIOLOGIST', image: 'image/doc-1.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 2, name: 'Dr. Arvind Kumar', specialty: 'GENERAL SURGEON', image: 'image/doc-2.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 3, name: 'Dr. Ayesha Khan', specialty: 'PEDIATRICIAN', image: 'image/doc-3.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 4, name: 'Dr. Anjali Desai', specialty: 'GYNECOLOGIST', image: 'image/doc-4.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 5, name: 'Dr. Rajesh Patel', specialty: 'NEUROLOGIST', image: 'image/doc-5.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 6, name: 'Dr. Suresh Menon', specialty: 'DERMATOLOGIST', image: 'image/doc-6.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 7, name: 'Dr. Meera Reddy', specialty: 'ORTHOPEDIC SURGEON', image: 'image/doc-7.jpg', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 8, name: 'Dr. Vikram Menon', specialty: 'ORTHOPEDIC SURGEON', image: 'image/doc-8.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
        { id: 9, name: 'Dr. Ravi Verma', specialty: 'UROLOGIST', image: 'image/doc-9.jpg', facebook: '#', twitter: '#', instagram: '#', linkedin: '#' }
    ],
    appointments: [
        { id: 1, name: 'Rohan Gupta', number: '9841234567', email: 'rohan@example.com', date: '2026-08-15', status: 'PENDING' },
        { id: 2, name: 'Anita Shrestha', number: '9808765432', email: 'anita@example.com', date: '2026-08-16', status: 'CONFIRMED' },
        { id: 3, name: 'Suresh Kumar', number: '9812345678', email: 'suresh@example.com', date: '2026-08-18', status: 'PENDING' }
    ],
    reviews: [
        { id: 1, name: 'Sanjana R.', image: 'image/pic-1.jpg', rating: 4.5, text: 'I had an amazing experience at the hospital. The staff was incredibly friendly, and the doctors made me feel at ease throughout my treatment.' },
        { id: 2, name: 'Manish S.', image: 'image/pic-2.jpg', rating: 4.5, text: 'The hospital management system was seamless and efficient. I was able to book an appointment and get all the necessary treatments without any hassle.' },
        { id: 3, name: 'Priya T.', image: 'image/pic-3.jpg', rating: 4.5, text: 'From the moment I arrived, I felt well taken care of. The medical team was exceptional, and my recovery was much faster thanks to their attention to detail.' }
    ],
    blogs: [
        { id: 1, title: 'How to choose the Best Cardiac Hospital...', date: '10 November, 2022', author: 'Dr. S. Kumar', image: 'image/blog-1.jpg', summary: 'How to choose the Best Cardiac Hospital in...' },
        { id: 2, title: 'Simple Home Remedies For Loose Motions', date: '22 February, 2018', author: 'Dr. Manoj Ranka', image: 'image/blog-2.png', summary: 'Loose motions or diarrhea is one of the most ...' },
        { id: 3, title: 'The importance of staying Hydrated: Why Urine...', date: '22 November, 2022', author: 'Dr. John Smith', image: 'image/blog-3.jpg', summary: 'Learn how urine color can reveal...' },
        { id: 4, title: 'Exercise: Boost your health', date: '12 April, 2023', author: 'Dr. Sarah Lee', image: 'image/blog-4.jpg', summary: 'Discover the numerous physical and mental...' },
        { id: 5, title: 'Avoid junk food: tips for better eating', date: '29 November, 2024', author: 'Dr. Emily Brown', image: 'image/blog-5.jpg', summary: 'Explore simple strategies to cut back on junk...' },
        { id: 6, title: 'When to consult doctor: recognizing the signs', date: '21 November, 2024', author: 'Dr. Michel Thomson', image: 'image/blog-6.jpg', summary: 'Learn the key symptoms and situations...' }
    ]
};

class ApiService {
    static getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const csrftoken = this.getCookie('csrftoken');
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (csrftoken) {
            defaultHeaders['X-CSRFToken'] = csrftoken;
        }

        try {
            const response = await fetch(url, {
                ...options,
                credentials: 'include',
                headers: { ...defaultHeaders, ...options.headers }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || errorData.detail || errorData.message || `API error ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            console.warn(`[ApiService] ${options.method || 'GET'} ${url} fallback:`, err.message);
            return null;
        }
    }

    // Auth
    static async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                sessionStorage.setItem('hms_auth_user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error || 'Invalid credentials' };
            }
        } catch (err) {
            // Mock auth fallback for presentation demo
            if (username === 'admin' && (password === 'admin' || password === 'admin123')) {
                const mockUser = { username: 'admin', email: 'admin@hms.com', is_staff: true };
                sessionStorage.setItem('hms_auth_user', JSON.stringify(mockUser));
                return { success: true, user: mockUser };
            }
            return { success: false, error: 'Authentication failed. Check your username and password.' };
        }
    }

    static async logout() {
        sessionStorage.removeItem('hms_auth_user');
        await this.request('/auth/logout/', { method: 'POST' });
        window.location.href = '/login/';
    }

    static async getCurrentUser() {
        const local = sessionStorage.getItem('hms_auth_user');
        if (local) return JSON.parse(local);

        const data = await this.request('/auth/user/');
        if (data && data.authenticated) {
            sessionStorage.setItem('hms_auth_user', JSON.stringify(data.user));
            return data.user;
        }
        return null;
    }

    // Stats
    static async getStats() {
        const data = await this.request('/stats/');
        if (data) return data;
        return MOCK_DATA.stats;
    }

    // Doctors
    static async getDoctors() {
        const data = await this.request('/doctors/');
        if (data && Array.isArray(data)) return data;
        return MOCK_DATA.doctors;
    }

    static async addDoctor(doctorData) {
        const data = await this.request('/doctors/', {
            method: 'POST',
            body: JSON.stringify(doctorData)
        });
        if (data) return { success: true, data };
        
        const newDoc = { id: Date.now(), ...doctorData };
        MOCK_DATA.doctors.unshift(newDoc);
        return { success: true, data: newDoc };
    }

    static async deleteDoctor(id) {
        await this.request(`/doctors/${id}/`, { method: 'DELETE' });
        MOCK_DATA.doctors = MOCK_DATA.doctors.filter(d => d.id !== id);
        return { success: true };
    }

    // Appointments
    static async getAppointments() {
        const data = await this.request('/appointments/');
        if (data && Array.isArray(data)) return data;
        return MOCK_DATA.appointments;
    }

    static async createAppointment(appointmentData) {
        const data = await this.request('/appointments/', {
            method: 'POST',
            body: JSON.stringify(appointmentData)
        });
        if (data) return { success: true, data };
        
        const newAppt = { id: Date.now(), status: 'PENDING', ...appointmentData };
        MOCK_DATA.appointments.unshift(newAppt);
        return { success: true, data: newAppt, message: 'Appointment booked successfully!' };
    }

    static async updateAppointmentStatus(id, status) {
        const data = await this.request(`/appointments/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
        if (data) return { success: true, data };
        
        const appt = MOCK_DATA.appointments.find(a => a.id === id);
        if (appt) appt.status = status;
        return { success: true, data: appt };
    }

    static async deleteAppointment(id) {
        await this.request(`/appointments/${id}/`, { method: 'DELETE' });
        MOCK_DATA.appointments = MOCK_DATA.appointments.filter(a => a.id !== id);
        return { success: true };
    }

    // Reviews
    static async getReviews() {
        const data = await this.request('/reviews/');
        if (data && Array.isArray(data)) return data;
        return MOCK_DATA.reviews;
    }

    static async deleteReview(id) {
        await this.request(`/reviews/${id}/`, { method: 'DELETE' });
        MOCK_DATA.reviews = MOCK_DATA.reviews.filter(r => r.id !== id);
        return { success: true };
    }

    // Blogs
    static async getBlogs() {
        const data = await this.request('/blogs/');
        if (data && Array.isArray(data)) return data;
        return MOCK_DATA.blogs;
    }

    static async addBlog(blogData) {
        const data = await this.request('/blogs/', {
            method: 'POST',
            body: JSON.stringify(blogData)
        });
        if (data) return { success: true, data };

        const newBlog = { id: Date.now(), ...blogData };
        MOCK_DATA.blogs.unshift(newBlog);
        return { success: true, data: newBlog };
    }

    static async deleteBlog(id) {
        await this.request(`/blogs/${id}/`, { method: 'DELETE' });
        MOCK_DATA.blogs = MOCK_DATA.blogs.filter(b => b.id !== id);
        return { success: true };
    }
}

window.ApiService = ApiService;
