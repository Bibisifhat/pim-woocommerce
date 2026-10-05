import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/pim.db');
db.exec(`UPDATE products SET woo_id = NULL, sync_status = 'not_synced', last_synced_at = NULL`);
console.log('Sync state reset for all products');