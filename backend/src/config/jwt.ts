import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-change-in-prod';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
export const PORT = process.env.PORT || 5001;
