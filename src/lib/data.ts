export interface DurationOption {
  label: "45 Days";
  cost: number;
  totalEarnings: number;
}

export interface Machine {
  id: string;
  name: string;
  description: string;
  miningRate: number; // in TH/s
  power: number; // in Watts
  durations: DurationOption[];
}

export interface Transaction {
  id: string;
  machineName: string;
  duration: string;
  cost: number;
  date: string;
  status: "Active" | "Expired" | "Pending";
}

// Legacy deposit type
export interface Deposit {
  id: string;
  amount: number;
  date: string;
  redeemCode: string;
  status: "Completed";
}

// New deposit transaction type for admin confirmation flow
export interface DepositTransaction {
  id: string;
  userAccountId: string;
  mobileNumber: string;
  amount: number;
  transactionCode: string;
  status: "pending" | "completed" | "cancelled";
  createdAt: string;
}


const machines: Machine[] = [
  {
    id: "antminer-s19",
    name: "Antminer S19 Pro",
    description:
      "A top-tier ASIC miner offering a high hash rate and efficiency for serious virtual miners.",
    miningRate: 110,
    power: 3250,
    durations: [{ label: "45 Days", cost: 1000, totalEarnings: 1800 }],
  },
  {
    id: "whatsminer-m30s",
    name: "Whatsminer M30S++",
    description:
      "Known for its exceptional performance and stability, a solid choice for consistent returns.",
    miningRate: 112,
    power: 3472,
    durations: [{ label: "45 Days", cost: 3000, totalEarnings: 5000 }],
  },
  {
    id: "avalonminer-1246",
    name: "AvalonMiner 1246",
    description:
      "A reliable workhorse from Canaan, balancing power with a durable design.",
    miningRate: 90,
    power: 3420,
    durations: [{ label: "45 Days", cost: 7500, totalEarnings: 12000 }],
  },
  {
    id: "dragonmint-t1",
    name: "DragonMint T1",
    description:
      "A legacy miner still capable of delivering results. Great for entry-level exploration.",
    miningRate: 16,
    power: 1480,
    durations: [{ label: "45 Days", cost: 15000, totalEarnings: 30000 }],
  },
  {
    id: "innosilicon-t3",
    name: "Innosilicon T3+ Pro",
    description: "A powerful and efficient miner with a strong hash rate.",
    miningRate: 67,
    power: 3300,
    durations: [{ label: "45 Days", cost: 25000, totalEarnings: 56000 }],
  },
  {
    id: "ebang-ebit-e12",
    name: "Ebang Ebit E12+",
    description: "High-performance mining with a focus on energy efficiency.",
    miningRate: 50,
    power: 2500,
    durations: [{ label: "45 Days", cost: 50000, totalEarnings: 110000 }],
  },
  {
    id: "bitfury-tardis",
    name: "Bitfury Tardis",
    description:
      "An enterprise-grade solution offering robust performance and scalability.",
    miningRate: 80,
    power: 6300,
    durations: [{ label: "45 Days", cost: 100000, totalEarnings: 210000 }],
  },
  {
    id: "halong-dragonmint-t2",
    name: "Halong Mining DragonMint T2",
    description: "An efficient miner designed for long-term, stable operations.",
    miningRate: 17,
    power: 1570,
    durations: [{ label: "45 Days", cost: 200000, totalEarnings: 410000 }],
  },
];

const transactions: Transaction[] = [
  {
    id: "txn1",
    machineName: "Antminer S19 Pro",
    duration: "1 Month",
    cost: 400,
    date: "2024-06-01",
    status: "Active",
  },
  {
    id: "txn2",
    machineName: "Whatsminer M30S++",
    duration: "1 Week",
    cost: 120,
    date: "2024-05-20",
    status: "Expired",
  },
  {
    id: "txn3",
    machineName: "AvalonMiner 1246",
    duration: "3 Days",
    cost: 40,
    date: "2024-05-15",
    status: "Expired",
  },
  {
    id: "txn4",
    machineName: "DragonMint T1",
    duration: "1 Month",
    cost: 100,
    date: "2024-04-10",
    status: "Expired",
  },
  {
    id: "txn5",
    machineName: "Antminer S19 Pro",
    duration: "1 Week",
    cost: 110,
    date: "2024-03-25",
    status: "Expired",
  },
];

// Simulate fetching data
export const getMachines = async (): Promise<Machine[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(machines), 50));
};

export const getTransactions = async (): Promise<Transaction[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(transactions), 50));
};

export const getBitcoinData = async () => {
  return new Promise<{ pastBitcoinData: any[]; currentBitcoinPrice: number }>(
    (resolve) => {
      setTimeout(() => {
        resolve({
          pastBitcoinData: [
            { date: "2024-06-01", price: 68000 },
            { date: "2024-05-01", price: 60000 },
            { date: "2024-04-01", price: 65000 },
            { date: "2024-03-01", price: 70000 },
            { date: "2024-02-01", price: 52000 },
          ],
          currentBitcoinPrice: 67500,
        });
      }, 50);
    }
  );
};
