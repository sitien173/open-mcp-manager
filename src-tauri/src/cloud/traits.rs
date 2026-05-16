pub trait SyncProvider: Send + Sync {
    fn name(&self) -> &str;
    fn test_connection(&self) -> Result<bool, String>;
    fn push(&self, data: &[u8]) -> Result<(), String>;
    fn pull(&self) -> Result<Vec<u8>, String>;
}
