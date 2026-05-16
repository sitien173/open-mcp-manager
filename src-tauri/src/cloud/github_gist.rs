use serde_json::{json, Value};
use super::traits::SyncProvider;

pub struct GistProvider {
    client: reqwest::blocking::Client,
    token: String,
    gist_id: String,
}

impl GistProvider {
    pub fn new(config: &serde_json::Value) -> Result<Self, String> {
        let token = config.get("token").and_then(|v| v.as_str()).ok_or("token required")?.to_string();
        let gist_id = config.get("gist_id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        Ok(Self {
            client: reqwest::blocking::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .connect_timeout(std::time::Duration::from_secs(10))
                .user_agent("open-mcp-manager")
                .build().map_err(|e| e.to_string())?,
            token, gist_id,
        })
    }
}

impl SyncProvider for GistProvider {
    fn name(&self) -> &str { "GitHub Gist" }

    fn test_connection(&self) -> Result<bool, String> {
        let resp = self.client.get("https://api.github.com/gists")
            .bearer_auth(&self.token)
            .send()
            .map_err(|e| e.to_string())?;
        Ok(resp.status().is_success())
    }

    fn push(&self, data: &[u8]) -> Result<(), String> {
        let content = String::from_utf8(data.to_vec()).map_err(|_| "invalid utf-8")?;
        let body = json!({
            "files": {
                "open-mcp-manager-profile.json": {
                    "content": content
                }
            }
        });

        if self.gist_id.is_empty() {
            let mut create_body = body.clone();
            if let Some(obj) = create_body.as_object_mut() {
                obj.insert("description".to_string(), Value::String("Open MCP Manager Profile".to_string()));
                obj.insert("public".to_string(), Value::Bool(false));
            }
            self.client.post("https://api.github.com/gists")
                .bearer_auth(&self.token)
                .json(&create_body)
                .send()
                .map_err(|e| e.to_string())?;
        } else {
            self.client.patch(&format!("https://api.github.com/gists/{}", self.gist_id))
                .bearer_auth(&self.token)
                .json(&body)
                .send()
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    }

    fn pull(&self) -> Result<Vec<u8>, String> {
        if self.gist_id.is_empty() {
            return Err("gist_id required for pull".to_string());
        }
        let resp = self.client.get(&format!("https://api.github.com/gists/{}", self.gist_id))
            .bearer_auth(&self.token)
            .send()
            .map_err(|e| e.to_string())?;
        if !resp.status().is_success() {
            return Err(format!("Gist GET failed: {}", resp.status()));
        }
        let gist: Value = resp.json().map_err(|e| e.to_string())?;
        let content = gist.get("files")
            .and_then(|f| f.get("open-mcp-manager-profile.json"))
            .and_then(|f| f.get("content"))
            .and_then(|c| c.as_str())
            .ok_or("profile file not found in gist")?;
        Ok(content.as_bytes().to_vec())
    }
}
