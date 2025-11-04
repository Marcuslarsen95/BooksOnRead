import { toggle } from '../utils.js';

export async function updateRating(read_id, value, triggerEl) {
    const section = triggerEl.closest('.book_section');
    const displayEl = section.querySelector('.display_section');
    const text = displayEl.querySelector('h4');
    const editEl = section.querySelector('.edit_section');
    const res = await fetch("/api/user/rating", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            rating: value,
            id: read_id
        })

    });
    if (res.ok && displayEl && editEl) {
        text.textContent = `Your rating: ${value}/10 ⭐`;
        toggle(displayEl);
        toggle(editEl);
    } else {
        console.warn('Could not update rating or find elements.')
    }
}