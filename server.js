import express from 'express';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = './db.json';

app.use(cors());
app.use(express.json());

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Błędny login' });

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      res.json({ message: 'OK', role: user.role });
    } else {
      res.status(401).json({ message: 'Błędne hasło' });
    }
  });
});

app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

app.post('/api/products', (req, res) => {
  const db = readDB();
  const product = { id: uuidv4(), ...req.body };
  db.products.push(product);
  writeDB(db);
  res.status(201).json(product);
});

app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter(p => p.id !== req.params.id);
  writeDB(db);
  res.status(204).end();
});

app.get('/api/transactions', (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

app.post('/api/transactions', (req, res) => {
  const db = readDB();
  const transaction = { id: uuidv4(), date: new Date().toISOString(), ...req.body };
  db.transactions.push(transaction);
  writeDB(db);
  res.status(201).json(transaction);
});

app.listen(PORT, () => {
  console.log(`Server działa na http://localhost:${PORT}`);
});
