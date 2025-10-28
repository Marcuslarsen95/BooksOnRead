const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const status = ["Not yet started 🔴", "Currently reading/paused 🟡", "Finished 🟢"];



document.addEventListener('DOMContentLoaded', () => {
    const inputSearch = document.getElementById('inputBookSearch');
    const SearchResults = document.getElementById('searchResults');
    const SearchResultsList = document.getElementById('searchResultsList');
    let debouncetimer;

    inputSearch.addEventListener('keyup', (event) => {
        const query = inputSearch.value.trim();
        clearTimeout(debouncetimer);
        if (event.key === "Enter"){
            if (query) {
                searchBooksApi(query);
            }
        } else {
            debouncetimer = setTimeout(() => {
            if (query) {
                searchBooksApi(query);
            }
            }, 500);
        }
        
    })

    function hideMessage(){
        const message = document.getElementById('message');
        if (message) {
            setTimeout(() => {
            message.classList.add('slide-out');
                setTimeout(() => {
                    message.style.display = "none";
                },3000)
            },3000)
        }
        
    }
    hideMessage();

    function searchBooksApi(query) {
        fetch(`/api/search-books?searchTerm=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
            SearchResultsList.innerHTML = ''; // clear previous results
            const books = data || [];
            if (books.length === 0) {
                SearchResults.innerHTML = '<li>No results found.</li>';
                return;
            }

            const html = books.map(book => {
                const info = book.volumeInfo || {};
                const title = info.title || "Untitled";
                const author = Array.isArray(info.authors) ? info.authors[0] : "Unkown author";
                const published = info.publishedDate || "Unknown date";
                const thumbnail = info.imageLinks?.thumbnail || "";
                return `<a href='/book?id=${book.id}'>
                    <li class="search_result_list_item">
                        <img src='${thumbnail}' alt='Book cover'>
                        <div class="text_block">
                            <h2>Title: ${title}</h2>
                            <h3>Author: ${author} - Published on ${published}</h3>
                        </div>
                    </li>
                </a>`;
            }).join(' ');
                
            toggle('#searchResults');
            SearchResultsList.innerHTML = html;
            
        })
        .catch(err => console.error('API error: ', err));
    }
});

function toggleEdit(hideId, showId){
    document.getElementById(hideId).style.display = "none";
    document.getElementById(showId).style.display = "block";
}

function toggle(e){
    const element = document.querySelector(e);
    element.classList.toggle('toggle');
    element.classList.toggle('invisible');
}

function show(e){
    document.getElementById(e).style.display = "block";
}

function hide(e){
    document.getElementById(e).style.display = "none";
}

async function updateStatus(bookReadId, newStatus, targetElement) {
    const res = await fetch("/api/user/status", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            status: newStatus,
            id: bookReadId
        })

    });
    if (res.ok) {
        const target = document.querySelector(targetElement);

        if (target) {
            target.textContent = `Your status: ${status[newStatus-1]}`;
            toggleEdit(`status_form_${bookReadId}` , `status_display_${bookReadId}`)
        } else {
            console.warn('Could not find target element:', targetElement);
        }

    }
}

async function updateRating(bookReadId, newRating, targetElement) {
    const res = await fetch("/api/user/rating", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            rating: newRating,
            id: bookReadId
        })

    });
    if (res.ok) {
        const target = document.querySelector(targetElement);

        if (target) {
            target.textContent = `Your rating: ${newRating}/10`;
            toggleEdit(`rating_form_${bookReadId}` , `rating_display_${bookReadId}`)
        } else {
            console.warn('Could not find target element:', targetElement);
        }

    }
}

async function updateNotes(bookReadId, newNote, targetElement){
    const res = await fetch("/api/user/notes", {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            note: newNote,
            id: bookReadId
        })
    })

    if (res.ok){
        const target = document.querySelector(targetElement);

        if (target){
            target.textContent = newNote;
            toggleEdit(`note_form_${bookReadId}`,`note_display_${bookReadId}`)
        } else {
            console.warn('Could not find target element:', targetElement);
        }
    }
}

async function deleteRead(bookReadId){
    const res = await fetch("/api/user/delete_read", {
        method:"PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: bookReadId
        })
    })

    if (res.ok){
        const book = document.querySelector(`#book_read_id_${bookReadId}`);
        book.style.display = "none";
    }
}
