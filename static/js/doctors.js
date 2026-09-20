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

    container.innerHTML = doctors.map(doc => {
        const rawImg = doc.image || 'image/doc-1.jpg';
        const imgSrc = (rawImg.startsWith('/') || rawImg.startsWith('http')) ? rawImg : '/' + rawImg;
        return `
        <div class="box">
            <img src="${imgSrc}" alt="${escapeHtml(doc.name)}">
            <h3>${escapeHtml(doc.name)}</h3>
            <span>${escapeHtml(doc.specialty || doc.specialization || 'SPECIALIST')}</span>
            <div class="share">
                ${doc.whatsapp ? `<a href="https://wa.me/${escapeHtml(doc.whatsapp.replace(/[^0-9]/g, ''))}" target="_blank" class="fab fa-whatsapp" title="WhatsApp"></a>` : ''}
                ${doc.linkedin ? `<a href="${escapeHtml(doc.linkedin)}" target="_blank" class="fab fa-linkedin" title="LinkedIn"></a>` : ''}
            </div>
        </div>
    `}).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}
