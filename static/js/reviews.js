/**
 * Reviews Component - Asynchronous loader for patient reviews
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#reviews-container') || document.querySelector('.review .box-container');
    if (!container) return;

    try {
        const reviews = await window.ApiService.getReviews();
        renderReviews(reviews, container);
    } catch (err) {
        console.error('Failed to load patient reviews:', err);
    }
});

function renderReviews(reviews, container) {
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p class="text-center">No reviews submitted yet.</p>';
        return;
    }

    container.innerHTML = reviews.map(rev => `
        <div class="box">
            <img src="${rev.image || 'image/pic-1.jpg'}" alt="${rev.name}">
            <h3>${rev.name}</h3>
            <div class="stars">
                ${generateStars(rev.rating || 5)}
            </div>
            <p class="text">${rev.text}</p>
        </div>
    `).join('');
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<i class="fas fa-star"></i>';
    }
    if (hasHalf) {
        starsHtml += '<i class="fas fa-star-half-alt"></i>';
    }
    return starsHtml;
}
