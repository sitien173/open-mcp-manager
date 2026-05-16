use open_mcp_manager::vault::{decrypt, encrypt};

#[test]
fn dpapi_round_trip() {
    let data = b"hello world";
    let enc = encrypt(data).unwrap();
    let dec = decrypt(&enc).unwrap();
    assert_eq!(dec, data);
}

#[test]
fn dpapi_various_lengths() {
    let cases = vec![vec![], vec![42], vec![7; 1024], vec![9; 10 * 1024]];
    for case in cases {
        let enc = encrypt(&case).unwrap();
        let dec = decrypt(&enc).unwrap();
        assert_eq!(dec, case);
    }
}

#[test]
fn encrypted_not_plaintext() {
    let data = b"same";
    let enc = encrypt(data).unwrap();
    assert_ne!(enc, data);
}

#[test]
fn encrypt_same_data_twice_differs() {
    let data = b"repeat me";
    let a = encrypt(data).unwrap();
    let b = encrypt(data).unwrap();
    assert_ne!(a, b);
}

#[test]
fn decrypt_garbage_fails() {
    let bad = vec![1_u8, 2, 3, 4, 5, 6, 7, 8];
    assert!(decrypt(&bad).is_err());
}
