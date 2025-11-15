import { toggle } from '../utils.js';

export async function updateStatus(read_id, value, triggerEl) {
    const status = ["To read", "Reading", "Completed"];
    const section = triggerEl.closest('.book_section');
    const displayEl = section.querySelector('.display_section');
    const text = displayEl.querySelector('h4');
    const editEl = section.querySelector('.edit_section');
    const res = await fetch("/api/user/status", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: value,
            id: read_id
        })

    });
    if (res.ok && displayEl && editEl) {
        text.textContent = `Your status: ${status[value-1]}`;
        toggle(displayEl);
        toggle(editEl);
    } else { 
        console.warn('Could not update status or find elements');
    }
}