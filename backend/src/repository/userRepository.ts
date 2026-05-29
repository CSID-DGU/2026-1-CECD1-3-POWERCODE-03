import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.js'; // Use .js extension for NodeNext resolution compatibility

// Handle ES modules __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'users.json');

export class UserRepository {
  private static instance: UserRepository;

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  private initDatabase(): void {
    try {
      // Ensure data directory exists
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      // Check if users.json exists, if not initialize with default accounts
      if (!fs.existsSync(FILE_PATH)) {
        const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
        const defaultUserPassword = bcrypt.hashSync('user123', 10);

        const defaultUsers: User[] = [
          {
            id: '1',
            email: 'admin@example.com',
            password: defaultAdminPassword,
            userType: 'admin',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            email: 'user@example.com',
            password: defaultUserPassword,
            userType: 'user',
            createdAt: new Date().toISOString(),
          },
        ];

        fs.writeFileSync(FILE_PATH, JSON.stringify(defaultUsers, null, 2), 'utf-8');
        console.log('Database initialized with default accounts.');
      }
    } catch (error) {
      console.error('Failed to initialize local JSON database:', error);
    }
  }

  private readUsers(): User[] {
    try {
      if (!fs.existsSync(FILE_PATH)) {
        this.initDatabase();
      }
      const fileData = fs.readFileSync(FILE_PATH, 'utf-8');
      return JSON.parse(fileData) as User[];
    } catch (error) {
      console.error('Error reading user data:', error);
      return [];
    }
  }

  private writeUsers(users: User[]): void {
    try {
      fs.writeFileSync(FILE_PATH, JSON.stringify(users, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing user data:', error);
    }
  }

  public async getAll(): Promise<User[]> {
    return this.readUsers();
  }

  public async getById(id: string): Promise<User | null> {
    const users = this.readUsers();
    return users.find((u) => u.id === id) || null;
  }

  public async getByEmail(email: string): Promise<User | null> {
    const users = this.readUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = this.readUsers();
    const newId = (users.length > 0 ? Math.max(...users.map((u) => parseInt(u.id) || 0)) + 1 : 1).toString();
    
    const newUser: User = {
      id: newId,
      ...userData,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.writeUsers(users);
    return newUser;
  }

  public async update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    const users = this.readUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return null;
    }

    const updatedUser: User = {
      ...users[userIndex],
      ...updates,
    };

    users[userIndex] = updatedUser;
    this.writeUsers(users);
    return updatedUser;
  }

  public async delete(id: string): Promise<boolean> {
    const users = this.readUsers();
    const filteredUsers = users.filter((u) => u.id !== id);

    if (users.length === filteredUsers.length) {
      return false;
    }

    this.writeUsers(filteredUsers);
    return true;
  }
}
