use std::io::Read;

#[tauri::command]
pub fn install_dxt(path: String) -> Result<(), String> {
    let file = std::fs::File::open(path).map_err(|_| "failed to open dxt file".to_string())?;
    let mut zip = zip::ZipArchive::new(file).map_err(|_| "invalid dxt zip".to_string())?;
    let mut manifest = zip.by_name("manifest.json").map_err(|_| "manifest.json missing".to_string())?;
    let mut buf = String::new();
    manifest.read_to_string(&mut buf).map_err(|_| "failed to read manifest".to_string())?;
    let _: serde_json::Value = serde_json::from_str(&buf).map_err(|_| "invalid manifest json".to_string())?;
    Ok(())
}
