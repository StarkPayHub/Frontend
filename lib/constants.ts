export const STARKNET_RPC =
  "https://starknet-sepolia.public.blastapi.io/rpc/v0_7";

export const PLANS = [
  {
    id: 1,
    name: "Starter",
    price: BigInt("9000000"), // 9 USDC (6 decimals)
    priceDisplay: "$9",
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
    price: BigInt("49000000"), // 49 USDC
    priceDisplay: "$49",
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
    price: BigInt("0"),
    priceDisplay: "Custom",
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
