export function renderBooks(books){
    const status = ["To read", "Reading", "Completed"];
    const container = document.getElementById('book_list');

    if (!container){
        return
    }

    container.innerHTML = books.map(book => {
    const read_id = book.book_read_id;

    return `
      <div class="book" data-read-id="${read_id}" id="book_read_id_${read_id}">
      
        <div class="book_section">
          <h2>${book.title}</h2>
          <h3>${book.author} - Genre: ${book.genre}</h3>
          <img src="${book.image_url}" alt="book cover">
        </div>
        <!-- Status section -->
        <div class="book_section book_status" data-read-id="${read_id}">
          <div class="display_section status_section">
            <h4>Your status: ${status[Number(book.status) - 1]}</h4>
            
          </div>
          <button class="toggle_edit">✏️</button>
          <form class="book_status_form edit_section invisible" onsubmit="event.preventDefault()">
          ${status.map((label, index) => `
                <div class="status_radio">
                  <label>${label}</label>
                  <input type="radio" class="edit_status_radio" name="status_${read_id}" value="${index + 1}" data-read-id=${read_id} ${Number(book.status) === index + 1 ? "checked" : ""}>
                </div>
              `).join('')}
          </form>
        </div>
        <!-- Rating section -->
        <div class="book_section book_rating" data-read-id="${read_id}">
          <div class="display_section" data-read-id="${read_id}">
            <h4>Your rating: ${book.rating}/10 ⭐</h4>
          </div>
          <button class="toggle_edit">✏️</button>
          <fieldset class="edit_section invisible">
            <legend>Rating:</legend>
            ${Array.from({ length: 10 }, (_, i) => {
              const val = i + 1;
              const checked = book.rating === val ? 'checked' : '';
              return `
                <label>
                  <input type="radio" name="rating_${read_id}" class="edit_rating_radio" data-read-id="${read_id}" value="${val}" ${checked}>
                  ${val}
                </label>
              `;
            }).join('')}
          </fieldset>
        </div>
        <!-- Note section -->
        <div class="book_section book_note" data-read-id="${read_id}">
          <div class="display_section">
            <fieldset>
              <legend>Your note on the book: </legend>
              <p>${book.note}</p>
            </fieldset>
          </div>
          <button class="toggle_edit">✏️</button>
          <div class="edit_section invisible">
            <fieldset>
              <legend>Edit Notes</legend>
              <textarea rows="3" cols="50">${book.note}</textarea>
            </fieldset>
            <button class="save_note">💾</button>
          </div>
        <div class="delete_button_container">
          <button class="delete_read">❌</button>
        </div>    
          
        </div>
        
      </div>
    `;
  }).join('');
}