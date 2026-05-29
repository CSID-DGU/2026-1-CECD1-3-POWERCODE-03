import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repository/userRepository.js';
import { User, UserType } from '../models/user.js';

const userRepository = UserRepository.getInstance();

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await userRepository.getAll();
    // Exclude passwords from response
    const safeUsers = users.map(({ password, ...user }) => user);
    res.status(200).json(safeUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await userRepository.getById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { password, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { email, password, userType } = req.body;

    const user = await userRepository.getById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const updates: Partial<Omit<User, 'id' | 'createdAt'>> = {};

    if (email) {
      // Validate email uniqueness if email is changed
      if (email.toLowerCase() !== user.email.toLowerCase()) {
        const existingEmail = await userRepository.getByEmail(email);
        if (existingEmail) {
          res.status(400).json({ message: 'Email already in use' });
          return;
        }
      }
      updates.email = email;
    }

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    if (userType) {
      if (userType !== 'user' && userType !== 'admin') {
        res.status(400).json({ message: 'Invalid user type. Must be user or admin.' });
        return;
      }
      updates.userType = userType as UserType;
    }

    const updatedUser = await userRepository.update(id, updates);
    if (!updatedUser) {
      res.status(500).json({ message: 'Failed to update user' });
      return;
    }

    const { password: _, ...safeUser } = updatedUser;
    res.status(200).json({
      message: 'User updated successfully',
      user: safeUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Prevent administrators from deleting themselves if needed, or allow it
    // For simplicity, we just delete the user
    const deleted = await userRepository.delete(id);
    if (!deleted) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
