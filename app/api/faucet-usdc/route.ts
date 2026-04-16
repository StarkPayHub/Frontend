import { NextRequest, NextResponse } from 'next/server'
import { RpcProvider, Account, cairo, CallData } from 'starknet'

const RPC_URL = process.env.STARKNET_RPC
  ?? 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/demo'

const MOCK_USDC_ADDRESS = '0x021ab8a417e9cb94bf02ff0595bca7506d1237ffed6b5f80ad39460368955891'

export async function POST(req: NextRequest) {
  const { address } = await req.json()

  if (!address || !/^0x[0-9a-fA-F]+$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  // mint() is owner-only — use KEEPER (= deployer/owner) credentials
  const privateKey = process.env.KEEPER_PRIVATE_KEY
  const accountAddress = process.env.KEEPER_ADDRESS

  if (!privateKey || !accountAddress) {
    return NextResponse.json(
      { error: 'Keeper account not configured. Set KEEPER_PRIVATE_KEY and KEEPER_ADDRESS.' },
      { status: 500 },
    )
  }

  try {
    const provider = new RpcProvider({ nodeUrl: RPC_URL })
    const account = new Account(provider, accountAddress, privateKey)

    const calldata = CallData.compile([address, cairo.uint256(100_000_000)])

    const result = await account.execute(
      [{ contractAddress: MOCK_USDC_ADDRESS, entrypoint: 'mint', calldata }],
      {
        version: 3,
        resourceBounds: {
          l1_gas:      { max_amount: '0x2710', max_price_per_unit: '0x110D9316EC000' },
          l2_gas:      { max_amount: '0x80000', max_price_per_unit: '0x110D9316EC000' },
          l1_data_gas: { max_amount: '0x2710', max_price_per_unit: '0x110D9316EC000' },
        } as any,
      }
    )

    return NextResponse.json({ tx_hash: result.transaction_hash })
  } catch (err: any) {
    console.error('Faucet error:', err)
    const message = String(err?.message ?? err ?? 'Mint failed')
    if (message.includes('invalid signature length') || message.includes('validate entry point panicked')) {
      return NextResponse.json(
        {
          error:
            'Faucet account signature failed. Check that FAUCET_PRIVATE_KEY matches FAUCET_ADDRESS and that the account descriptor was fetched for that exact address.',
        },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: err?.message ?? 'Mint failed' }, { status: 500 })
  }
}
