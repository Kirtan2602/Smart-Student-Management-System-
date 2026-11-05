import 'dotenv/config';
import app from './src/app.js';

// Secret na hoy to server start j na thay
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET .env ma set karo (kam se kam 32 characters).');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});