use crate::models::RegistryEntry;
use super::traits::RegistrySource;

pub struct NpmSource {
    client: reqwest::blocking::Client,
}

impl NpmSource {
    pub fn new() -> Self {
        Self {
            client: reqwest::blocking::Client::builder()
                .timeout(std::time::Duration::from_secs(10))
                .build()
                .expect("client"),
        }
    }
}

impl RegistrySource for NpmSource {
    fn search_blocking(&self, _query: &str) -> Result<Vec<RegistryEntry>, String> {
        Ok(vec![])
    }

    fn get_details_blocking(&self, _id: &str) -> Result<RegistryEntry, String> {
        Err("not implemented".to_string())
    }
}
