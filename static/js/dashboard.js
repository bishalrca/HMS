/**
 * Admin Dashboard Management Scripts
 * Protected with Session Authentication & DRF Authorization Guard
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Authentication Guard Check
    const user = await window.ApiService.getCurrentUser();
    if (!user) {
        window.location.href = '/login/';
        return;
    }

    // Display Admin Info
    const adminUserLabel = document.getElementById('admin-username');
    if (adminUserLabel) {
        adminUserLabel.textContent = user.username || 'Admin';
    }

    initTabs();
    loadDashboardStats();
    loadAppointmentsTable();
    loadDoctorsGrid();
    loadBlogsGrid();
    loadReviewsList();
    initModals();
});

// Logout Handler
async function handleLogout() {
    if (confirm('Are you sure you want to log out of the admin portal?')) {
        await window.ApiService.logout();
    }
}

// Tab Switcher
function initTabs() {
    const navButtons = document.querySelectorAll('.dashboard-nav button');
    const tabContents = document.querySelectorAll('.tab-content');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            navButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const activeContent = document.getElementById(`tab-${targetTab}`);
            if (activeContent) activeContent.classList.add('active');
        });
    });
}

// Load Stats Summary
async function loadDashboardStats() {
    try {
        const stats = await window.ApiService.getStats();
        if (stats) {
            document.getElementById('stat-doctors').textContent = stats.total_doctors || 0;
            document.getElementById('stat-appointments').textContent = stats.total_appointments || 0;
            document.getElementById('stat-pending').textContent = stats.pending_appointments || 0;
            document.getElementById('stat-confirmed').textContent = stats.confirmed_appointments || 0;
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
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No appointments found.</td></tr>';
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

// Doctors Grid Management
async function loadDoctorsGrid() {
    const container = document.getElementById('admin-doctors-container');
    if (!container) return;

    try {
        const doctors = await window.ApiService.getDoctors();
        container.innerHTML = doctors.map(doc => `
            <div class="box">
                <img src="${doc.image || '/image/doc-1.jpg'}" alt="${escapeHtml(doc.name)}">
                <h3>${escapeHtml(doc.name)}</h3>
                <span>${escapeHtml(doc.specialty || doc.specialization || 'SPECIALIST')}</span>
                <div style="margin-top: 1.5rem;">
                    <button class="action-btn btn-delete" onclick="deleteDoctorItem(${doc.id})"><i class="fas fa-trash"></i> Delete Doctor</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to load doctors:', err);
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
        container.innerHTML = blogs.map(blog => `
            <div class="box">
                <div class="image">
                    <img src="${blog.image || '/image/blog-1.jpg'}" alt="${escapeHtml(blog.title)}">
                </div>
                <div class="content">
                    <h3>${escapeHtml(blog.title)}</h3>
                    <p><strong>Author:</strong> ${escapeHtml(blog.author)} | <strong>Date:</strong> ${blog.date}</p>
                    <div style="margin-top: 1rem;">
                        <button class="action-btn btn-delete" onclick="deleteBlogItem(${blog.id})"><i class="fas fa-trash"></i> Delete Article</button>
                    </div>
                </div>
            </div>
        `).join('');
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
        container.innerHTML = reviews.map(rev => `
            <div class="box">
                <img src="${rev.image || '/image/pic-1.jpg'}" alt="${escapeHtml(rev.name)}">
                <h3>${escapeHtml(rev.name)}</h3>
                <p class="text">${escapeHtml(rev.text)}</p>
                <div style="margin-top: 1rem;">
                    <button class="action-btn btn-delete" onclick="deleteReviewItem(${rev.id})"><i class="fas fa-trash"></i> Delete Review</button>
                </div>
            </div>
        `).join('');
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

// Modals Handling
function initModals() {
    const addDoctorForm = document.getElementById('add-doctor-form');
    if (addDoctorForm) {
        addDoctorForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('doc-name').value;
            const specialty = document.getElementById('doc-specialty').value;
            const image = document.getElementById('doc-image').value || '/image/doc-1.jpg';

            const res = await window.ApiService.addDoctor({ name, specialty, image });
            if (res.success) {
                closeModal('doctor-modal');
                addDoctorForm.reset();
                loadDoctorsGrid();
                loadDashboardStats();
            }
        });
    }

    const addBlogForm = document.getElementById('add-blog-form');
    if (addBlogForm) {
        addBlogForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('blog-title').value;
            const author = document.getElementById('blog-author').value;
            const date = document.getElementById('blog-date').value || new Date().toLocaleDateString('en-US');
            const summary = document.getElementById('blog-summary').value;
            const image = document.getElementById('blog-image').value || '/image/blog-1.jpg';

            const res = await window.ApiService.addBlog({ title, author, date, summary, image });
            if (res.success) {
                closeModal('blog-modal');
                addBlogForm.reset();
                loadBlogsGrid();
                loadDashboardStats();
            }
        });
    }
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
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
window.openModal = openModal;
window.closeModal = closeModal;
