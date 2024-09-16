const fs = require('fs');
const MemoryDB = require('./datastore/MemoryDB')
const express = require('express');
const PORT = process.env.PORT || 8000;
const userRouter = require('./routes/userRouter');

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/', userRouter);

// Load data into memory 
if (process.env.NODE_ENV !== 'test') {
    const csvData = fs.readFileSync('./data/data.csv', 'utf8');
    MemoryDB.loadData(csvData);
}

app.use((req, res) => {
    res.status(404).json({ message: 'Path not found, only the following paths are supported: GET /users/:id, GET /users' });
});

const server = app.listen(PORT, function () {
    console.log(`Test Server listening.. Access it using address: http://localhost:${PORT}`);
});

module.exports = server;