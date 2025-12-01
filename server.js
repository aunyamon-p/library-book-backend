import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes/index.js';
import { connectDB } from './db/sqlServer.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to start server:', err);
});
