import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repository/userRepository.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { JWTPayload, UserType } from '../models/user.js';
import { VerificationStore } from '../repository/verificationStore.js';
import { sendVerificationEmail } from '../services/emailService.js';

const userRepository = UserRepository.getInstance();

export async function sendVerificationCode(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    // Check if email already registered
    const existingUser = await userRepository.getByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Generate 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in VerificationStore
    VerificationStore.getInstance().set(email, code);

    // Send email
    await sendVerificationEmail(email, code);

    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({ message: 'Internal server error during verification mail sending' });
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, userType, code } = req.body;

    if (!email || !password || !code) {
      res.status(400).json({ message: 'Email, password, and verification code are required' });
      return;
    }

    // Verify verification code
    const isCodeValid = VerificationStore.getInstance().verify(email, code);
    if (!isCodeValid) {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    const type: UserType = userType === 'admin' ? 'admin' : 'user';

    // Double check if user exists (to prevent race conditions)
    const existingUser = await userRepository.getByEmail(email);
    if (existingUser) {
      res.status(400).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await userRepository.create({
      email,
      password: hashedPassword,
      userType: type,
    });

    // Generate JWT Token
    const payload: JWTPayload = {
      id: newUser.id,
      email: newUser.email,
      userType: newUser.userType,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        userType: newUser.userType,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await userRepository.getByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    // Generate JWT Token
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      userType: user.userType,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await userRepository.getById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function verifyCode(req: Request, res: Response): Promise<void> {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      res.status(400).json({ message: 'Email and verification code are required' });
      return;
    }

    const isCodeValid = VerificationStore.getInstance().check(email, code);
    if (!isCodeValid) {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    res.status(200).json({ message: 'Verification code verified successfully' });
  } catch (error) {
    console.error('Verify code error:', error);
    res.status(500).json({ message: 'Internal server error during verification' });
  }
}


