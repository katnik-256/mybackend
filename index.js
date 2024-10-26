require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Use body-parser to handle URL-encoded data from the form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection string (update with your MongoDB URI)
//const mongoURI = 'mongodb://localhost:27017/formDB'; // For local MongoDB
  // For MongoDB Atlas

// Connect to MongoDB using Mongoose without deprecated options
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log(err));

// Create a Mongoose Schema for the form
const formSchema = new mongoose.Schema({
  name: String,
  phoneNumber: String,
  email: { type: String, required: true, unique: true },
  message: String,
});

// Create a Mongoose model
const Form = mongoose.model('Form', formSchema);
app.get('/submit-form', (req, res) => {
  res.send('Welcome to the backend!');
});


// Route to handle form submission
app.post('/submit-form', async (req, res) => {
  // Extract form data from the request body
  const { name, phoneNumber, email, message } = req.body;

  // Create a new form document
  const newForm = new Form({
    name,
    phoneNumber,
    email,
    message,
  });

  // Save the form data to MongoDB
  try {
    await newForm.save();
    res.send({
      status: 'success',
      message: 'Form submitted and saved to database!',
      data: { name, phoneNumber, email, message }
    });
  } catch (err) {
    res.status(500).send({ status: 'error', message: 'Failed to save form data.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
