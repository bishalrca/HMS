/**
 * Admin Forms Handler - Handles dedicated Create and Edit pages with Image Uploads and CSRF Protection
 */

function getCsrfToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === ('csrftoken=')) {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue || '';
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Doctor Create Form
    const doctorCreateForm = document.getElementById('doctor-create-form');
    if (doctorCreateForm) {
        doctorCreateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(doctorCreateForm);
            
            const submitBtn = doctorCreateForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving Doctor...';

            try {
                const response = await fetch('/api/doctors/', {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCsrfToken() },
                    body: formData
                });
                
                if (response.ok) {
                    window.location.href = '/dashboard/doctors/';
                } else {
                    const err = await response.json();
                    alert(err.detail || err.error || 'Failed to create doctor.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Save Doctor Profile';
                }
            } catch (err) {
                alert('Connection error while creating doctor.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save Doctor Profile';
            }
        });
    }

    // 2. Doctor Edit Form
    const doctorEditForm = document.getElementById('doctor-edit-form');
    if (doctorEditForm) {
        const docId = doctorEditForm.getAttribute('data-doctor-id');
        if (docId) loadDoctorEditData(docId);

        doctorEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(doctorEditForm);

            const submitBtn = doctorEditForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating Doctor...';

            try {
                const response = await fetch(`/api/doctors/${docId}/`, {
                    method: 'PATCH',
                    headers: { 'X-CSRFToken': getCsrfToken() },
                    body: formData
                });
                
                if (response.ok) {
                    window.location.href = '/dashboard/doctors/';
                } else {
                    const err = await response.json();
                    alert(err.detail || err.error || 'Failed to update doctor.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Doctor Profile';
                }
            } catch (err) {
                alert('Connection error while updating doctor.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Doctor Profile';
            }
        });
    }

    // 3. Blog Create Form
    const blogCreateForm = document.getElementById('blog-create-form');
    if (blogCreateForm) {
        blogCreateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(blogCreateForm);

            const submitBtn = blogCreateForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Publishing Article...';

            try {
                const response = await fetch('/api/blogs/', {
                    method: 'POST',
                    headers: { 'X-CSRFToken': getCsrfToken() },
                    body: formData
                });

                if (response.ok) {
                    window.location.href = '/dashboard/blogs/';
                } else {
                    const err = await response.json();
                    alert(err.detail || err.error || 'Failed to publish blog.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Publish Article';
                }
            } catch (err) {
                alert('Connection error while creating blog.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Publish Article';
            }
        });
    }

    // 4. Blog Edit Form
    const blogEditForm = document.getElementById('blog-edit-form');
    if (blogEditForm) {
        const blogId = blogEditForm.getAttribute('data-blog-id');
        if (blogId) loadBlogEditData(blogId);

        blogEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(blogEditForm);

            const submitBtn = blogEditForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating Article...';

            try {
                const response = await fetch(`/api/blogs/${blogId}/`, {
                    method: 'PATCH',
                    headers: { 'X-CSRFToken': getCsrfToken() },
                    body: formData
                });

                if (response.ok) {
                    window.location.href = '/dashboard/blogs/';
                } else {
                    const err = await response.json();
                    alert(err.detail || err.error || 'Failed to update blog.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Update Article';
                }
            } catch (err) {
                alert('Connection error while updating blog.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Article';
            }
        });
    }

    // 5. Appointment Edit Form
    const appointmentEditForm = document.getElementById('appointment-edit-form');
    if (appointmentEditForm) {
        const apptId = appointmentEditForm.getAttribute('data-appointment-id');
        if (apptId) loadAppointmentEditData(apptId);

        appointmentEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('appt-name').value,
                number: document.getElementById('appt-number').value,
                email: document.getElementById('appt-email').value,
                date: document.getElementById('appt-date').value,
                status: document.getElementById('appt-status').value
            };

            const submitBtn = appointmentEditForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;

            const res = await window.ApiService.updateAppointmentStatus(apptId, payload.status);
            window.location.href = '/dashboard/appointments/';
        });
    }
});

// Load Pre-filled Data Helpers
async function loadDoctorEditData(id) {
    try {
        const res = await fetch(`/api/doctors/${id}/`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('doc-name').value = data.name || '';
            document.getElementById('doc-specialty').value = data.specialty || '';
            document.getElementById('doc-image').value = data.image || '';
            document.getElementById('doc-whatsapp').value = data.whatsapp || '';
            document.getElementById('doc-linkedin').value = data.linkedin || '';
        }
    } catch (e) {
        console.error('Failed to pre-fill doctor edit form:', e);
    }
}

async function loadBlogEditData(id) {
    try {
        const res = await fetch(`/api/blogs/${id}/`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('blog-title').value = data.title || '';
            document.getElementById('blog-author').value = data.author || '';
            document.getElementById('blog-date').value = data.date || '';
            document.getElementById('blog-image').value = data.image || '';
            document.getElementById('blog-summary').value = data.summary || '';
        }
    } catch (e) {
        console.error('Failed to pre-fill blog edit form:', e);
    }
}

async function loadAppointmentEditData(id) {
    try {
        const res = await fetch(`/api/appointments/${id}/`);
        if (res.ok) {
            const data = await res.json();
            document.getElementById('appt-name').value = data.name || '';
            document.getElementById('appt-number').value = data.number || '';
            document.getElementById('appt-email').value = data.email || '';
            document.getElementById('appt-date').value = data.date || '';
            document.getElementById('appt-status').value = data.status || 'PENDING';
        }
    } catch (e) {
        console.error('Failed to pre-fill appointment edit form:', e);
    }
}
