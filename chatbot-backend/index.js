const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "raj@admin123",
    database: "chatboat",
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// REST API Endpoint to Handle Messages
app.post('/message', (req, res) => {
  const { userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ response: 'Message is invalid.' });
  }

  db.query(
    `SELECT response FROM chatbot_responses WHERE question = ?`,
    [userMessage],
    (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).send({ response: 'Internal server error.' });
      }
      if (result.length > 0) {
        res.send({ response: result[0].response });
      } else {
        res.send({ response: 'Sorry, I do not understand that.' });
      }
    }
  );
});

// Real-Time Communication with Socket.io
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('send_message', (data) => {
    socket.broadcast.emit('receive_message', data); // Broadcast to other clients
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
