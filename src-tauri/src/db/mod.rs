pub mod schema;

use std::fs;
use std::path::PathBuf;

use rusqlite::{Connection, Result};

pub struct Database {
    pub path: PathBuf,
}

impl Database {
    pub fn new() -> std::io::Result<Self> {
        let appdata = std::env::var("APPDATA").unwrap_or_else(|_| ".".to_string());
        let base = PathBuf::from(appdata).join("open-mcp-manager");
        fs::create_dir_all(&base)?;
        Ok(Self {
            path: base.join("open-mcp-manager.db"),
        })
    }

    pub fn connect(&self) -> Result<Connection> {
        let conn = Connection::open(&self.path)?;
        self.migrate(&conn)?;
        Ok(conn)
    }

    fn migrate(&self, conn: &Connection) -> Result<()> {
        conn.execute_batch(include_str!("migrations/001_initial.sql"))
    }
}
