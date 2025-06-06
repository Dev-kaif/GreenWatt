import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('GreenWatt Backend API is running!');
});

app.use('/api/auth', authRoutes);

// Start the server
app.listen(PORT);