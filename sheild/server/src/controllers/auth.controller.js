import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ok, created, badRequest, unauthorized } from '../utils/response.js';

export const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return badRequest(res, 'Missing fields');

  const existing = await User.findOne({ email });
  if (existing) return badRequest(res, 'Email already in use');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  return created(res, { id: user._id, email: user.email, role: user.role }, 'Registered');
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return unauthorized(res, 'Invalid credentials');

  const valid = await user.comparePassword(password);
  if (!valid) return unauthorized(res, 'Invalid credentials');

  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  // Only return token in body; cookie optional for same-origin
  return ok(res, { token, user: { id: user._id, email: user.email, role: user.role, name: user.name } }, 'Logged in');
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  return ok(res, { user });
};


