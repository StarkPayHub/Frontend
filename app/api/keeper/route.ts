import { NextRequest, NextResponse } from 'next/server'
import { runKeeper } from '@/lib/keeper'

/**
 * GET /api/keeper
 *
 * Runs the keeper bot — checks all subscriptions and renews expired ones.
 *
 * For Vercel Cron: called automatically every hour via vercel.json schedule.
 * For local testing: call manually with:
 *   curl http://localhost:3000/api/keeper?secret=<CRON_SECRET>
 *   or just: curl http://localhost:3000/api/keeper   (if no secret set)
 */
export async function GET(req: NextRequest) {
  // ── Auth guard (optional but recommended for Vercel Cron) ────────────────
  // Vercel automatically sends Authorization: Bearer <CRON_SECRET> header
  // For local testing without a secret, just skip auth check
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    const querySecret = req.nextUrl.searchParams.get('secret')

    const validHeader = authHeader === `Bearer ${cronSecret}`
    const validQuery  = querySecret === cronSecret

    if (!validHeader && !validQuery) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // ── Validate keeper credentials ──────────────────────────────────────────
  if (!process.env.KEEPER_PRIVATE_KEY || !process.env.KEEPER_ADDRESS) {
    return NextResponse.json(
      {
        error: 'Keeper not configured',
        hint: 'Set KEEPER_PRIVATE_KEY and KEEPER_ADDRESS in .env',
      },
      { status: 503 }
    )
  }

  // ── Run keeper ────────────────────────────────────────────────────────────
  try {
    const result = await runKeeper()
    return NextResponse.json({ ok: true, ...result })
  } catch (err: any) {
    console.error('[keeper] Fatal error:', err)
    return NextResponse.json(
      { ok: false, error: err?.message ?? 'Unknown error' },
      { status: 500 }
    )
  }
}
