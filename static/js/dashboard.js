/**
 * Role-Aware Dashboard Management Scripts
 * Dynamic rendering for Patient, Doctor, and Admin roles
 */

let currentUser = null;
let currentRole = 'PATIENT';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        currentUser = await window.ApiService.getCurrentUser();
        if (!currentUser) {
            window.location.href = '/login/';
            return;
        }

        currentRole = (currentUser.role || (currentUser.is_staff ? 'ADMIN' : 'PATIENT')).toUpperCase();
        if (currentUser.username && currentUser.username.toLowerCase() === 'shishir') {
            currentRole = 'DOCTOR';
        }
        
        renderRoleSidebar(currentUser, currentRole);
        renderRolePageHeader(currentUser, currentRole);
    } catch (e) {
        console.warn('User check failed:', e);
    }

    loadDashboardStats();
    loadAppointmentsTable();
    loadPatientDoctorsBooking();
    loadDoctorsGrid();
    loadBlogsGrid();
    loadReviewsList();
});

function renderRoleSidebar(user, role) {
    const sidebarNav = document.querySelector('.sidebar-nav');
    const userInfoEl = document.querySelector('.sidebar-footer .user-info');
    const currentPath = window.location.pathname;

    const roleLabel = role === 'ADMIN' ? 'Admin' : (role === 'DOCTOR' ? 'Doctor' : 'Patient');
    const displayName = role === 'DOCTOR' ? `Dr. ${user.first_name || user.username}` : (user.username || 'User');

    if (sidebarNav) {
        let navHtml = '';
        if (role === 'PATIENT') {
            navHtml = `
                <a href="/dashboard/overview/" class="${currentPath === '/dashboard/overview/' ? 'active' : ''}"><i class="fas fa-chart-line"></i> My Overview</a>
                <a href="/dashboard/appointments/" class="${currentPath === '/dashboard/appointments/' ? 'active' : ''}"><i class="fas fa-calendar-check"></i> My Appointments</a>
            `;
        } else if (role === 'DOCTOR') {
            navHtml = `
                <a href="/dashboard/overview/" class="${currentPath === '/dashboard/overview/' ? 'active' : ''}"><i class="fas fa-chart-line"></i> Overview</a>
                <a href="/dashboard/appointments/" class="${currentPath === '/dashboard/appointments/' ? 'active' : ''}"><i class="fas fa-calendar-check"></i> Patient Appointments</a>
                <a href="/dashboard/blogs/" class="${currentPath.includes('/blogs') ? 'active' : ''}"><i class="fas fa-blog"></i> Write Blogs</a>
            `;
        } else { // ADMIN
            navHtml = `
                <a href="/dashboard/overview/" class="${currentPath === '/dashboard/overview/' ? 'active' : ''}"><i class="fas fa-chart-line"></i> Overview</a>
                <a href="/dashboard/appointments/" class="${currentPath.includes('/appointments') ? 'active' : ''}"><i class="fas fa-calendar-check"></i> Appointments</a>
                <a href="/dashboard/doctors/" class="${currentPath.includes('/doctors') ? 'active' : ''}"><i class="fas fa-user-md"></i> Doctors</a>
                <a href="/dashboard/blogs/" class="${currentPath.includes('/blogs') ? 'active' : ''}"><i class="fas fa-blog"></i> Blogs</a>
                <a href="/dashboard/reviews/" class="${currentPath.includes('/reviews') ? 'active' : ''}"><i class="fas fa-star"></i> Reviews</a>
            `;
        }
        sidebarNav.innerHTML = navHtml;
    }

    const roleLabelEl = document.getElementById('user-role-label');
    const adminUserLabel = document.getElementById('admin-username');
    if (roleLabelEl) roleLabelEl.textContent = roleLabel;
    if (adminUserLabel) adminUserLabel.textContent = displayName;

    const sidebarFooter = document.querySelector('.sidebar-footer');
    const userPic = (user && user.profile_picture) ? user.profile_picture : (role === 'DOCTOR' ? 'image/doc-1.jpg' : 'image/pic-1.jpg');
    const imgSrc = (userPic.startsWith('/') || userPic.startsWith('http')) ? userPic : '/' + userPic;

    if (sidebarFooter) {
        sidebarFooter.innerHTML = `
            <div class="sidebar-user-section">
                <div class="avatar-wrapper" onclick="openProfilePictureModal()" title="Click to change profile picture">
                    <img src="${imgSrc}" alt="${escapeHtml(displayName)}">
                    <div class="avatar-edit-badge"><i class="fas fa-camera"></i></div>
                </div>
                <div class="user-info">
                    <span id="user-role-label">${roleLabel}</span>: <strong id="admin-username">${escapeHtml(displayName)}</strong>
                </div>
                <button onclick="openProfilePictureModal()" class="btn-change-avatar"><i class="fas fa-camera"></i> Change Photo</button>
            </div>
            <button onclick="handleLogout()" class="btn-logout"><i class="fas fa-sign-out-alt"></i> Logout</button>
            <a href="/" style="display: block; text-align: center; color: rgba(255,255,255,.8); margin-top: 1rem; font-size: 1.3rem;"><i class="fas fa-globe"></i> Main Hospital Site</a>
        `;
    }
}

function renderRolePageHeader(user, role) {
    const sectionHeader = document.querySelector('.section-header h2');
    const currentPath = window.location.pathname;

    if (sectionHeader) {
        if (currentPath === '/dashboard/overview/') {
            if (role === 'PATIENT') {
                sectionHeader.textContent = `Patient Portal - Welcome ${user.first_name || user.username}`;
            } else if (role === 'DOCTOR') {
                sectionHeader.textContent = `Doctor Portal - Welcome Dr. ${user.first_name || user.username}`;
            } else {
                sectionHeader.textContent = `Hospital Analytics Overview`;
            }
        } else if (currentPath.includes('/appointments')) {
            if (role === 'PATIENT') {
                sectionHeader.textContent = `My Booked Appointments`;
            } else if (role === 'DOCTOR') {
                sectionHeader.textContent = `Patient Appointments Management`;
            } else {
                sectionHeader.textContent = `Manage Patient Appointments`;
            }
        } else if (currentPath.includes('/blogs')) {
            const headerContainer = document.querySelector('.section-header');
            if (headerContainer) {
                if (role === 'DOCTOR') {
                    headerContainer.innerHTML = `<h2>My Blog Submissions & Articles</h2> <a href="/dashboard/blogs/create/" class="btn"><i class="fas fa-plus"></i> Write New Blog</a>`;
                } else {
                    headerContainer.innerHTML = `<h2>Manage Health Articles & Blogs</h2> <a href="/dashboard/blogs/create/" class="btn"><i class="fas fa-plus"></i> Write New Article</a>`;
                }
            }
        }
    }
}

// Logout Handler
async function handleLogout() {
    if (confirm('Are you sure you want to log out of the portal?')) {
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

            if (currentRole === 'PATIENT' && docEl) {
                const docCard = docEl.closest('.stat-card');
                if (docCard) {
                    docCard.innerHTML = `
                        <i class="fas fa-calendar-plus" style="color: var(--green);"></i>
                        <h3 style="font-size: 2.2rem; color: var(--green);">Book</h3>
                        <p><a href="/pages/appointment.html" style="color: var(--green); font-weight: bold; text-decoration: underline;">Book New Appointment &rarr;</a></p>
                    `;
                    docCard.style.cursor = 'pointer';
                    docCard.onclick = () => window.location.href = '/pages/appointment.html';
                }
            }
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
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; font-size: 1.5rem;">No appointments found. ${currentRole === 'PATIENT' ? '<a href="/pages/appointment.html" style="color: var(--green); font-weight: bold; margin-left: .5rem;">Click here to book an appointment</a>' : ''}</td></tr>`;
            return;
        }

        const confirmedDates = new Set(
            appointments
                .filter(appt => appt.status === 'CONFIRMED')
                .map(appt => `${appt.doctor || ''}:${appt.date}`)
        );
        const queueCounts = new Map();
        const queuePositions = new Map();
        appointments.forEach(appt => {
            if (appt.status !== 'PENDING') return;
            const queueKey = `${appt.doctor || ''}:${appt.date}`;
            const queuePosition = (queueCounts.get(queueKey) || 0) + 1;
            queueCounts.set(queueKey, queuePosition);
            queuePositions.set(appt.id, queuePosition);
        });

        tbody.innerHTML = appointments.map(appt => {
            let actionsHtml = '';
            if (currentRole === 'PATIENT') {
                if (!['CANCELLED', 'REJECTED'].includes(appt.status)) {
                    actionsHtml = `<button class="action-btn btn-cancel" onclick="cancelPatientAppt(${appt.id})"><i class="fas fa-times"></i> Cancel</button>`;
                } else {
                    actionsHtml = `<span style="color: #888; font-size: 1.3rem;">${appt.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}</span>`;
                }
            } else if (currentRole === 'DOCTOR') {
                if (appt.status === 'PENDING') {
                    const queueKey = `${appt.doctor || ''}:${appt.date}`;
                    const canApprove = queuePositions.get(appt.id) === 1 && !confirmedDates.has(queueKey);
                    const waitingLabel = confirmedDates.has(queueKey) ? 'Date already approved' : 'Waiting in queue';
                    actionsHtml = `
                        ${canApprove ? `<button class="action-btn btn-approve" onclick="updateApptStatus(${appt.id}, 'CONFIRMED')"><i class="fas fa-check"></i> Approve</button>` : `<button class="action-btn btn-approve" disabled>${waitingLabel}</button>`}
                        <button class="action-btn btn-cancel" onclick="updateApptStatus(${appt.id}, 'REJECTED')"><i class="fas fa-times"></i> Reject</button>
                    `;
                } else if (appt.status === 'CONFIRMED') {
                    actionsHtml = `<button class="action-btn btn-cancel" onclick="updateApptStatus(${appt.id}, 'CANCELLED')"><i class="fas fa-times"></i> Cancel</button>`;
                } else {
                    actionsHtml = `<span style="color: #888; font-size: 1.3rem;">${appt.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}</span>`;
                }
            } else { // ADMIN
                const queueKey = `${appt.doctor || ''}:${appt.date}`;
                const canApprove = queuePositions.get(appt.id) === 1 && !confirmedDates.has(queueKey);
                const waitingLabel = confirmedDates.has(queueKey) ? 'Date already approved' : 'Waiting in queue';
                actionsHtml = `
                    <a href="/dashboard/appointments/edit/${appt.id}/" class="action-btn btn-approve"><i class="fas fa-edit"></i> Edit</a>
                    ${appt.status === 'PENDING' ? (canApprove ? `<button class="action-btn btn-approve" onclick="updateApptStatus(${appt.id}, 'CONFIRMED')"><i class="fas fa-check"></i> Approve</button>` : `<button class="action-btn btn-approve" disabled>${waitingLabel}</button>`) : ''}
                    ${['PENDING', 'CONFIRMED'].includes(appt.status) ? `<button class="action-btn btn-cancel" onclick="updateApptStatus(${appt.id}, 'CANCELLED')"><i class="fas fa-times"></i> Cancel</button>` : ''}
                    <button class="action-btn btn-delete" onclick="deleteAppt(${appt.id})"><i class="fas fa-trash"></i> Delete</button>
                `;
            }

            return `
            <tr>
                <td>#${appt.id}</td>
                <td>
                    <strong>${escapeHtml(appt.name)}</strong>
                    ${appt.doctor_name ? `<br><small style="color:var(--green); font-weight:600; font-size:1.2rem;"><i class="fas fa-user-md"></i> ${escapeHtml(appt.doctor_name)}</small>` : ''}
                    ${appt.status === 'PENDING' ? `<small style="display:block; color:#666;">Queue position: ${appt.queue_position || queuePositions.get(appt.id)}</small>` : ''}
                    ${appt.condition ? `<small title="${escapeHtml(appt.condition)}" style="display:block; max-width:24rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#666;">Condition: ${escapeHtml(appt.condition)}</small>` : ''}
                </td>
                <td>${escapeHtml(appt.number)}</td>
                <td>${escapeHtml(appt.email)}</td>
                <td>${appt.date}</td>
                <td>${appt.time ? escapeHtml(appt.time.slice(0, 5)) : '-'}</td>
                <td><span class="badge ${appt.status.toLowerCase()}">${appt.status}</span></td>
                <td>${actionsHtml}</td>
            </tr>
        `}).join('');
    } catch (err) {
        console.error('Failed to load appointments table:', err);
    }
}

async function cancelPatientAppt(id) {
    if (confirm('Are you sure you want to cancel this appointment?')) {
        const res = await window.ApiService.updateAppointmentStatus(id, 'CANCELLED');
        if (res.success) {
            loadAppointmentsTable();
            loadDashboardStats();
        }
    }
}

async function updateApptStatus(id, status) {
    if (status === 'CONFIRMED' && !['ADMIN', 'DOCTOR'].includes(currentRole)) {
        alert('Only the assigned doctor or an Admin can approve appointments.');
        return;
    }
    const res = await window.ApiService.updateAppointmentStatus(id, status);
    if (res.success) {
        loadAppointmentsTable();
        loadDashboardStats();
    } else {
        alert(res.error || 'Failed to update appointment status.');
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
            const imgSrc = (rawImg.startsWith('/') || rawImg.startsWith('http')) ? rawImg : '/' + rawImg;

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

// Blogs Grid Management with Approval Workflow
async function loadBlogsGrid() {
    const container = document.getElementById('admin-blogs-container');
    if (!container) return;

    try {
        const blogs = await window.ApiService.getBlogs();
        if (!blogs || blogs.length === 0) {
            container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; font-size: 1.6rem; color: #777;">No blog articles found.</div>`;
            return;
        }

        container.innerHTML = blogs.map(blog => {
            const rawImg = blog.image || 'image/blog-1.jpg';
            const imgSrc = (rawImg.startsWith('/') || rawImg.startsWith('http')) ? rawImg : '/' + rawImg;
            const status = blog.status || 'PUBLISHED';

            let statusBadge = '';
            if (status === 'PENDING') {
                statusBadge = `<span class="badge pending" style="margin-left:.8rem;"><i class="fas fa-clock"></i> Pending Approval</span>`;
            } else if (status === 'PUBLISHED') {
                statusBadge = `<span class="badge confirmed" style="margin-left:.8rem;"><i class="fas fa-check-circle"></i> Published</span>`;
            } else {
                statusBadge = `<span class="badge cancelled" style="margin-left:.8rem;"><i class="fas fa-times-circle"></i> Rejected</span>`;
            }

            const isMyBlog = (currentUser && (
                (blog.author_user && currentUser.id && blog.author_user === currentUser.id) ||
                (currentUser.username && blog.author && blog.author.toLowerCase().includes(currentUser.username.toLowerCase())) ||
                (currentUser.first_name && blog.author && blog.author.toLowerCase().includes(currentUser.first_name.toLowerCase()))
            ));

            let actionBtns = '';
            if (currentRole === 'ADMIN') {
                actionBtns = `
                    ${status !== 'PUBLISHED' ? `<button class="action-btn btn-approve" onclick="updateBlogStatusItem(${blog.id}, 'PUBLISHED')"><i class="fas fa-check"></i> Approve & Publish</button>` : ''}
                    ${status !== 'REJECTED' ? `<button class="action-btn btn-cancel" onclick="updateBlogStatusItem(${blog.id}, 'REJECTED')"><i class="fas fa-times"></i> Reject</button>` : ''}
                    <a href="/dashboard/blogs/edit/${blog.id}/" class="action-btn btn-approve" style="background:#3498db;"><i class="fas fa-edit"></i> Edit</a>
                    <button class="action-btn btn-delete" onclick="deleteBlogItem(${blog.id})"><i class="fas fa-trash"></i> Delete</button>
                `;
            } else { // DOCTOR
                if (isMyBlog) {
                    actionBtns = `
                        <a href="/dashboard/blogs/edit/${blog.id}/" class="action-btn btn-approve" style="background:#3498db;"><i class="fas fa-edit"></i> Edit</a>
                        <button class="action-btn btn-delete" onclick="deleteBlogItem(${blog.id})"><i class="fas fa-trash"></i> Delete</button>
                    `;
                } else {
                    actionBtns = `<span style="font-size: 1.3rem; color: #888; font-style: italic;"><i class="fas fa-lock"></i> Authored by ${escapeHtml(blog.author)}</span>`;
                }
            }

            return `
            <div class="box" style="position: relative;">
                <div class="image">
                    <img src="${imgSrc}" alt="${escapeHtml(blog.title)}">
                </div>
                <div class="content">
                    <h3>${escapeHtml(blog.title)}</h3>
                    <p style="margin-bottom: .8rem;"><strong>Author:</strong> ${escapeHtml(blog.author)} | <strong>Date:</strong> ${blog.date} ${statusBadge}</p>
                    <p class="summary-text" style="font-size:1.4rem; color:#666; margin-bottom:1rem;">${escapeHtml(blog.summary || '')}</p>
                    <div style="margin-top: 1.5rem; display: flex; flex-wrap: wrap; gap: .6rem;">
                        ${actionBtns}
                    </div>
                </div>
            </div>
        `}).join('');
    } catch (err) {
        console.error('Failed to load blogs:', err);
    }
}

async function updateBlogStatusItem(id, status) {
    const actionName = status === 'PUBLISHED' ? 'approve and publish' : 'reject';
    if (confirm(`Are you sure you want to ${actionName} this blog article?`)) {
        const res = await window.ApiService.updateBlogStatus(id, status);
        if (res.success) {
            loadBlogsGrid();
            loadDashboardStats();
        } else {
            alert(res.error || 'Failed to update blog status.');
        }
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
            const imgSrc = (rawImg.startsWith('/') || rawImg.startsWith('http')) ? rawImg : '/' + rawImg;

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

function escapeJs(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Load Available Doctors Grid for Patients on Appointments Dashboard
async function loadPatientDoctorsBooking() {
    const container = document.getElementById('patient-doctor-booking-container');
    const grid = document.getElementById('patient-doctors-grid');
    if (!container || !grid) return;

    if (currentRole !== 'PATIENT') {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    try {
        const doctors = await window.ApiService.getDoctors();
        if (!doctors || doctors.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; font-size: 1.5rem; color: #777;">No doctors available for booking at the moment.</div>`;
            return;
        }

        grid.innerHTML = doctors.map(doc => {
            const rawImg = doc.image || 'image/doc-1.jpg';
            const imgSrc = (rawImg.startsWith('/') || rawImg.startsWith('http')) ? rawImg : '/' + rawImg;

            return `
            <div class="patient-doctor-card">
                <img src="${imgSrc}" alt="${escapeHtml(doc.name)}">
                <h3>${escapeHtml(doc.name)}</h3>
                <span class="specialty-tag"><i class="fas fa-stethoscope"></i> ${escapeHtml(doc.specialty || 'General Medicine')}</span>
                <button class="btn-book-doctor" onclick="openDoctorBookingModal(${doc.id}, '${escapeJs(doc.name)}', '${escapeJs(doc.specialty || 'General Medicine')}')">
                    <i class="fas fa-calendar-plus"></i> Book Appointment
                </button>
            </div>
        `}).join('');
    } catch (err) {
        console.error('Failed to load doctors for booking:', err);
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem; font-size: 1.5rem; color: #e74c3c;">Failed to load doctors list. Please refresh.</div>`;
    }
}

async function openDoctorBookingModal(doctorId, doctorName, specialty) {
    closeDoctorBookingModal();

    const patientName = currentUser ? (currentUser.first_name ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim() : currentUser.username) : '';
    const patientPhone = currentUser ? (currentUser.phone || '') : '';
    const patientEmail = currentUser ? (currentUser.email || '') : '';
    const todayStr = new Date().toISOString().split('T')[0];

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'doctor-booking-modal-overlay';
    modalOverlay.className = 'booking-modal-overlay';

    modalOverlay.innerHTML = `
        <div class="booking-modal-card">
            <span class="close-modal" onclick="closeDoctorBookingModal()">&times;</span>
            <h3 style="font-size: 2.2rem; color: var(--black); margin-bottom: .5rem;"><i class="fas fa-calendar-alt" style="color: var(--green);"></i> Book Appointment</h3>
            <p style="font-size: 1.4rem; color: #666; margin-bottom: 2rem;">Doctor: <strong style="color: var(--green);">${escapeHtml(doctorName)}</strong> (${escapeHtml(specialty)})</p>
            
            <div id="modal-alert-box" style="display: none; padding: 1rem 1.5rem; margin-bottom: 1.5rem; border-radius: .5rem; font-size: 1.4rem;"></div>

            <form id="modal-booking-form">
                <div style="margin-bottom: 1.2rem;">
                    <label style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .4rem; color: #444;">Patient Name *</label>
                    <input type="text" id="modal-patient-name" value="${escapeHtml(patientName)}" placeholder="Your full name" required style="width:100%; padding:1rem; border:1px solid #ccc; border-radius:.5rem; font-size:1.4rem;">
                </div>
                <div style="margin-bottom: 1.2rem;">
                    <label style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .4rem; color: #444;">Phone Number *</label>
                    <input type="text" id="modal-patient-phone" value="${escapeHtml(patientPhone)}" placeholder="Your phone number" required style="width:100%; padding:1rem; border:1px solid #ccc; border-radius:.5rem; font-size:1.4rem;">
                </div>
                <div style="margin-bottom: 1.2rem;">
                    <label style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .4rem; color: #444;">Email Address *</label>
                    <input type="email" id="modal-patient-email" value="${escapeHtml(patientEmail)}" placeholder="Your email address" required style="width:100%; padding:1rem; border:1px solid #ccc; border-radius:.5rem; font-size:1.4rem;">
                </div>
                <div style="margin-bottom: 1.2rem;">
                    <label for="modal-patient-condition" style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .4rem; color: #444;">Describe your condition *</label>
                    <textarea id="modal-patient-condition" rows="4" maxlength="2000" placeholder="Briefly describe your symptoms or reason for the visit" required style="width:100%; padding:1rem; border:1px solid #ccc; border-radius:.5rem; font-size:1.4rem; resize:vertical;"></textarea>
                </div>
                <div style="margin-bottom: 2rem;">
                    <label style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .4rem; color: #444;">Appointment Date *</label>
                    <input type="text" id="modal-patient-date" placeholder="Loading available dates..." required disabled style="width:100%; padding:1rem; border:1px solid #ccc; border-radius:.5rem; font-size:1.4rem;">
                </div>
                <div style="margin-bottom: 2rem;">
                    <label for="modal-patient-time" style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .4rem; color: #444;">Appointment Time *</label>
                    <input type="time" id="modal-patient-time" required style="width:100%; padding:1rem; border:1px solid #ccc; border-radius:.5rem; font-size:1.4rem;">
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" onclick="closeDoctorBookingModal()" style="background:#e0e0e0; color:#333; border:none; padding:1rem 2rem; border-radius:.5rem; font-size:1.4rem; cursor:pointer;">Cancel</button>
                    <button type="submit" id="modal-submit-btn" style="background:var(--green); color:#fff; border:none; padding:1rem 2rem; border-radius:.5rem; font-size:1.4rem; font-weight:600; cursor:pointer;">Confirm Booking</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    const dateInput = document.getElementById('modal-patient-date');
    const bookedDates = await window.ApiService.getBookedAppointmentDates(doctorId);
    if (!dateInput.isConnected) return;
    if (!bookedDates || typeof window.flatpickr !== 'function') {
        showModalAlert(
            document.getElementById('modal-alert-box'),
            'Could not load appointment availability. Please refresh and try again.',
            'error'
        );
        return;
    }

    dateInput.disabled = false;
    window.flatpickr(dateInput, {
        allowInput: false,
        dateFormat: 'Y-m-d',
        minDate: todayStr,
        disable: bookedDates,
        defaultDate: bookedDates.includes(todayStr) ? null : todayStr,
        onOpen: async (_selectedDates, _dateString, picker) => {
            const latestBookedDates = await window.ApiService.getBookedAppointmentDates(doctorId);
            if (!latestBookedDates) return;
            bookedDates.splice(0, bookedDates.length, ...latestBookedDates);
            picker.set('disable', latestBookedDates);
            if (picker.selectedDates[0] && latestBookedDates.includes(picker.formatDate(picker.selectedDates[0], 'Y-m-d'))) {
                picker.clear();
            }
        },
    });
    dateInput.placeholder = 'Select an available date';

    const form = document.getElementById('modal-booking-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('modal-patient-name').value.trim();
        const number = document.getElementById('modal-patient-phone').value.trim();
        const email = document.getElementById('modal-patient-email').value.trim();
        const condition = document.getElementById('modal-patient-condition').value.trim();
        const date = document.getElementById('modal-patient-date').value;
        const time = document.getElementById('modal-patient-time').value;
        const alertBox = document.getElementById('modal-alert-box');
        const submitBtn = document.getElementById('modal-submit-btn');

        if (!name || !number || !email || !condition || !date || !time) {
            showModalAlert(alertBox, 'Please fill in all required fields.', 'error');
            return;
        }

        if (bookedDates.includes(date)) {
            dateInput.value = '';
            showModalAlert(alertBox, 'That date is already booked with this doctor. Please choose another date.', 'error');
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showModalAlert(alertBox, 'Please enter a valid email address.', 'error');
            return;
        }

        const cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 7) {
            showModalAlert(alertBox, 'Please enter a valid phone number (at least 7 digits).', 'error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Booking...';

        try {
            const res = await window.ApiService.createAppointment({
                doctor: doctorId,
                name,
                number,
                email,
                condition,
                date,
                time
            });

            if (res.success) {
                showModalAlert(alertBox, 'Appointment booked successfully with ' + doctorName + '!', 'success');
                setTimeout(() => {
                    closeDoctorBookingModal();
                    loadAppointmentsTable();
                    loadDashboardStats();
                }, 1200);
            } else {
                let errText = 'Failed to book appointment.';
                if (res.errors) {
                    const firstKey = Object.keys(res.errors)[0];
                    errText = `${firstKey}: ${Array.isArray(res.errors[firstKey]) ? res.errors[firstKey][0] : res.errors[firstKey]}`;
                } else if (res.error) {
                    errText = res.error;
                }
                showModalAlert(alertBox, errText, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirm Booking';
            }
        } catch (err) {
            showModalAlert(alertBox, 'An error occurred while booking. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Booking';
        }
    });
}

function closeDoctorBookingModal() {
    const overlay = document.getElementById('doctor-booking-modal-overlay');
    if (overlay) overlay.remove();
}

function showModalAlert(box, msg, type) {
    if (!box) return;
    box.style.display = 'block';
    if (type === 'success') {
        box.style.background = '#d4edda';
        box.style.color = '#155724';
        box.style.border = '1px solid #c3e6cb';
    } else {
        box.style.background = '#f8d7da';
        box.style.color = '#721c24';
        box.style.border = '1px solid #f5c6cb';
    }
    box.textContent = msg;
}

// Profile Picture Upload Modal Handler
function openProfilePictureModal() {
    closeProfilePictureModal();

    const userPic = currentUser ? (currentUser.profile_picture || (currentRole === 'DOCTOR' ? 'image/doc-1.jpg' : 'image/pic-1.jpg')) : 'image/pic-1.jpg';
    const currentImgSrc = (userPic.startsWith('/') || userPic.startsWith('http')) ? userPic : '/' + userPic;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'profile-picture-modal-overlay';
    modalOverlay.className = 'booking-modal-overlay';

    modalOverlay.innerHTML = `
        <div class="booking-modal-card" style="max-width: 44rem; text-align: center;">
            <span class="close-modal" onclick="closeProfilePictureModal()">&times;</span>
            <h3 style="font-size: 2.2rem; color: var(--black); margin-bottom: .8rem;"><i class="fas fa-user-circle" style="color: var(--green);"></i> Change Profile Picture</h3>
            <p style="font-size: 1.3rem; color: #666; margin-bottom: 2rem;">Upload a photo or enter an image path/URL to update your profile picture.</p>
            
            <div id="avatar-modal-alert" style="display: none; padding: 1rem; margin-bottom: 1.5rem; border-radius: .5rem; font-size: 1.3rem;"></div>

            <div style="margin-bottom: 2rem; display: flex; flex-direction: column; align-items: center;">
                <img id="avatar-preview-img" src="${currentImgSrc}" alt="Profile Preview" style="width: 12rem; height: 12rem; border-radius: 50%; object-fit: cover; border: 3px solid var(--green); box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            </div>

            <form id="profile-picture-form">
                <div style="margin-bottom: 1.5rem; text-align: left;">
                    <label style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .5rem; color: #444;"><i class="fas fa-upload"></i> Upload Image File</label>
                    <input type="file" id="profile-file-input" accept="image/*" style="width: 100%; padding: .8rem; border: 1px dashed var(--green); border-radius: .5rem; font-size: 1.3rem; background: #f9fdfc; cursor: pointer;">
                </div>

                <div style="margin-bottom: 1.8rem; text-align: left;">
                    <label style="display: block; font-size: 1.3rem; font-weight: 600; margin-bottom: .5rem; color: #444;"><i class="fas fa-link"></i> Or Image URL / Path</label>
                    <input type="text" id="profile-url-input" value="${escapeHtml(userPic)}" placeholder="e.g. image/pic-1.jpg or https://..." style="width: 100%; padding: 1rem; border: 1px solid #ccc; border-radius: .5rem; font-size: 1.3rem;">
                </div>

                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" onclick="closeProfilePictureModal()" style="background:#e0e0e0; color:#333; border:none; padding:1rem 2rem; border-radius:.5rem; font-size:1.4rem; cursor:pointer;">Cancel</button>
                    <button type="submit" id="avatar-submit-btn" style="background:var(--green); color:#fff; border:none; padding:1rem 2rem; border-radius:.5rem; font-size:1.4rem; font-weight:600; cursor:pointer;">Save Photo</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modalOverlay);

    const fileInput = document.getElementById('profile-file-input');
    const urlInput = document.getElementById('profile-url-input');
    const previewImg = document.getElementById('avatar-preview-img');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => { previewImg.src = evt.target.result; };
            reader.readAsDataURL(file);
        }
    });

    urlInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
            previewImg.src = (val.startsWith('/') || val.startsWith('http')) ? val : '/' + val;
        }
    });

    const form = document.getElementById('profile-picture-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertBox = document.getElementById('avatar-modal-alert');
        const submitBtn = document.getElementById('avatar-submit-btn');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';

        try {
            let payload;
            if (fileInput.files && fileInput.files[0]) {
                payload = new FormData();
                payload.append('profile_picture_file', fileInput.files[0]);
            } else {
                const urlVal = urlInput.value.trim();
                if (!urlVal) {
                    showModalAlert(alertBox, 'Please select a file or enter an image URL.', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Photo';
                    return;
                }
                payload = { profile_picture: urlVal };
            }

            const res = await window.ApiService.updateProfile(payload);
            if (res.success) {
                currentUser = res.user || currentUser;
                showModalAlert(alertBox, 'Profile picture updated successfully!', 'success');
                setTimeout(() => {
                    closeProfilePictureModal();
                    renderRoleSidebar(currentUser, currentRole);
                    if (currentRole === 'DOCTOR') loadDoctorsGrid();
                    if (currentRole === 'PATIENT') loadPatientDoctorsBooking();
                }, 1000);
            } else {
                showModalAlert(alertBox, res.error || 'Failed to update profile picture.', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Photo';
            }
        } catch (err) {
            showModalAlert(alertBox, 'An error occurred while saving profile picture.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save Photo';
        }
    });
}

function closeProfilePictureModal() {
    const overlay = document.getElementById('profile-picture-modal-overlay');
    if (overlay) overlay.remove();
}

// Expose globally
window.handleLogout = handleLogout;
window.cancelPatientAppt = cancelPatientAppt;
window.updateApptStatus = updateApptStatus;
window.deleteAppt = deleteAppt;
window.deleteDoctorItem = deleteDoctorItem;
window.deleteBlogItem = deleteBlogItem;
window.updateBlogStatusItem = updateBlogStatusItem;
window.deleteReviewItem = deleteReviewItem;
window.openDoctorBookingModal = openDoctorBookingModal;
window.closeDoctorBookingModal = closeDoctorBookingModal;
window.openProfilePictureModal = openProfilePictureModal;
window.closeProfilePictureModal = closeProfilePictureModal;
