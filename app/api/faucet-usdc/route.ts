import { NextRequest, NextResponse } from 'next/server'
import { RpcProvider, Account, cairo, CallData } from 'starknet-v8'

const RPC_URL = process.env.STARKNET_RPC
  ?? 'https://starknet-sepolia-rpc.publicnode.com'

const MOCK_USDC_ADDRESS = '0x021ab8a417e9cb94bf02ff0595bca7506d1237ffed6b5f80ad39460368955891'

export async function POST(req: NextRequest) {
  const { address } = await req.json()

  if (!address || !/^0x[0-9a-fA-F]+$/.test(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const privateKey = process.env.FAUCET_PRIVATE_KEY
  const accountAddress = process.env.FAUCET_ADDRESS
  if (!privateKey || !accountAddress) {
    return NextResponse.json(
      { error: 'Faucet not configured. Set FAUCET_PRIVATE_KEY and FAUCET_ADDRESS.' },
      { status: 500 },
    )
  }

  try {
    const provider = new RpcProvider({ nodeUrl: RPC_URL })
    const account = new Account({ provider, address: accountAddress, signer: privateKey, cairoVersion: '1' })
    const calldata = CallData.compile([address, cairo.uint256(100_000_000)])
    const result = await account.execute([
      { contractAddress: MOCK_USDC_ADDRESS, entrypoint: 'mint', calldata },
    ])
    return NextResponse.json({ tx_hash: result.transaction_hash })
  } catch (err: any) {
    console.error('Faucet error:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Mint failed' },
      { status: 500 },
    )
  }
}
