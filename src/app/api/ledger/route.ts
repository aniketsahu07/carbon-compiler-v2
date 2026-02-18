import { NextRequest, NextResponse } from 'next/server';
import type { Transaction } from '@/lib/types';

// ---------------------------------------------------------------------------
// In-process ledger store
// Using a global so it survives Next.js hot-reloads in dev mode.
// ---------------------------------------------------------------------------
type LedgerEntry = Transaction & { id: string };

declare global {
  // eslint-disable-next-line no-var
  var __ledgerStore: LedgerEntry[] | undefined;
}

if (!global.__ledgerStore) {
  global.__ledgerStore = [];
}

const store = global.__ledgerStore;

// ---------------------------------------------------------------------------
// GET /api/ledger  – return all entries, newest first
// ---------------------------------------------------------------------------
export async function GET() {
  const sorted = [...store].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return NextResponse.json(sorted);
}

// ---------------------------------------------------------------------------
// POST /api/ledger  – add a new ledger entry
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Transaction, 'id'>;

    if (!body.txHash || !body.action || !body.creditId) {
      return NextResponse.json(
        { error: 'Missing required fields: txHash, action, creditId' },
        { status: 400 }
      );
    }

    const entry: LedgerEntry = {
      ...body,
      id: crypto.randomUUID(),
      timestamp: body.timestamp ?? new Date().toISOString(),
    };

    store.unshift(entry);           // Put newest at the front
    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}
