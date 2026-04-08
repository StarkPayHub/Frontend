import { RpcProvider, Account, Contract, CallData, hash } from 'starknet'
import { STARKPAY_ADDRESS } from './contracts'

// ─── Config (from env) ──────────────────────────────────────────────────────
const RPC_URL = process.env.STARKNET_RPC
  ?? 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo'

const DEPLOY_BLOCK = Number(process.env.DEPLOY_BLOCK ?? 0)

// ─── ABI (minimal — only what keeper needs) ─────────────────────────────────
const KEEPER_ABI = [
  { type: "function", name: "get_subscription", inputs: [{ name: "user", type: "core::starknet::contract_address::ContractAddress" }, { name: "plan_id", type: "core::integer::u64" }], outputs: [{ type: "starkpay_contracts::interfaces::Subscription" }], state_mutability: "view" },
  { type: "function", name: "execute_renewal",  inputs: [{ name: "user", type: "core::starknet::contract_address::ContractAddress" }, { name: "plan_id", type: "core::integer::u64" }], outputs: [], state_mutability: "external" },
  { type: "struct",   name: "starkpay_contracts::interfaces::Subscription", members: [{ name: "plan_id", type: "core::integer::u64" }, { name: "start", type: "core::integer::u64" }, { name: "current_period_end", type: "core::integer::u64" }, { name: "active", type: "core::bool" }] },
  { type: "enum",     name: "core::bool", variants: [{ name: "False", type: "()" }, { name: "True", type: "()" }] },
]

// ─── Types ──────────────────────────────────────────────────────────────────
interface SubRecord { user: string; planId: number }

export interface KeeperResult {
  timestamp: string
  found: number
  renewed: number
  skipped: number
  failed: number
  logs: string[]
}

// ─── Core keeper logic ──────────────────────────────────────────────────────
export async function runKeeper(): Promise<KeeperResult> {
  const logs: string[] = []
  const log = (msg: string) => { logs.push(msg); console.log(msg) }

  const keeperKey = process.env.KEEPER_PRIVATE_KEY ?? ''
  const keeperAddr = process.env.KEEPER_ADDRESS ?? ''

  if (!keeperKey || !keeperAddr) {
    throw new Error('KEEPER_PRIVATE_KEY and KEEPER_ADDRESS env vars required')
  }

  const provider = new RpcProvider({ nodeUrl: RPC_URL })
  const keeperAccount = new Account(provider, keeperAddr, keeperKey)
  const contract = new Contract(KEEPER_ABI, STARKPAY_ADDRESS, provider)

  log(`🔄 Keeper running at ${new Date().toISOString()}`)
  log(`   StarkPay: ${STARKPAY_ADDRESS}`)
  log(`   Keeper:   ${keeperAddr.slice(0, 12)}...`)

  // 1. Fetch all SubscriptionCreated events to discover subscriptions
  log('📡 Fetching SubscriptionCreated events...')
  const eventKey = hash.getSelectorFromName('SubscriptionCreated')
  const subs: SubRecord[] = []
  let continuationToken: string | undefined = undefined

  do {
    const response = await provider.getEvents({
      address: STARKPAY_ADDRESS,
      keys: [[eventKey]],
      from_block: { block_number: DEPLOY_BLOCK },
      to_block: 'latest',
      chunk_size: 100,
      ...(continuationToken ? { continuation_token: continuationToken } : {}),
    })

    for (const evt of response.events) {
      if (evt.keys.length >= 2) {
        const user = evt.keys[1]
        const planId = Number(evt.data[0])
        if (user && planId > 0) {
          if (!subs.find(s => s.user === user && s.planId === planId)) {
            subs.push({ user, planId })
          }
        }
      }
    }
    continuationToken = response.continuation_token ?? undefined
  } while (continuationToken)

  log(`   Found ${subs.length} unique subscriptions`)

  // 2. Check each subscription and renew if period ended
  const now = Math.floor(Date.now() / 1000)
  let renewed = 0, skipped = 0, failed = 0

  for (const { user, planId } of subs) {
    try {
      const sub: any = await contract.get_subscription(user, planId)
      const active = sub.active === true || sub.active === 1n || sub.active?.variant?.True !== undefined
      const periodEnd = Number(sub.current_period_end)

      if (!active) { skipped++; continue }

      if (periodEnd < now) {
        try {
          const result = await keeperAccount.execute([{
            contractAddress: STARKPAY_ADDRESS,
            entrypoint: 'execute_renewal',
            calldata: CallData.compile({ user, plan_id: planId }),
          }])
          await provider.waitForTransaction(result.transaction_hash)
          log(`   ✅ Renewed user=${user.slice(0, 10)}... plan=${planId} tx=${result.transaction_hash.slice(0, 14)}...`)
          renewed++
        } catch (err: any) {
          log(`   ❌ Failed user=${user.slice(0, 10)}... plan=${planId}: ${err?.message ?? err}`)
          failed++
        }
      } else {
        skipped++
      }
    } catch (err: any) {
      log(`   ⚠️ Error reading sub user=${user.slice(0, 10)}... plan=${planId}: ${err?.message}`)
      failed++
    }
  }

  log(`\n📊 Done: ${renewed} renewed, ${skipped} skipped, ${failed} failed`)

  return {
    timestamp: new Date().toISOString(),
    found: subs.length,
    renewed,
    skipped,
    failed,
    logs,
  }
}
