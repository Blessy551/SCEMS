const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const audit = require('../utils/auditLog');
require('dotenv').config();

const publicUser = (user) => ({
  userId: user.UserID,
  name: user.Name,
  email: user.Email,
  role: user.Role,
  department: user.Department,
  clubName: user.ClubName
});

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const [users] = await pool.query('SELECT * FROM Users WHERE Email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.UserID, email: user.Email, role: user.Role, name: user.Name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    await audit.log(user.UserID, user.Role, 'LoginEvent', 'User', user.UserID);

    res.json({ success: true, data: { token, user: publicUser(user) } });
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name || !email || !password || !department) {
      return res.status(400).json({ success: false, message: 'All fields required.' });
    }

    const [existing] = await pool.query('SELECT UserID FROM Users WHERE Email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO Users (Name, Email, PasswordHash, Role, Department) VALUES (?, ?, ?, ?, ?)',
      [name, email, hash, 'HOD', department]
    );

    await audit.log(result.insertId, 'HOD', 'HODRegistered', 'User', result.insertId, { department });

    res.status(201).json({ success: true, message: 'HOD registered successfully.' });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT * FROM Users WHERE UserID = ?', [req.user.userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, data: publicUser(users[0]) });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register, getMe };
