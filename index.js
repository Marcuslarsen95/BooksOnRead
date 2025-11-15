import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import expressLayouts from 'express-ejs-layouts';

const port = process.env.PORT || 3000;
const app = express();
let message = "";

// db connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books-on-read",
  password: process.env.DB_PASSWORD,
  port: 5432,
});
db.connect();

const google_books_api_key = process.env.API_KEY;
const user_id = 1;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// log post, put and patch requests
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    console.log('Request Body:', req.body);
  }
  if (req.method === "GET") {
    console.log(`GET ${req.originalUrl}`);
    console.log("Query Params:", req.query);
  }
  next();
});





app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(expressLayouts);
app.set('layout', 'layout'); // layout.ejs inside ./views


app.get("/", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM book_reads JOIN books ON book_reads.book_api_id = books.book_id JOIN notes ON book_reads.id = notes.book_read_id JOIN ratings ON book_reads.id = ratings.book_read_id WHERE user_id = $1 ORDER BY book_reads.read_finished DESC"
            , [user_id]
        )
        console.log(result.rows);
        res.render('home', {
            message: message,
            books: result.rows 
        });
    } catch (error) {
        console.error(error.stack)
        res.render("/", {
            message: message
        })
    }
    
})

app.get("/api/users/get-reads", async (req, res) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const page_offset = (page -1) * limit;  
    const sort_by = req.query.sortby;
    const sortDir = req.query.sort;
    const where_clause = req.query.where ? `AND ${req.query.where}` : "";
    const values = [
        req.query.user_id,
        page_offset,
        limit,
    ];

    const query = `SELECT * 
            FROM book_reads 
            JOIN books ON book_reads.book_api_id = books.book_id 
            JOIN notes ON book_reads.id = notes.book_read_id 
            JOIN ratings ON book_reads.id = ratings.book_read_id 
            WHERE user_id = $1 ${where_clause}
            ORDER BY ${sort_by} ${sortDir}
            LIMIT $3 
            OFFSET $2`;
    console.log(query);
    try {
        const result = await db.query(query,values);

        const countRes = await db.query("SELECT COUNT(*) FROM book_reads WHERE user_id = $1", [user_id]);
        const total = parseInt(countRes.rows[0].count, 10);
        res.json({
            ok: true, 
            page,
            limit,
            total, 
            data: result.rows
        });
    } catch (error) {
        console.error(error.stack)
    }
    
})

app.get("/api/search-books", async (req, res) => {
    const query = req.query.searchTerm;
    const API_URL = "https://www.googleapis.com/books/v1/volumes";
    if (!query) {
        return res.status(400).json({ error: "Missing searchTerm query parameter" });
    }

    try {
        const response = await axios.get(API_URL, {
            params: {
                q: query,
                key: google_books_api_key,
                maxResults: 20,
                orderBy: "relevance",
                langRestrict: "en"
            },
            headers: {
                'User-Agent': 'BooksOnRead/1.0'
            }

        });
        res.json(response.data.items) 
    } catch (error) {
        console.error("Google Books API error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        res.status(500).json({ error: "Failed to fetch data from Google Books API" });
    }
    
    
})

app.get("/book", async (req, res) => {
    const id = req.query.id;
    if (!id) {
        return res.status(400).json({ error: "Missing searchTerm query parameter" });
    }

    try {
        const response = await axios.get(`https://www.googleapis.com/books/v1/volumes/${id}`, {
            params: {
                key: google_books_api_key
            }

        });
        console.log(response.data);
        res.render("book", {
            data: response.data
        })
    } catch (error) {
        console.error("Google Books API API error:", {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        res.status(500).json({ error: "Failed to fetch data from Google Books API   " });
    }

})

app.post("/add-read", async (req, res) => {
    const values = [
        req.body.title,        // $1
        req.body.imageSrc,    // $2
        req.body.bookId,       // $3
        user_id,               // $4
        req.body.status,       // $5
        req.body.notes,        // $6
        req.body.rating,        // $7
        req.body.author,         // $8
        req.body.genre             // $9
    ];



    const insertQuery = `
        WITH new_book AS (
            INSERT INTO books (title, image_url, book_id, author, genre)
            VALUES ($1, $2, $3, $8, $9)
            ON CONFLICT (book_id) DO NOTHING
            RETURNING id
        ),
            new_read AS (
            INSERT INTO book_reads (book_id, user_id, status, book_api_id, read_finished)
            VALUES ((SELECT id FROM new_book), $4, $5, $3, NOW())
            ON CONFLICT DO NOTHING
            RETURNING id
        ),
            new_note AS (
            INSERT INTO notes (book_read_id, note, date_added, date_modified)
            VALUES ((SELECT id FROM new_read), $6, NOW(), NOW())
            RETURNING id
        ),
            new_rating AS (
            INSERT INTO ratings (book_read_id, rating, date_added, date_modified)
            VALUES ((SELECT id FROM new_read), $7, NOW(), NOW())
        )
        SELECT 'Insert complete';
    `;

    try {
        await db.query("BEGIN");
        const result = await db.query(insertQuery, values)
        await db.query("COMMIT");
    } catch (error) {
        console.error(error.stack)
    }


    message = "Book added!";
    res.redirect("/")
})

// remove book from read list
app.patch("/api/user/delete_read", async (req, res) => {
    const id = req.body.id;
    try {
        const result = await db.query("DELETE FROM book_reads WHERE id = $1", [id]);
        message = "Book removed";
        res.status(200).json({message: "Book removed!"})
    } catch (error) {
        console.error(error.stack)
    }
})

// update status 
app.patch("/api/user/status", async (req, res) => {
    const array = [
        req.body.id,
        req.body.status
    ]

    try {
        const result = await db.query('UPDATE book_reads SET status = $2 WHERE id = $1 RETURNING *', array)
        res.send(result);
    } catch (error) {
        console.error(error.stack)
        res.status(500).send({ error: 'Failed to update status' });
    }
})

// update rating
app.patch("/api/user/rating", async (req, res) => {
    const values = [
        req.body.id,
        req.body.rating
    ]

    try {
        await db.query("BEGIN");
        const result = await db.query('UPDATE ratings SET rating = $2, date_modified = NOW() WHERE book_read_id = $1 RETURNING *', values);
        await db.query("COMMIT");
        
        res.send(result);
    } catch (error) {
        console.error(error.stack)
        res.status(500).send({ error: 'Failed to update rating'});
    }
})

app.patch("/api/user/notes", async (req, res) => {
    const values = [
        req.body.id,
        req.body.note
    ]

    try {
        const result = await db.query("UPDATE notes SET note = $2 WHERE book_read_id = $1 RETURNING *", values)
        res.send(result);
    } catch (error) {
        console.error(error.stack)
        res.status(500).send({ error: 'Failed to update note'});
    }
})

app.use((req, res) => {
  res.status(404).render('404.ejs', { url: req.originalUrl });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})