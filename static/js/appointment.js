/**
 * Appointment Component - Asynchronous form handling, validation, and feedback notifications
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#appointment-form') || document.querySelector('.appointment form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('input[name="name"]');
        const numberInput = form.querySelector('input[name="number"]');
        const emailInput = form.querySelector('input[name="email"]');
        const dateInput = form.querySelector('input[name="date"]');
        const submitBtn = form.querySelector('input[type="submit"]');

        const messageBox = form.querySelector('.message') || createMessageBox(form);

        // Validation
        const name = nameInput ? nameInput.value.trim() : '';
        const number = numberInput ? numberInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        const date = dateInput ? dateInput.value : '';

        if (!name || !number || !email || !date) {
            showMessage(messageBox, 'Please fill in all required fields.', 'error');
            return;
        }

        const payload = { name, number, email, date };

        // UI Loading State
        const originalBtnText = submitBtn.value;
        submitBtn.value = 'Booking...';
        submitBtn.disabled = true;

        try {
            const result = await window.ApiService.createAppointment(payload);

            if (result.success) {
                showMessage(messageBox, result.message || 'Appointment booked successfully! We will contact you soon.', 'success');
                form.reset();
            } else {
                showMessage(messageBox, result.error || 'Failed to book appointment. Please try again.', 'error');
            }
        } catch (err) {
            showMessage(messageBox, 'An unexpected error occurred. Please try again later.', 'error');
        } finally {
            submitBtn.value = originalBtnText;
            submitBtn.disabled = false;
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
