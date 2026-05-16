pub mod traits;
pub mod s3;
pub mod webdav;
pub mod rest_api;
pub mod github_gist;

use rusqlite::params;
use serde_json::Value;

use crate::db::Database;
use crate::models::{EnvValue, ProfileExport};
use traits::SyncProvider;

pub struct ProviderRecord {
    pub id: String,
    pub provider_type: String,
    pub config: Value,
}

pub struct CloudManager;

impl CloudManager {
    pub fn new() -> Result<Self, String> {
        Ok(Self)
    }

    pub fn build_provider(&self, provider_type: &str, config: &Value) -> Result<Box<dyn SyncProvider>, String> {
        match provider_type {
            "s3" => Ok(Box::new(s3::S3Provider::new(config)?)),
            "webdav" => Ok(Box::new(webdav::WebDavProvider::new(config)?)),
            "rest" => Ok(Box::new(rest_api::RestApiProvider::new(config)?)),
            "gist" => Ok(Box::new(github_gist::GistProvider::new(config)?)),
            _ => Err(format!("unknown provider type: {}", provider_type)),
        }
    }

    pub fn list_providers(db: &Database) -> Result<Vec<ProviderRecord>, String> {
        let conn = db.connect().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT id, provider_type, config_json FROM sync_providers ORDER BY id")
            .map_err(|e| e.to_string())?;
        let rows = stmt
            .query_map([], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                ))
            })
            .map_err(|e| e.to_string())?;
        let mut out = Vec::new();
        for row in rows {
            let (id, ptype, cfg_str) = row.map_err(|e| e.to_string())?;
            let config: Value = serde_json::from_str(&cfg_str).unwrap_or(Value::Object(Default::default()));
            out.push(ProviderRecord { id, provider_type: ptype, config });
        }
        Ok(out)
    }

    pub fn save_provider(db: &Database, id: &str, provider_type: &str, config: &Value) -> Result<(), String> {
        let conn = db.connect().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();
        let cfg_str = serde_json::to_string(config).map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO sync_providers (id, provider_type, config_json, created_at, updated_at) VALUES (?1, ?2, ?3, COALESCE((SELECT created_at FROM sync_providers WHERE id = ?1), ?4), ?5)",
            params![id, provider_type, cfg_str, now, now],
        ).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn sanitize_profile(profile: &ProfileExport) -> ProfileExport {
        let mut sanitized = profile.clone();
        for server in &mut sanitized.servers {
            for (_, val) in server.env.iter_mut() {
                match val {
                    EnvValue::PlainText(v) => *v = "<redacted>".to_string(),
                    EnvValue::VaultRef(_) => {}
                }
            }
        }
        sanitized
    }
}
