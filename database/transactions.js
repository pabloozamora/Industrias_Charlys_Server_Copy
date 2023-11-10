import query from './query.js';

/**
 * Create sql transaction
 * @returns promise
 */
export const begin = async () => query('BEGIN');

/**
 * Commit sql transaction
 * @returns promise
 */
export const commit = async () => query('COMMIT');

/**
 * Rollback sql transaction
 * @returns promise
 */
export const rollback = async () => query('ROLLBACK');
