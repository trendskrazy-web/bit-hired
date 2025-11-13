export interface RedeemCode {
  code: string;
  amount: number;
  used: boolean;
  createdAt: string;
}

// This is a placeholder for a database.
// In a real application, you would store this in a secure database.
export const initialRedeemCodes: RedeemCode[] = [
    { code: 'WELCOME100', amount: 100, used: false, createdAt: new Date().toISOString() }
];
