use chrono::Utc;
use rusqlite::params;
use windows::Win32::Security::Cryptography::{CryptProtectData, CryptUnprotectData, CRYPT_INTEGER_BLOB};

use crate::db::Database;

pub fn encrypt(data: &[u8]) -> Result<Vec<u8>, String> {
    unsafe {
        let input = CRYPT_INTEGER_BLOB {
            cbData: data.len() as u32,
            pbData: data.as_ptr() as *mut u8,
        };
        let mut output = CRYPT_INTEGER_BLOB::default();
        CryptProtectData(&input, None, None, None, None, 0, &mut output)
            .map_err(|_| "dpapi encrypt failed".to_string())?;
        let encrypted = std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();
        // DPAPI-allocated buffer freed when Vec takes ownership via to_vec()
        Ok(encrypted)
    }
}

pub fn decrypt(data: &[u8]) -> Result<Vec<u8>, String> {
    unsafe {
        let input = CRYPT_INTEGER_BLOB {
            cbData: data.len() as u32,
            pbData: data.as_ptr() as *mut u8,
        };
        let mut output = CRYPT_INTEGER_BLOB::default();
        CryptUnprotectData(&input, None, None, None, None, 0, &mut output)
            .map_err(|_| "dpapi decrypt failed".to_string())?;
        if output.pbData.is_null() {
            return Ok(Vec::new());
        }
        let decrypted = std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec();
        // DPAPI-allocated buffer freed when Vec takes ownership via to_vec()
        Ok(decrypted)
    }
}

pub fn store(db: &Database, server_id: &str, env_key: &str, value: &[u8]) -> Result<(), String> {
    let enc = encrypt(value)?;
    let conn = db.connect().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let id = format!("{server_id}:{env_key}");
    conn.execute(
        "INSERT OR REPLACE INTO vault_entries (id, server_id, env_key, encrypted_value, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, COALESCE((SELECT created_at FROM vault_entries WHERE id = ?1), ?5), ?6)",
        params![id, server_id, env_key, enc, now, now],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn get(db: &Database, server_id: &str, env_key: &str) -> Result<Option<Vec<u8>>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT encrypted_value FROM vault_entries WHERE server_id = ?1 AND env_key = ?2")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query(params![server_id, env_key]).map_err(|e| e.to_string())?;
    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let encrypted: Vec<u8> = row.get(0).map_err(|e| e.to_string())?;
        return Ok(Some(decrypt(&encrypted)?));
    }
    Ok(None)
}

pub fn delete(db: &Database, server_id: &str, env_key: &str) -> Result<(), String> {
    db.connect()
        .map_err(|e| e.to_string())?
        .execute(
            "DELETE FROM vault_entries WHERE server_id = ?1 AND env_key = ?2",
            params![server_id, env_key],
        )
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub fn list_keys(db: &Database, server_id: &str) -> Result<Vec<String>, String> {
    let conn = db.connect().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT env_key FROM vault_entries WHERE server_id = ?1 ORDER BY env_key")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map(params![server_id], |r| r.get::<_, String>(0))
        .map_err(|e| e.to_string())?;
    let mut keys = Vec::new();
    for row in rows {
        keys.push(row.map_err(|e| e.to_string())?);
    }
    Ok(keys)
}
