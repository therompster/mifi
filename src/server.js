const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/auth', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String,
  resetTokenExpiration: Date
});

const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).send('User not found');

  const token = jwt.sign({ userId: user._id }, 'secretkey', { expiresIn: '1h' });
  user.resetToken = token;
  user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
  await user.save();

  const mailOptions = {
    to: email,
    from: 'your-email@gmail.com',
    subject: 'Password Reset',
    text: `You requested a password reset. Click the link to reset your password: http://localhost:3000/reset-password/${token}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) return res.status(500).send('Error sending email');
    res.send('Password reset email sent');
  });
});

app.post('/api/new-password', async (req, res) => {
  const { token, password } = req.body;
  const decoded = jwt.verify(token, 'secretkey');
  const user = await User.findOne({ _id: decoded.userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } });
  if (!user) return res.status(400).send('Invalid or expired token');

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  res.send('Password has been reset');
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
