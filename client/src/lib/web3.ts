export const SUPPORTED_TOKENS = [
  {
    symbol: "ETH",
    name: "Ethereum",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    logo: "🔷"
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6,
    logo: "💵"
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6,
    logo: "💲"
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
    logo: "₿"
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    decimals: 18,
    logo: "💎"
  }
];

export const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatAmount = (amount: string | number, decimals: number = 4) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals 
  });
};
