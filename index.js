import express from 'express'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = 3000
const { Pool } = pg

app.use(express.json())
app.use(
    express.urlencoded({
        extended: true,
    })
)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
})

// get all
app.get('/', (req, res) => {
    console.log("TEST DATA :");
    pool.query(`SELECT * FROM biodata ORDER BY id`)
        .then(result => {
            res.send(result.rows);
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal Server Error');
        });
});

// post data
app.post('/biodata', (req, res) => {
    const { id, nama, nim, kelas } = req.body;

    pool.query(
        `INSERT INTO biodata (id, nama, nim, kelas) VALUES ($1,$2,$3,$4) RETURNING *`,
        [id, nama, nim, kelas]
    )
        .then(result => res.json(result.rows[0]))
        .catch(err => console.error(err));
});

// put data
app.put('/biodata/:id', (req, res) => {
    const { id } = req.params;
    const { nama, nim, kelas } = req.body;

    pool.query(
        `UPDATE biodata SET nama = $1, nim = $2, kelas = $3 WHERE id = $4`,
        [nama, nim, kelas, id]
    )
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(404).json({
                    message: "Data tidak ditemukan"
                });
            }
            res.json({
                message: "Data berhasil diupdate",
                data: result.rows[0]
            })
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Terjadi kesalahan pada server");
        })
})

// delete data
app.delete('/biodata/:id', (req, res) => {
    const { id } = req.params;

    pool.query(
        `DELETE FROM biodata WHERE id = $1 RETURNING *`,
        [id]
    )
        .then(result => {
            if (result.rowCount === 0) {
                return res.status(404).json({
                    message: "Data tidak ditemukan"
                });
            }
            res.json({
                message: "Data berhasil dihapus",
                data: result.rows[0]
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send("Terjadi kesalahan pada server");
        });
});

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
})