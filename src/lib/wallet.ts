// ============================================================================
// Wallet Library
// ============================================================================
// Funções para gerenciar wallets e transações

import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import {
  Wallet,
  WalletTransaction,
  CurrencyType,
  TransactionType,
  ReferenceType
} from './marketplace-types'

// ============================================================================
// WALLET QUERIES
// ============================================================================

/**
 * Busca ou cria wallet de um account
 */
export async function getOrCreateWallet(
  connection: PoolConnection,
  accountId: number
): Promise<Wallet> {
  // Tenta buscar
  const [rows] = await connection.query<(Wallet & RowDataPacket)[]>(
    'SELECT * FROM wow_marketplace.wallets WHERE account_id = ?',
    [accountId]
  )

  if (rows.length > 0) {
    return rows[0]
  }

  // Cria nova wallet
  await connection.query(
    'INSERT INTO wow_marketplace.wallets (account_id, dp, vp) VALUES (?, 0, 0)',
    [accountId]
  )

  // Retorna a wallet criada
  const [newRows] = await connection.query<(Wallet & RowDataPacket)[]>(
    'SELECT * FROM wow_marketplace.wallets WHERE account_id = ?',
    [accountId]
  )

  return newRows[0]
}

/**
 * Busca saldo atual de uma wallet
 */
export async function getBalance(
  connection: PoolConnection,
  accountId: number
): Promise<{ dp: number; vp: number }> {
  const wallet = await getOrCreateWallet(connection, accountId)
  return { dp: wallet.dp, vp: wallet.vp }
}

/**
 * Busca histórico de transações
 */
export async function getTransactions(
  connection: PoolConnection,
  accountId: number,
  limit: number = 50,
  offset: number = 0
): Promise<{ transactions: WalletTransaction[]; total: number }> {
  // Busca transações
  const [transactions] = await connection.query<
    (WalletTransaction & RowDataPacket)[]
  >(
    `SELECT * FROM wow_marketplace.wallet_transactions
     WHERE account_id = ?
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [accountId, limit, offset]
  )

  // Conta total
  const [countResult] = await connection.query<
    ({ total: number } & RowDataPacket)[]
  >(
    'SELECT COUNT(*) as total FROM wow_marketplace.wallet_transactions WHERE account_id = ?',
    [accountId]
  )

  return {
    transactions,
    total: countResult[0].total
  }
}

// ============================================================================
// WALLET OPERATIONS (COM TRANSACTION SAFETY)
// ============================================================================

export interface TransactionParams {
  accountId: number
  currency: CurrencyType
  amount: number
  type: TransactionType
  referenceType?: ReferenceType
  referenceId?: number
  notes?: string
  createdBy?: number
  ipAddress?: string
}

/**
 * Adiciona fundos à wallet (crédito)
 * IMPORTANTE: Deve ser chamado dentro de uma transaction
 */
export async function creditWallet(
  connection: PoolConnection,
  params: TransactionParams
): Promise<WalletTransaction> {
  if (params.amount <= 0) {
    throw new Error('Amount must be positive for credit')
  }

  // Lock wallet para evitar race condition
  const [wallets] = await connection.query<(Wallet & RowDataPacket)[]>(
    'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
    [params.accountId]
  )

  let wallet = wallets[0]

  // Cria wallet se não existir
  if (!wallet) {
    await connection.query(
      'INSERT INTO wow_marketplace.wallets (account_id, dp, vp) VALUES (?, 0, 0)',
      [params.accountId]
    )

    const [newWallets] = await connection.query<(Wallet & RowDataPacket)[]>(
      'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
      [params.accountId]
    )
    wallet = newWallets[0]
  }

  const balanceBefore = params.currency === 'DP' ? wallet.dp : wallet.vp
  const balanceAfter = balanceBefore + params.amount

  // Atualiza wallet
  const field = params.currency === 'DP' ? 'dp' : 'vp'
  await connection.query(
    `UPDATE wow_marketplace.wallets SET ${field} = ? WHERE account_id = ?`,
    [balanceAfter, params.accountId]
  )

  // Insere transaction log
  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO wow_marketplace.wallet_transactions
     (account_id, type, amount, balance_before, balance_after, currency,
      reference_type, reference_id, notes, created_by, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.accountId,
      params.type,
      params.amount,
      balanceBefore,
      balanceAfter,
      params.currency,
      params.referenceType || null,
      params.referenceId || null,
      params.notes || null,
      params.createdBy || null,
      params.ipAddress || null
    ]
  )

  // Retorna transaction criada
  const [transactions] = await connection.query<
    (WalletTransaction & RowDataPacket)[]
  >('SELECT * FROM wow_marketplace.wallet_transactions WHERE id = ?', [
    result.insertId
  ])

  return transactions[0]
}

/**
 * Remove fundos da wallet (débito)
 * IMPORTANTE: Deve ser chamado dentro de uma transaction
 */
export async function debitWallet(
  connection: PoolConnection,
  params: TransactionParams
): Promise<WalletTransaction> {
  if (params.amount <= 0) {
    throw new Error('Amount must be positive for debit')
  }

  // Lock wallet para evitar race condition
  const [wallets] = await connection.query<(Wallet & RowDataPacket)[]>(
    'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
    [params.accountId]
  )

  if (!wallets[0]) {
    throw new Error('Wallet not found')
  }

  const wallet = wallets[0]
  const balanceBefore = params.currency === 'DP' ? wallet.dp : wallet.vp

  // Valida saldo suficiente
  if (balanceBefore < params.amount) {
    throw new Error(`Insufficient ${params.currency} balance`)
  }

  const balanceAfter = balanceBefore - params.amount

  // Atualiza wallet
  const field = params.currency === 'DP' ? 'dp' : 'vp'
  await connection.query(
    `UPDATE wow_marketplace.wallets SET ${field} = ? WHERE account_id = ?`,
    [balanceAfter, params.accountId]
  )

  // Insere transaction log (amount negativo)
  const [result] = await connection.query<ResultSetHeader>(
    `INSERT INTO wow_marketplace.wallet_transactions
     (account_id, type, amount, balance_before, balance_after, currency,
      reference_type, reference_id, notes, created_by, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.accountId,
      params.type,
      -params.amount, // Negativo para débito
      balanceBefore,
      balanceAfter,
      params.currency,
      params.referenceType || null,
      params.referenceId || null,
      params.notes || null,
      params.createdBy || null,
      params.ipAddress || null
    ]
  )

  // Retorna transaction criada
  const [transactions] = await connection.query<
    (WalletTransaction & RowDataPacket)[]
  >('SELECT * FROM wow_marketplace.wallet_transactions WHERE id = ?', [
    result.insertId
  ])

  return transactions[0]
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Verifica se account tem saldo suficiente
 */
export async function hasSufficientBalance(
  connection: PoolConnection,
  accountId: number,
  currency: CurrencyType,
  amount: number
): Promise<boolean> {
  const balance = await getBalance(connection, accountId)
  const currentBalance = currency === 'DP' ? balance.dp : balance.vp
  return currentBalance >= amount
}

/**
 * Transfere fundos entre duas accounts (útil para marketplace)
 * IMPORTANTE: Deve ser chamado dentro de uma transaction
 */
export async function transferFunds(
  connection: PoolConnection,
  fromAccountId: number,
  toAccountId: number,
  currency: CurrencyType,
  amount: number,
  debitType: TransactionType,
  creditType: TransactionType,
  referenceType?: ReferenceType,
  referenceId?: number,
  notes?: string
): Promise<{ debit: WalletTransaction; credit: WalletTransaction }> {
  // Débito da conta origem
  const debit = await debitWallet(connection, {
    accountId: fromAccountId,
    currency,
    amount,
    type: debitType,
    referenceType,
    referenceId,
    notes: notes
      ? `Transfer to account ${toAccountId}: ${notes}`
      : `Transfer to account ${toAccountId}`
  })

  // Crédito na conta destino
  const credit = await creditWallet(connection, {
    accountId: toAccountId,
    currency,
    amount,
    type: creditType,
    referenceType,
    referenceId,
    notes: notes
      ? `Transfer from account ${fromAccountId}: ${notes}`
      : `Transfer from account ${fromAccountId}`
  })

  return { debit, credit }
}

/**
 * Calcula taxa de marketplace (5%)
 */
export function calculateMarketplaceFee(price: number): {
  sellerReceives: number
  fee: number
} {
  const fee = Math.floor(price * 0.05) // 5% taxa
  const sellerReceives = price - fee
  return { sellerReceives, fee }
}

/**
 * Valida se valor está dentro dos limites permitidos
 */
export function validatePrice(price: number): {
  valid: boolean
  error?: string
} {
  if (price < 10) {
    return { valid: false, error: 'Price must be at least 10 DP' }
  }
  if (price > 50000) {
    return { valid: false, error: 'Price cannot exceed 50,000 DP' }
  }
  return { valid: true }
}

// ============================================================================
// AUDIT LOG
// ============================================================================

/**
 * Registra uma ação no audit log
 */
export async function logAuditAction(
  connection: PoolConnection,
  accountId: number,
  actionType: string,
  details: Record<string, any>,
  ipAddress: string
): Promise<void> {
  await connection.query(
    `INSERT INTO wow_marketplace.audit_log (account_id, action_type, details, ip_address)
     VALUES (?, ?, ?, ?)`,
    [accountId, actionType, JSON.stringify(details), ipAddress]
  )
}
