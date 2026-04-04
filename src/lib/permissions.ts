// ============================================================================
// Permissions Library
// ============================================================================
// Funções para verificar permissões de GM/Admin

import { PoolConnection, RowDataPacket } from 'mysql2/promise'

export interface AccountAccess {
  account_id: number
  gmlevel: number
  realm_id: number
}

/**
 * Verifica se um account tem acesso GM
 */
export async function isGM(
  connection: PoolConnection,
  accountId: number
): Promise<boolean> {
  const [rows] = await connection.query<(AccountAccess & RowDataPacket)[]>(
    `SELECT * FROM acore_auth.account_access WHERE account_id = ? AND gmlevel >= 1`,
    [accountId]
  )

  return rows.length > 0
}

/**
 * Verifica se um account tem GM level mínimo
 */
export async function hasGMLevel(
  connection: PoolConnection,
  accountId: number,
  minLevel: number
): Promise<boolean> {
  const [rows] = await connection.query<(AccountAccess & RowDataPacket)[]>(
    `SELECT * FROM acore_auth.account_access WHERE account_id = ? AND gmlevel >= ?`,
    [accountId, minLevel]
  )

  return rows.length > 0
}

/**
 * Retorna o GM level de um account (0 se não for GM)
 */
export async function getGMLevel(
  connection: PoolConnection,
  accountId: number
): Promise<number> {
  const [rows] = await connection.query<(AccountAccess & RowDataPacket)[]>(
    `SELECT MAX(gmlevel) as gmlevel FROM acore_auth.account_access WHERE account_id = ?`,
    [accountId]
  )

  return rows.length > 0 && rows[0].gmlevel ? rows[0].gmlevel : 0
}

/**
 * Verifica se account é admin (level 3+)
 */
export async function isAdmin(
  connection: PoolConnection,
  accountId: number
): Promise<boolean> {
  return hasGMLevel(connection, accountId, 3)
}

/**
 * Verifica se account pode aprovar listings (moderator level 2+)
 */
export async function canApproveListing(
  connection: PoolConnection,
  accountId: number
): Promise<boolean> {
  return hasGMLevel(connection, accountId, 2)
}

/**
 * Verifica se account pode criar leilões (GM level 2+)
 */
export async function canCreateAuction(
  connection: PoolConnection,
  accountId: number
): Promise<boolean> {
  return hasGMLevel(connection, accountId, 2)
}

/**
 * Verifica se account pode fazer fulfillment (GM level 1+)
 */
export async function canFulfillItems(
  connection: PoolConnection,
  accountId: number
): Promise<boolean> {
  return hasGMLevel(connection, accountId, 1)
}

/**
 * Middleware helper para verificar permissão em endpoints
 */
export function requireGMLevel(minLevel: number) {
  return async (
    connection: PoolConnection,
    accountId: number
  ): Promise<void> => {
    const hasPermission = await hasGMLevel(connection, accountId, minLevel)
    if (!hasPermission) {
      throw new Error(`Insufficient permissions. Required GM level ${minLevel}`)
    }
  }
}
