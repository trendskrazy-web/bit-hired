export interface RedeemCode {
  id: string; // The code itself is the ID
  code: string;
  amount: number;
  used: boolean;
  createdAt: string;
  usedBy?: string;
  usedAt?: string;
}

// This is a placeholder for a database.
// In a real application, you would store this in a secure database.
export const initialRedeemCodes: RedeemCode[] = [
    { id: 'WELCOME100', code: 'WELCOME100', amount: 100, used: false, createdAt: new Date().toISOString() }
];
