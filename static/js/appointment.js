/**
 * Appointment Component - Asynchronous form handling, validation, and feedback notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#appointment-form') || document.querySelector('.appointment form');
    if (!form) return;

    const nameInput = form.querySelector('input[name="name"]');
    const numberInput = form.querySelector('input[name="number"]');
    const emailInput = form.querySelector('input[name="email"]');
    const dateValInput = form.querySelector('input[name="date"]');
    const submitBtn = form.querySelector('input[type="submit"]');

    // Restrict date input to minimum today's date
    if (dateValInput) {
        const todayStr = new Date().toISOString().split('T')[0];
        dateValInput.setAttribute('min', todayStr);
    }

    const messageBox = form.querySelector('.message') || createMessageBox(form);

    // Clear invalid highlights as user types
    [nameInput, numberInput, emailInput, dateValInput].forEach(inp => {
        if (inp) {
            inp.addEventListener('input', () => {
                inp.classList.remove('is-invalid');
                if (messageBox) messageBox.style.display = 'none';
            });
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Remove previous invalid highlights
        [nameInput, numberInput, emailInput, dateValInput].forEach(inp => inp && inp.classList.remove('is-invalid'));

        const name = nameInput ? nameInput.value.trim() : '';
        const number = numberInput ? numberInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const date = dateValInput ? dateValInput.value : '';

        // Validations
        if (!name || !number || !email || !date) {
            if (!name && nameInput) nameInput.classList.add('is-invalid');
            if (!number && numberInput) numberInput.classList.add('is-invalid');
            if (!email && emailInput) emailInput.classList.add('is-invalid');
            if (!date && dateValInput) dateValInput.classList.add('is-invalid');
            showMessage(messageBox, 'Please fill in all required fields.', 'error');
            return;
        }

        if (name.length < 2) {
            if (nameInput) nameInput.classList.add('is-invalid');
            showMessage(messageBox, 'Please enter a valid full name (at least 2 characters).', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        // Email Validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(email)) {
            if (emailInput) emailInput.classList.add('is-invalid');
            showMessage(messageBox, 'Please enter a valid email address (e.g. name@example.com).', 'error');
            if (emailInput) emailInput.focus();
            return;
        }

        // Phone Number Validation
        const cleanNumber = number.replace(/[^0-9]/g, '');
        if (cleanNumber.length < 7) {
            if (numberInput) numberInput.classList.add('is-invalid');
            showMessage(messageBox, 'Please enter a valid phone number (at least 7 digits).', 'error');
            if (numberInput) numberInput.focus();
            return;
        }

        // Date Validation
        const todayStr = new Date().toISOString().split('T')[0];
        if (date < todayStr) {
            if (dateValInput) dateValInput.classList.add('is-invalid');
            showMessage(messageBox, 'Appointment date cannot be in the past.', 'error');
            if (dateValInput) dateValInput.focus();
            return;
        }

        const payload = { name, number, email, date };

        // UI Loading State
        const originalBtnText = submitBtn ? submitBtn.value : 'appointment now';
        if (submitBtn) {
            submitBtn.value = 'Booking...';
            submitBtn.disabled = true;
        }

        try {
            const result = await window.ApiService.createAppointment(payload);

            if (result.success) {
                showMessage(messageBox, result.message || 'Appointment booked successfully! We will contact you soon.', 'success');
                form.reset();
            } else {
                let errorMsg = 'Failed to book appointment.';
                if (result.errors) {
                    const firstKey = Object.keys(result.errors)[0];
                    errorMsg = `${firstKey}: ${Array.isArray(result.errors[firstKey]) ? result.errors[firstKey][0] : result.errors[firstKey]}`;
                } else if (result.error) {
                    errorMsg = result.error;
                }
                showMessage(messageBox, errorMsg, 'error');
            }
        } catch (err) {
            showMessage(messageBox, 'An unexpected error occurred. Please try again later.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.value = originalBtnText;
                submitBtn.disabled = false;
            }
        }
    });
});

function createMessageBox(form) {
    const div = document.createElement('div');
    div.className = 'message';
    form.insertBefore(div, form.firstChild);
    return div;
}

function showMessage(element, text, type) {
    element.className = `message alert-message ${type}`;
    element.textContent = text;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
