export interface VerificationData {
  code: string;
  expiresAt: Date;
}

export class VerificationStore {
  private static instance: VerificationStore;
  // Key: email (lowercased), Value: VerificationData
  private store: Map<string, VerificationData> = new Map();

  private constructor() {
    // Periodically clean up expired codes every 1 minute
    setInterval(() => this.cleanupExpired(), 60 * 1000);
  }

  public static getInstance(): VerificationStore {
    if (!VerificationStore.instance) {
      VerificationStore.instance = new VerificationStore();
    }
    return VerificationStore.instance;
  }

  public set(email: string, code: string, durationMinutes: number = 5): void {
    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
    this.store.set(email.toLowerCase(), { code, expiresAt });
  }

  public verify(email: string, code: string): boolean {
    const key = email.toLowerCase();
    const data = this.store.get(key);

    if (!data) {
      return false;
    }

    // Check if code has expired
    if (new Date() > data.expiresAt) {
      this.store.delete(key);
      return false;
    }

    const isValid = data.code === code;
    
    if (isValid) {
      // Delete after successful validation (one-time use)
      this.store.delete(key);
    }

    return isValid;
  }

  public check(email: string, code: string): boolean {
    const key = email.toLowerCase();
    const data = this.store.get(key);

    if (!data) {
      return false;
    }

    if (new Date() > data.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return data.code === code;
  }

  private cleanupExpired(): void {
    const now = new Date();
    for (const [email, data] of this.store.entries()) {
      if (now > data.expiresAt) {
        this.store.delete(email);
      }
    }
  }
}
