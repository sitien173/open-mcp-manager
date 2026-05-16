use super::traits::SyncProvider;

pub struct S3Provider {
    client: reqwest::blocking::Client,
    endpoint: String,
    bucket: String,
    access_key: String,
    secret_key: String,
    region: String,
}

impl S3Provider {
    pub fn new(config: &serde_json::Value) -> Result<Self, String> {
        let endpoint = config.get("endpoint").and_then(|v| v.as_str()).unwrap_or("https://s3.amazonaws.com").to_string();
        let bucket = config.get("bucket").and_then(|v| v.as_str()).ok_or("bucket required")?.to_string();
        let access_key = config.get("access_key").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let secret_key = config.get("secret_key").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let region = config.get("region").and_then(|v| v.as_str()).unwrap_or("us-east-1").to_string();
        Ok(Self {
            client: reqwest::blocking::Client::builder()
                .timeout(std::time::Duration::from_secs(30))
                .connect_timeout(std::time::Duration::from_secs(10))
                .build().map_err(|e| e.to_string())?,
            endpoint, bucket, access_key, secret_key, region,
        })
    }

    fn object_url(&self) -> String {
        format!("{}/{}/open-mcp-manager/profile.json", self.endpoint, self.bucket)
    }
}

impl SyncProvider for S3Provider {
    fn name(&self) -> &str { "S3-Compatible" }

    fn test_connection(&self) -> Result<bool, String> {
        let url = format!("{}/{}", self.endpoint, self.bucket);
        let resp = self.client.head(&url).send().map_err(|e| e.to_string())?;
        Ok(resp.status().is_success() || resp.status().as_u16() == 403)
    }

    fn push(&self, data: &[u8]) -> Result<(), String> {
        self.client.put(&self.object_url())
            .body(data.to_vec())
            .header("Content-Type", "application/json")
            .send()
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    fn pull(&self) -> Result<Vec<u8>, String> {
        let resp = self.client.get(&self.object_url()).send().map_err(|e| e.to_string())?;
        if !resp.status().is_success() {
            return Err(format!("S3 GET failed: {}", resp.status()));
        }
        resp.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string())
    }
}
