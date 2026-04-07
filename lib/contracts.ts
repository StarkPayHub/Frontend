export const STARKPAY_ADDRESS =
  "0x0107315163ae18bb11f491bc2fa4258df4abbdd3496b6171af639a9e99ff9000";
export const MOCK_USDC_ADDRESS =
  "0x0267c4641ff0fdcb174221bbec398cb1f2e4f423c90b3638c6c87924d7f9792e";

export const starkpayAbi = [
  { type: "impl", name: "StarkPayImpl", interface_name: "starkpay_contracts::interfaces::IStarkPay" },
  { type: "struct", name: "core::integer::u256", members: [{ name: "low", type: "core::integer::u128" }, { name: "high", type: "core::integer::u128" }] },
  { type: "enum", name: "core::bool", variants: [{ name: "False", type: "()" }, { name: "True", type: "()" }] },
  { type: "struct", name: "starkpay_contracts::interfaces::Plan", members: [{ name: "name", type: "core::felt252" }, { name: "price", type: "core::integer::u256" }, { name: "interval", type: "core::integer::u64" }, { name: "merchant", type: "core::starknet::contract_address::ContractAddress" }, { name: "active", type: "core::bool" }] },
  { type: "struct", name: "starkpay_contracts::interfaces::Subscription", members: [{ name: "plan_id", type: "core::integer::u64" }, { name: "start", type: "core::integer::u64" }, { name: "current_period_end", type: "core::integer::u64" }, { name: "active", type: "core::bool" }] },
  { type: "struct", name: "starkpay_contracts::interfaces::MerchantStats", members: [{ name: "total_revenue", type: "core::integer::u256" }, { name: "withdrawable", type: "core::integer::u256" }, { name: "active_subs", type: "core::integer::u64" }, { name: "tx_count", type: "core::integer::u64" }] },
  {
    type: "interface",
    name: "starkpay_contracts::interfaces::IStarkPay",
    items: [
      { type: "function", name: "create_plan", inputs: [{ name: "name", type: "core::felt252" }, { name: "price", type: "core::integer::u256" }, { name: "interval", type: "core::integer::u64" }], outputs: [{ type: "core::integer::u64" }], state_mutability: "external" },
      { type: "function", name: "subscribe", inputs: [{ name: "plan_id", type: "core::integer::u64" }], outputs: [], state_mutability: "external" },
      { type: "function", name: "execute_renewal", inputs: [{ name: "user", type: "core::starknet::contract_address::ContractAddress" }, { name: "plan_id", type: "core::integer::u64" }], outputs: [], state_mutability: "external" },
      { type: "function", name: "cancel_subscription", inputs: [{ name: "plan_id", type: "core::integer::u64" }], outputs: [], state_mutability: "external" },
      { type: "function", name: "withdraw", inputs: [], outputs: [], state_mutability: "external" },
      { type: "function", name: "get_plan", inputs: [{ name: "plan_id", type: "core::integer::u64" }], outputs: [{ type: "starkpay_contracts::interfaces::Plan" }], state_mutability: "view" },
      { type: "function", name: "get_subscription", inputs: [{ name: "user", type: "core::starknet::contract_address::ContractAddress" }, { name: "plan_id", type: "core::integer::u64" }], outputs: [{ type: "starkpay_contracts::interfaces::Subscription" }], state_mutability: "view" },
      { type: "function", name: "is_subscription_active", inputs: [{ name: "user", type: "core::starknet::contract_address::ContractAddress" }, { name: "plan_id", type: "core::integer::u64" }], outputs: [{ type: "core::bool" }], state_mutability: "view" },
      { type: "function", name: "get_merchant_stats", inputs: [{ name: "merchant", type: "core::starknet::contract_address::ContractAddress" }], outputs: [{ type: "starkpay_contracts::interfaces::MerchantStats" }], state_mutability: "view" },
      { type: "function", name: "get_plan_count", inputs: [], outputs: [{ type: "core::integer::u64" }], state_mutability: "view" },
    ],
  },
  { type: "constructor", name: "constructor", inputs: [{ name: "usdc_address", type: "core::starknet::contract_address::ContractAddress" }] },
  { type: "event", name: "starkpay_contracts::starkpay::StarkPay::Event", kind: "enum", variants: [{ name: "PlanCreated", type: "starkpay_contracts::starkpay::StarkPay::PlanCreated", kind: "nested" }, { name: "SubscriptionCreated", type: "starkpay_contracts::starkpay::StarkPay::SubscriptionCreated", kind: "nested" }, { name: "RenewalExecuted", type: "starkpay_contracts::starkpay::StarkPay::RenewalExecuted", kind: "nested" }, { name: "PaymentFailed", type: "starkpay_contracts::starkpay::StarkPay::PaymentFailed", kind: "nested" }, { name: "SubscriptionCancelled", type: "starkpay_contracts::starkpay::StarkPay::SubscriptionCancelled", kind: "nested" }, { name: "WithdrawalMade", type: "starkpay_contracts::starkpay::StarkPay::WithdrawalMade", kind: "nested" }] },
] as const;

export const mockUsdcAbi = [
  { type: "impl", name: "MockUSDCImpl", interface_name: "starkpay_contracts::interfaces::IMockUSDC" },
  { type: "struct", name: "core::integer::u256", members: [{ name: "low", type: "core::integer::u128" }, { name: "high", type: "core::integer::u128" }] },
  { type: "interface", name: "starkpay_contracts::interfaces::IMockUSDC", items: [{ type: "function", name: "mint", inputs: [{ name: "to", type: "core::starknet::contract_address::ContractAddress" }, { name: "amount", type: "core::integer::u256" }], outputs: [], state_mutability: "external" }] },
  { type: "impl", name: "ERC20MixinImpl", interface_name: "openzeppelin_token::erc20::interface::IERC20Mixin" },
  { type: "enum", name: "core::bool", variants: [{ name: "False", type: "()" }, { name: "True", type: "()" }] },
  {
    type: "interface",
    name: "openzeppelin_token::erc20::interface::IERC20Mixin",
    items: [
      { type: "function", name: "total_supply", inputs: [], outputs: [{ type: "core::integer::u256" }], state_mutability: "view" },
      { type: "function", name: "balance_of", inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }], outputs: [{ type: "core::integer::u256" }], state_mutability: "view" },
      { type: "function", name: "allowance", inputs: [{ name: "owner", type: "core::starknet::contract_address::ContractAddress" }, { name: "spender", type: "core::starknet::contract_address::ContractAddress" }], outputs: [{ type: "core::integer::u256" }], state_mutability: "view" },
      { type: "function", name: "transfer", inputs: [{ name: "recipient", type: "core::starknet::contract_address::ContractAddress" }, { name: "amount", type: "core::integer::u256" }], outputs: [{ type: "core::bool" }], state_mutability: "external" },
      { type: "function", name: "transfer_from", inputs: [{ name: "sender", type: "core::starknet::contract_address::ContractAddress" }, { name: "recipient", type: "core::starknet::contract_address::ContractAddress" }, { name: "amount", type: "core::integer::u256" }], outputs: [{ type: "core::bool" }], state_mutability: "external" },
      { type: "function", name: "approve", inputs: [{ name: "spender", type: "core::starknet::contract_address::ContractAddress" }, { name: "amount", type: "core::integer::u256" }], outputs: [{ type: "core::bool" }], state_mutability: "external" },
      { type: "function", name: "name", inputs: [], outputs: [{ type: "core::byte_array::ByteArray" }], state_mutability: "view" },
      { type: "function", name: "symbol", inputs: [], outputs: [{ type: "core::byte_array::ByteArray" }], state_mutability: "view" },
      { type: "function", name: "decimals", inputs: [], outputs: [{ type: "core::integer::u8" }], state_mutability: "view" },
    ],
  },
  { type: "constructor", name: "constructor", inputs: [] },
] as const;
