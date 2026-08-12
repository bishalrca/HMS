/**
 * Doctors Component - Asynchronous data loader and renderer
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#doctors-container') || document.querySelector('.doctors .box-container');
    if (!container) return;

    try {
        const doctors = await window.ApiService.getDoctors();
        renderDoctors(doctors, container);
    } catch (err) {
        console.error('Failed to load doctors data:', err);
    }
});

function renderDoctors(doctors, container) {
    if (!doctors || doctors.length === 0) {
        container.innerHTML = '<p class="text-center">No doctor profiles available at the moment.</p>';
        return;
    }

    container.innerHTML = doctors.map(doc => `
        <div class="box">
            <img src="${doc.image || 'image/doc-1.jpg'}" alt="${doc.name}">
            <h3>${doc.name}</h3>
            <span>${doc.specialty || doc.specialization || 'SPECIALIST'}</span>
            <div class="share">
                ${doc.facebook ? `<a href="${doc.facebook}" class="fab fa-facebook-f"></a>` : ''}
                ${doc.twitter ? `<a href="${doc.twitter}" class="fab fa-twitter"></a>` : ''}
                ${doc.instagram ? `<a href="${doc.instagram}" class="fab fa-instagram"></a>` : ''}
                ${doc.linkedin ? `<a href="${doc.linkedin}" class="fab fa-linkedin"></a>` : ''}
            </div>
        </div>
    `).join('');
}
