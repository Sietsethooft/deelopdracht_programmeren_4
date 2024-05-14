const mysql = require('mysql');
require('dotenv').config();

const pool = mysql.createPool({
<<<<<<< Updated upstream
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

module.exports = pool;

pool.getConnection(function (err, connection) {
    if (err) throw err; // not connected!

    // Use the connection
    connection.query(
        'SELECT name, id FROM meal;',
        function (error, results, fields) {
            connection.release();

            if (error) throw error;
            console.log('the solution is: ', results);
        }
    )

    pool.end((err) => {
        console.log('Connection pool closed')
        });
});

pool.on('acquire', function (connection) {
    console.log('connection %d acquired', connection.threadId);
});

pool.on('release', function (connection) {
    console.log('connection %d released', connection.threadId);
});
=======
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
>>>>>>> Stashed changes
