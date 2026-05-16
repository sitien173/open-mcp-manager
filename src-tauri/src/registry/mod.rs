pub mod traits;
pub mod smithery;
pub mod npm;
pub mod github_index;
pub mod pypi;

use crate::models::RegistryEntry;

pub struct RegistryManager;

impl RegistryManager {
    pub fn new() -> Self { Self }
    pub fn search_blocking(&self, _query: &str) -> Result<Vec<RegistryEntry>, String> { Ok(vec![]) }
    pub fn get_details_blocking(&self, _id: &str) -> Result<RegistryEntry, String> { Err("server details not found".to_string()) }
}
