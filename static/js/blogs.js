/**
 * Blogs Component - Asynchronous loader for hospital blog posts
 */

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#blogs-container') || document.querySelector('.blogs .box-container');
    if (!container) return;

    try {
        const blogs = await window.ApiService.getBlogs();
        renderBlogs(blogs, container);
    } catch (err) {
        console.error('Failed to load blog articles:', err);
    }
});

function renderBlogs(blogs, container) {
    if (!blogs || blogs.length === 0) {
        container.innerHTML = '<p class="text-center">No blog articles published yet.</p>';
        return;
    }

    container.innerHTML = blogs.map(blog => `
        <div class="box">
            <div class="image">
                <img src="${blog.image || 'image/blog-1.jpg'}" alt="${blog.title}">
            </div>
            <div class="content">
                <div class="icon">
                    <a href="#"> <i class="fas fa-calendar"></i> ${blog.date} </a>
                    <a href="#"> <i class="fas fa-user"></i> by ${blog.author} </a>
                </div>
                <h3>${blog.title}</h3>
                <p>${blog.summary || blog.text || ''}</p>
                <a href="#" class="btn"> learn more <span class="fas fa-chevron-right"></span> </a>
            </div>
        </div>
    `).join('');
}
