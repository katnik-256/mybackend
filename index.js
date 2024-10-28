require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer'); // Import Nodemailer
const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  'https://kikomeko.netlify.app',  // Your deployed front end
  'http://127.0.0.1:5500',         // Local development environment
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
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
//Route for get.
app.get('/', (req, res) => {
  res.send('Server is running!');
});


// Route to handle form submission
app.post('/submit-form', async (req, res) => {
  // Extract form data from the request body
  const { name, phoneNumber, email, message } = req.body;

  
  // Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email service provider
  auth: {
    user: process.env.EMAIL_USERNAME, // Your email
    pass: process.env.EMAIL_PASSWORD, // Your email password or app-specific password
  },
});

// Function to send notification email
const sendNotificationEmail = async (formData) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: 'katnik256@gmIL.com', // Replace with your email address
    subject: 'New Form Submission',
    text: `New form submission:\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`,
  };

  await transporter.sendMail(mailOptions);
};


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
