use crate::models::RegistryEntry;
use super::traits::RegistrySource;

pub struct GitHubIndexSource {
    client: reqwest::blocking::Client,
    url: String,
}

impl GitHubIndexSource {
    pub fn new(url: String) -> Self {
        Self {
            client: reqwest::blocking::Client::builder()
                .timeout(std::time::Duration::from_secs(10))
                .build()
                .expect("client"),
            url,
        }
    }
}

impl RegistrySource for GitHubIndexSource {
    fn search_blocking(&self, _query: &str) -> Result<Vec<RegistryEntry>, String> {
        Ok(vec![])
    }

    fn get_details_blocking(&self, _id: &str) -> Result<RegistryEntry, String> {
        Err("not implemented".to_string())
    }
}
