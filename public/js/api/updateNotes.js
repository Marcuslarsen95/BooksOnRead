import { toggle } from '../utils.js';

export async function updateNotes(read_id, value, triggerEl){
    const section = triggerEl.closest('.book_section');
    const displayEl = section.querySelector('.display_section');
    const text = displayEl.querySelector('p');
    const editEl = section.querySelector('.edit_section');
    console.log('Updating note for', read_id, 'to', value);
    const res = await fetch("/api/user/notes", {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            note: value,
            id: read_id
        })
    })

    if (res.ok && displayEl && editEl){
        text.innerText = value;
        toggle(displayEl);
        toggle(editEl)

    }
}