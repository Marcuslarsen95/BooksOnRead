import { getUserBooks } from './api/getUserBooks.js';
import { renderBooks } from './components/renderBooks.js';
import { updateStatus } from "./api/updateStatus.js";
import { updateRating } from './api/updateRating.js';
import { updateNotes } from './api/updateNotes.js';
import { deleteRead } from './api/deleteRead.js';
import { toggle, toggleClass } from './utils.js';

/// global 
let sortBy = "book_reads.read_finished";
let sortDir = "DESC";
let page = 1;
let items_per_page = 10;

/// functions 

// async function getSelectedFilter(e, sortBy, sortDir){
    
//     const section = e.target.closest('.utils');
//         const content = section.querySelector('.utils_content')
//         let input = "";
//         let mod = "";
//         const filter_field = content.querySelector('.filter_options').value;
//         let filter_query = "";
//         switch (filter_field) {
//             case 'text':
//                 input = content.querySelector('.filter_input_text').value;
//                 filter_query = `books.title ILIKE '%${input}%' OR books.author ILIKE '%${input}%'`;
//                 break;
//             case 'number':
//                 input = content.querySelector('.filter_input_number').value;
//                 mod = content.querySelector('.filter_input_number_mod').value;
//                 switch (mod) {
//                     case 'greater':
//                         filter_query = `ratings.rating > ${input}`;
//                         break;
//                     case 'less':
//                         filter_query = `ratings.rating < ${input}`;
//                         break;
//                     case 'equal':
//                         filter_query = `ratings.rating = ${input}`;
//                         break;    
//                 }
                
//                 break;
//         }
        
        
//         const btn = document.querySelector('.utils_toggle');
        
//         try {   
//             const books = await getUserBooks(1,1,10,sortBy,sortDir, filter_query);
//             renderBooks(books.data);
//             toggle(content, 'block')
//             if (!content.classList.contains('invisible')){
//                 btn.innerHTML = "❌"
//             } else {
//                 btn.innerHTML = "📚"
//             }
//         } catch (err) {
//             console.error("Error loading books:", err);
//         }
// }

let filterEventListenerApplied = false;

async function handleFilters(){
    const form = document.getElementById('filter_form');

    if (!filterEventListenerApplied){
        form.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(form);
            const rawValues = Object.fromEntries(formData.entries());
            console.log(rawValues);
            getUserBooks(1, page, items_per_page, sortBy, sortDir, rawValues);
        })
        filterEventListenerApplied = true;
    }
    
}


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

    const form = document.querySelector('#filter_form');

    // form.addEventListener('submit', event => {
    //     event.preventDefault(); // ⛔ stops the page from reloading
    //     handleFilterOptions();  // ✅ run your filter logic or custom behavior
    // });


    // handleFilterOptions()

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
    if (e.target.matches('.edit_status_radio')){
        const read_id = e.target.dataset.readId;
        updateStatus(read_id,e.target.value,e.target)
    }

    if (e.target.matches('.edit_rating_radio')){
        const read_id = e.target.dataset.readId;
        updateRating(read_id, e.target.value, e.target)
    }

    /// filtering
    // if (e.target.matches('.filter_options')){
    //     const value = e.target.value;
    //     var where_clause = "";
    //     if (value === "date"){
    //         toggle(document.querySelector('.filter_date','block'));
    //         toggle(document.querySelector('.filter_number','block'))
    //         toggleClass(document.querySelector('.filter_text'),"invisible");
    //     }
    // }
})

// click event handler 
document.addEventListener('click', async (e) => {
    if (e.target.closest('.toggle_edit')) {
        const target = e.target.closest('.toggle_edit');
        const section = target.closest('.book_section');
        
        if (!section){
            return
        }
        const display_section = section.querySelector('.display_section');
        const edit_section = section.querySelector('.edit_section');  
        if (display_section && edit_section) {
            toggle(display_section);
            toggle(edit_section, "flex");
            if(display_section.classList.contains('invisible')){
                target.innerHTML = "↩️"
            } else {
                target.innerHTML = "✏️"
            }
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
        toggleClass(content, "toggle_flex","hide_on_mobile");

        if (!content.classList.contains('hide_on_mobile')){
            toggleBtn.innerHTML = "❌"
        } else {
            toggleBtn.innerHTML = "📚"
        }
    }

    if (e.target.closest('.sort_button')){
        const target = e.target.closest('.sort_button');
        sortBy = target.dataset.sortBy;
        sortDir = target.dataset.sortDir;
        const btn = document.querySelector('.utils_toggle');
        const section = e.target.closest('.utils');
        const content = section.querySelector('.utils_content')
        try {   
            const books = await getUserBooks(1,1,10,sortBy,sortDir);
            renderBooks(books.data);
            toggle(content, 'block')
            if (!content.classList.contains('invisible')){
                btn.innerHTML = "❌"
            } else {
                btn.innerHTML = "📚"
            }
        } catch (err) {
            console.error("Error loading books:", err);
        }
    }

    if (e.target.closest('.filter_button')){
        handleFilters();
    }
})


