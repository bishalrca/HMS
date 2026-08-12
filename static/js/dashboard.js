/**
 * Admin Dashboard Management Scripts
 * Handles Appointments, Doctors, Blogs, and Reviews Data Rendering with Dedicated Route Actions
 */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const user = await window.ApiService.getCurrentUser();
        const adminUserLabel = document.getElementById('admin-username');
        if (adminUserLabel && user) {
            adminUserLabel.textContent = user.username || 'Admin';
        }
    } catch (e) {
        console.warn('User check failed:', e);
    }

    loadDashboardStats();
    loadAppointmentsTable();
    loadDoctorsGrid();
    loadBlogsGrid();
    loadReviewsList();
});

// Logout Handler
async function handleLogout() {
    if (confirm('Are you sure you want to log out of the admin portal?')) {
        await window.ApiService.logout();
    }
}

// Load Stats Summary
async function loadDashboardStats() {
    try {
        const stats = await window.ApiService.getStats();
        if (stats) {
            const docEl = document.getElementById('stat-doctors');
            const apptEl = document.getElementById('stat-appointments');
            const pendEl = document.getElementById('stat-pending');
            const confEl = document.getElementById('stat-confirmed');

            if (docEl) docEl.textContent = stats.total_doctors || 0;
            if (apptEl) apptEl.textContent = stats.total_appointments || 0;
            if (pendEl) pendEl.textContent = stats.pending_appointments || 0;
            if (confEl) confEl.textContent = stats.confirmed_appointments || 0;
        }
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
}

// Appointments Table Management
async function loadAppointmentsTable() {
    const tbody = document.getElementById('appointments-tbody');
    if (!tbody) return;

    try {
        const appointments = await window.ApiService.getAppointments();
        if (!appointments || appointments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No appointments yet.</td></tr>';
            return;
        }

        tbody.innerHTML = appointments.map(appt => `
            <tr>
                <td>#${appt.id}</td>
                <td><strong>${escapeHtml(appt.name)}</strong></td>
                <td>${escapeHtml(appt.number)}</td>
                <td>${escapeHtml(appt.email)}</td>
                <td>${appt.date}</td>
                <td><span class="badge ${appt.status.toLowerCase()}">${appt.status}</span></td>
                <td>
                    <a href="/dashboard/appointments/edit/${appt.id}/" class="action-btn btn-approve"><i class="fas fa-edit"></i> Edit</a>
                    ${appt.status !== 'CONFIRMED' ? `<button class="action-btn btn-approve" onclick="updateApptStatus(${appt.id}, 'CONFIRMED')"><i class="fas fa-check"></i> Approve</button>` : ''}
                    ${appt.status !== 'CANCELLED' ? `<button class="action-btn btn-cancel" onclick="updateApptStatus(${appt.id}, 'CANCELLED')"><i class="fas fa-times"></i> Cancel</button>` : ''}
                    <button class="action-btn btn-delete" onclick="deleteAppt(${appt.id})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load appointments table:', err);
    }
}

async function updateApptStatus(id, status) {
    const res = await window.ApiService.updateAppointmentStatus(id, status);
    if (res.success) {
        loadAppointmentsTable();
        loadDashboardStats();
    }
}

async function deleteAppt(id) {
    if (confirm('Are you sure you want to delete this appointment record?')) {
        const res = await window.ApiService.deleteAppointment(id);
        if (res.success) {
            loadAppointmentsTable();
            loadDashboardStats();
        }
    }
}

// Doctors Data Table Management
async function loadDoctorsGrid() {
    const tbody = document.getElementById('doctors-tbody') || document.getElementById('admin-doctors-container');
    if (!tbody) return;

    try {
        const doctors = await window.ApiService.getDoctors();
        if (!doctors || doctors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No doctors registered.</td></tr>';
            return;
        }

        tbody.innerHTML = doctors.map(doc => {
            const rawImg = doc.image || 'image/doc-1.jpg';
            const imgSrc = rawImg.startsWith('/') ? rawImg : '/' + rawImg;

            return `
            <tr>
                <td>#${doc.id}</td>
                <td><img src="${imgSrc}" alt="${escapeHtml(doc.name)}" style="width: 4.5rem; height: 4.5rem; border-radius: 50%; object-fit: cover; border: .2rem solid var(--green);"></td>
                <td><strong>${escapeHtml(doc.name)}</strong></td>
                <td><span class="badge" style="background: #e8f8f5; color: var(--green); border: 1px solid var(--green);">${escapeHtml(doc.specialty || doc.specialization || 'SPECIALIST')}</span></td>
                <td>${doc.whatsapp ? `<a href="https://wa.me/${escapeHtml(doc.whatsapp.replace(/[^0-9]/g, ''))}" target="_blank" style="color: #25D366; font-weight: 600;"><i class="fab fa-whatsapp"></i> ${escapeHtml(doc.whatsapp)}</a>` : '<span style="color:#999;">Not set</span>'}</td>
                <td>${doc.linkedin ? `<a href="${escapeHtml(doc.linkedin)}" target="_blank" style="color: #0A66C2; font-weight: 600;"><i class="fab fa-linkedin"></i> Profile</a>` : '<span style="color:#999;">Not set</span>'}</td>
                <td>
                    <a href="/dashboard/doctors/edit/${doc.id}/" class="action-btn btn-approve"><i class="fas fa-edit"></i> Edit Profile</a>
                    <button class="action-btn btn-delete" onclick="deleteDoctorItem(${doc.id})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `}).join('');
    } catch (err) {
        console.error('Failed to load doctors table:', err);
    }
}

async function deleteDoctorItem(id) {
    if (confirm('Are you sure you want to delete this doctor profile?')) {
        await window.ApiService.deleteDoctor(id);
        loadDoctorsGrid();
        loadDashboardStats();
    }
}

// Blogs Grid Management
async function loadBlogsGrid() {
    const container = document.getElementById('admin-blogs-container');
    if (!container) return;

    try {
        const blogs = await window.ApiService.getBlogs();
        container.innerHTML = blogs.map(blog => {
            const rawImg = blog.image || 'image/blog-1.jpg';
            const imgSrc = rawImg.startsWith('/') ? rawImg : '/' + rawImg;

            return `
            <div class="box">
                <div class="image">
                    <img src="${imgSrc}" alt="${escapeHtml(blog.title)}">
                </div>
                <div class="content">
                    <h3>${escapeHtml(blog.title)}</h3>
                    <p><strong>Author:</strong> ${escapeHtml(blog.author)} | <strong>Date:</strong> ${blog.date}</p>
                    <div style="margin-top: 1.5rem; display: flex; gap: .5rem;">
                        <a href="/dashboard/blogs/edit/${blog.id}/" class="action-btn btn-approve"><i class="fas fa-edit"></i> Edit Article</a>
                        <button class="action-btn btn-delete" onclick="deleteBlogItem(${blog.id})"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            </div>
        `}).join('');
    } catch (err) {
        console.error('Failed to load blogs:', err);
    }
}

async function deleteBlogItem(id) {
    if (confirm('Are you sure you want to delete this blog article?')) {
        await window.ApiService.deleteBlog(id);
        loadBlogsGrid();
        loadDashboardStats();
    }
}

// Reviews List Management
async function loadReviewsList() {
    const container = document.getElementById('admin-reviews-container');
    if (!container) return;

    try {
        const reviews = await window.ApiService.getReviews();
        container.innerHTML = reviews.map(rev => {
            const rawImg = rev.image || 'image/pic-1.jpg';
            const imgSrc = rawImg.startsWith('/') ? rawImg : '/' + rawImg;

            return `
            <div class="box">
                <img src="${imgSrc}" alt="${escapeHtml(rev.name)}">
                <h3>${escapeHtml(rev.name)}</h3>
                <p class="text">${escapeHtml(rev.text)}</p>
                <div style="margin-top: 1rem;">
                    <button class="action-btn btn-delete" onclick="deleteReviewItem(${rev.id})"><i class="fas fa-trash"></i> Delete Review</button>
                </div>
            </div>
        `}).join('');
    } catch (err) {
        console.error('Failed to load reviews:', err);
    }
}

async function deleteReviewItem(id) {
    if (confirm('Are you sure you want to remove this patient review?')) {
        await window.ApiService.deleteReview(id);
        loadReviewsList();
        loadDashboardStats();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

// Expose globally
window.handleLogout = handleLogout;
window.updateApptStatus = updateApptStatus;
window.deleteAppt = deleteAppt;
window.deleteDoctorItem = deleteDoctorItem;
window.deleteBlogItem = deleteBlogItem;
window.deleteReviewItem = deleteReviewItem;
