export async function deleteRead(bookReadId){
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