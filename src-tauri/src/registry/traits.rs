use crate::models::RegistryEntry;

pub trait RegistrySource: Send + Sync {
    fn search_blocking(&self, query: &str) -> Result<Vec<RegistryEntry>, String>;
    fn get_details_blocking(&self, id: &str) -> Result<RegistryEntry, String>;
}
