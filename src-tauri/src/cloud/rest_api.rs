use super::traits::SyncProvider;

pub struct RestApiProvider {
    client: reqwest::blocking::Client,
    endpoint: String,
    api_key: String,
}

impl RestApiProvider {
    pub fn new(config: &serde_json::Value) -> Result<Self, String> {
        let endpoint = config.get("endpoint").and_then(|v| v.as_str()).ok_or("endpoint required")?.to_string();
        let api_key = config.get("api_key").and_then(|v| v.as_str()).unwrap_or("").to_string();
        Ok(Self {
            client: reqwest::blocking::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .connect_timeout(std::time::Duration::from_secs(10))
                .build().map_err(|e| e.to_string())?,
            endpoint, api_key,
        })
    }
}

impl SyncProvider for RestApiProvider {
    fn name(&self) -> &str { "REST API" }

    fn test_connection(&self) -> Result<bool, String> {
        let resp = self.client.get(&self.endpoint)
            .bearer_auth(&self.api_key)
            .send()
            .map_err(|e| e.to_string())?;
        Ok(resp.status().is_success())
    }

    fn push(&self, data: &[u8]) -> Result<(), String> {
        self.client.post(&self.endpoint)
            .bearer_auth(&self.api_key)
            .header("Content-Type", "application/json")
            .body(data.to_vec())
            .send()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    fn pull(&self) -> Result<Vec<u8>, String> {
        let resp = self.client.get(&self.endpoint)
            .bearer_auth(&self.api_key)
            .send()
            .map_err(|e| e.to_string())?;
        if !resp.status().is_success() {
            return Err(format!("REST GET failed: {}", resp.status()));
        }
        resp.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string())
    }
}
