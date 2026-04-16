export const STARKNET_RPC =
  "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo";

export const PLANS = [
  {
    id: 4,
    name: "Starter",
    price: BigInt("10000000"), // 10 USDC (6 decimals)
    priceDisplay: "$10",
    interval: 2592000, // 30 days in seconds
    features: [
      "Up to 50 active subscribers",
      "1 subscription plan",
      "Auto-renewal via keeper",
      "MockUSDC testnet support",
    ],
    highlight: false,
  },
  {
    id: 2,
    name: "Pro",
    price: BigInt("15000000"), // 15 USDC (6 decimals)
    priceDisplay: "$15",
    interval: 2592000,
    features: [
      "Unlimited subscribers",
      "Unlimited plans",
      "Gasless via AVNU Paymaster",
      "Merchant dashboard + analytics",
      "@starkpay/sdk access",
    ],
    highlight: true,
  },
  {
    id: 3,
    name: "Enterprise",
    price: BigInt("50000000"), // 50 USDC (6 decimals)
    priceDisplay: "$50",
    interval: 2592000,
    features: [
      "Custom contract deployment",
      "Dedicated keeper bot infra",
      "White-label SDK",
      "Priority support + SLA",
    ],
    highlight: false,
  },
];
