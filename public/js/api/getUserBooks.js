export async function getUserBooks(user_id, page = 1, limit = 10, sortby = "book_reads.read_finished", sort = "DESC", where = null){
    const query = new URLSearchParams({
        user_id,
        page,
        limit,
        sortby,
        sort
    });

    if (where) {
        query.append('where', where);
    }

    const res = await fetch(`/api/users/get-reads?${query.toString()}`, {
        method:'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (res.ok) {
        const data = await res.json();
        return data;
    } else {
        console.error("Failed to fetch user books");
    }

}

