const express = require('express');
const bodyParser = require('body-parser');
const quoteRoutes = require('./routes/index');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/quotes', quoteRoutes);

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
