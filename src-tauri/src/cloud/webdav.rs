use super::traits::SyncProvider;

pub struct WebDavProvider {
    client: reqwest::blocking::Client,
    endpoint: String,
    username: String,
    password: String,
}

impl WebDavProvider {
    pub fn new(config: &serde_json::Value) -> Result<Self, String> {
        let endpoint = config.get("endpoint").and_then(|v| v.as_str()).ok_or("endpoint required")?.to_string();
        let username = config.get("username").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let password = config.get("password").and_then(|v| v.as_str()).unwrap_or("").to_string();
        Ok(Self {
            client: reqwest::blocking::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .connect_timeout(std::time::Duration::from_secs(10))
                .build().map_err(|e| e.to_string())?,
            endpoint, username, password,
        })
    }

    fn file_url(&self) -> String {
        let base = self.endpoint.trim_end_matches('/');
        format!("{}/open-mcp-manager/profile.json", base)
    }
}

impl SyncProvider for WebDavProvider {
    fn name(&self) -> &str { "WebDAV" }

    fn test_connection(&self) -> Result<bool, String> {
        let resp = self.client.request(reqwest::Method::from_bytes(b"PROPFIND").unwrap(), &self.endpoint)
            .basic_auth(&self.username, Some(&self.password))
            .header("Depth", "0")
            .send()
            .map_err(|e| e.to_string())?;
        Ok(resp.status().is_success() || resp.status().as_u16() == 207)
    }

    fn push(&self, data: &[u8]) -> Result<(), String> {
        self.client.put(&self.file_url())
            .basic_auth(&self.username, Some(&self.password))
            .body(data.to_vec())
            .header("Content-Type", "application/json")
            .send()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    fn pull(&self) -> Result<Vec<u8>, String> {
        let resp = self.client.get(&self.file_url())
            .basic_auth(&self.username, Some(&self.password))
            .send()
            .map_err(|e| e.to_string())?;
        if !resp.status().is_success() {
            return Err(format!("WebDAV GET failed: {}", resp.status()));
        }
        resp.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string())
    }
}
