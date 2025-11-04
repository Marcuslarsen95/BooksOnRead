import { getUserBooks } from './api/getUserBooks.js';
import { renderBooks } from './components/renderBooks.js';
import { updateStatus } from "./api/updateStatus.js";
import { updateRating } from './api/updateRating.js';
import { updateNotes } from './api/updateNotes.js';
import { deleteRead } from './api/deleteRead.js';
import { toggle } from './utils.js';


document.addEventListener('DOMContentLoaded', async () => {
    try {
        const books = await getUserBooks(1);
        renderBooks(books.data);
    } catch (err) {
        console.error("Error loading books:", err);
    }

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
                
            toggle(document.getElementById('searchResults'));
            SearchResultsList.innerHTML = html;
            
        })
        .catch(err => console.error('API error: ', err));
    }    
});


// change event= handler 
document.addEventListener('change', (e) => {
    if (e.target.matches('select.status_select')){
        const read_id = e.target.dataset.readId;
        updateStatus(read_id,e.target.value,e.target)
    }

    if (e.target.matches('.edit_rating_radio')){
        const read_id = e.target.dataset.readId;
        updateRating(read_id, e.target.value, e.target)
    }
})

// click event handler 
document.addEventListener('click', async (e) => {
    if (e.target.closest('.toggle_edit')) {  
        const section = e.target.closest('.book_section');
        if (!section){
            return
        }
        const display_section = section.querySelector('.display_section');
        const edit_section = section.querySelector('.edit_section');  
        if (display_section && edit_section) {
            toggle(display_section);
            toggle(edit_section);
        }
    }

    if (e.target.closest('.save_note')){
        const section = e.target.closest('.book_section');
        const read_id = section.dataset.readId;
        if (!section){
            return
        }
        const display_section = section.querySelector('.display_section');
        const edit_section = section.querySelector('.edit_section');  
        const currentValue = display_section.querySelector('p').textContent.trim();
        const value = edit_section.querySelector('textarea').value.trim();
        if (value !== currentValue){
            updateNotes(read_id, value, e.target);
        }
        toggle(display_section);
        toggle(edit_section);
    }

    if (e.target.closest('.delete_read')){
        const section = e.target.closest('.book');
        const read_id = section.dataset.readId;
        if (!section){
            return
        }
        deleteRead(read_id);
    }

    // sorting and filtering
    if (e.target.closest('.utils_toggle')){
        const toggleBtn = e.target.closest('.utils_toggle');
        const section = e.target.closest('.utils');
        const content = section.querySelector('.utils_content')
        toggle(content, "flex");

        if (!content.classList.contains('invisible')){
            toggleBtn.innerHTML = "❌"
        } else {
            toggleBtn.innerHTML = "📚"
        }
    }

    if (e.target.closest('.sort_button')){
        const target = e.target.closest('.sort_button');
        const sortBy = target.dataset.sortBy;
        const sortDir = target.dataset.sortDir;

        try {
            const books = await getUserBooks(1,1,10,sortBy,sortDir);
            renderBooks(books.data);
        } catch (err) {
            console.error("Error loading books:", err);
        }
    }
})


