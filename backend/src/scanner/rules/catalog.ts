import { ScanRule } from './types';

export const SCANNER_VERSION = '1.0.0';
export const RULES_VERSION = '2024.1';

export const RULE_CATALOG: ScanRule[] = [
  // --- A. PUBLIC-KEY CRYPTOGRAPHY (SHOR-VULNERABLE) ---
  {
    id: 'PQC-PUB-RSA-KEYGEN',
    version: RULES_VERSION,
    title: 'RSA Key Pair Generation Detected',
    category: 'public-key',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    algorithmName: 'RSA',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Identified generation of RSA key pairs. Shor\'s algorithm computes prime factorization in polynomial time on a cryptanalytically relevant quantum computer (CRQC), breaking RSA security entirely regardless of key size.',
    quantumMigrationRelevance:
      'If RSA is used for key encapsulation or data encryption, recorded ciphertext is exposed to "Harvest Now, Decrypt Later" (HNDL) attacks. For digital signatures, quantum computers will enable retroactive or future forgery once large-scale quantum machines are realized.',
    conventionalSecurityRelevance:
      'RSA keys smaller than 2048 bits are considered conventionally weak today by NIST SP 800-131A. RSA 2048+ is conventionally secure against classical attackers, but lacks quantum resistance.',
    recommendedRemediation:
      'For key establishment / encryption, plan migration to ML-KEM (NIST FIPS 203) or deploy hybrid key exchange (e.g., X25519 + ML-KEM-768). For digital signatures, evaluate ML-DSA (NIST FIPS 204) or SLH-DSA (NIST FIPS 205).',
    referenceLinks: [
      { title: 'NIST FIPS 203: ML-KEM Standard', url: 'https://csrc.nist.gov/pubs/fips/203/final' },
      { title: 'NIST PQC Migration Guidelines', url: 'https://csrc.nist.gov/Projects/post-quantum-cryptography' },
      { title: 'NSA CNSA 2.0 Cybersecurity Advisory', url: 'https://media.defense.gov/2022/Sep/07/2003071852/-1/-1/0/CSA_CNSA_2.0_ALGORITHMS_.PDF' },
    ],
    fileExtensions: ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.py', '.java', '.go', '.rs', '.php', '.c', '.cpp', '.sh'],
    patterns: [
      { regex: /crypto\.generateKeyPair(?:Sync)?\s*\(\s*['"]rsa['"]/i, confidence: 'High' },
      { regex: /rsa\.generate_private_key\s*\(/i, confidence: 'High' },
      { regex: /RSA\.generate\s*\(\s*\d+/i, confidence: 'High' },
      { regex: /KeyPairGenerator\.getInstance\s*\(\s*["']RSA["']/i, confidence: 'High' },
      { regex: /rsa\.GenerateKey\s*\(/, confidence: 'High' },
      { regex: /openssl\s+genrsa\b/i, confidence: 'High' },
      { regex: /openssl_pkey_new\s*\(.*OPENSSL_KEYTYPE_RSA/i, confidence: 'High' },
      { regex: /new\s+RSACryptoServiceProvider\s*\(/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-PUB-RSA-CIPHER',
    version: RULES_VERSION,
    title: 'RSA Encryption / Padding Usage Detected',
    category: 'public-key',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    algorithmName: 'RSA-Encryption',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Detected direct RSA public key encryption, decryption, or padding schemes (e.g., RSA_PKCS1_OAEP_PADDING or PKCS1v1_5).',
    quantumMigrationRelevance:
      'Direct RSA encryption of secret keys or confidential payloads creates direct exposure to Harvest Now, Decrypt Later (HNDL) adversaries. Payloads stored encrypted under RSA can be decrypted when quantum hardware matures.',
    conventionalSecurityRelevance:
      'PKCS#1 v1.5 padding is vulnerable to Bleichenbacher padding oracle attacks. OAEP padding is recommended conventionally, but neither offers protection against Shor\'s algorithm.',
    recommendedRemediation:
      'Migrate to a Post-Quantum Key Encapsulation Mechanism such as ML-KEM-768 / ML-KEM-1024 (FIPS 203) combined with AES-256-GCM symmetric payload encryption.',
    referenceLinks: [
      { title: 'NIST FIPS 203 ML-KEM', url: 'https://csrc.nist.gov/pubs/fips/203/final' },
      { title: 'RFC 9180: Hybrid Public Key Encryption (HPKE)', url: 'https://datatracker.ietf.org/doc/html/rfc9180' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.php', '.cs'],
    patterns: [
      { regex: /crypto\.publicEncrypt\s*\(/i, confidence: 'High' },
      { regex: /crypto\.privateDecrypt\s*\(/i, confidence: 'High' },
      { regex: /RSA_PKCS1_OAEP_PADDING|RSA_PKCS1_PADDING/i, confidence: 'High' },
      { regex: /Cipher\.getInstance\s*\(\s*["']RSA\//i, confidence: 'High' },
      { regex: /padding\.OAEP\s*\(/i, confidence: 'High' },
      { regex: /rsa\.EncryptOAEP\s*\(/, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-PUB-ECC-ECDH',
    version: RULES_VERSION,
    title: 'Elliptic-Curve Diffie-Hellman (ECDH / X25519) Key Exchange Detected',
    category: 'public-key',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    algorithmName: 'ECDH / X25519',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Detected Elliptic-Curve Diffie-Hellman (ECDH, X25519, P-256 / secp256r1) key agreement in source code.',
    quantumMigrationRelevance:
      'Shor\'s discrete logarithm algorithm solves the elliptic curve discrete logarithm problem (ECDLP) in polynomial quantum time. Adversaries capturing encrypted network sessions today will be able to recover ephemeral ECDH shared secrets and decrypt all session traffic.',
    conventionalSecurityRelevance:
      'ECDH with Curve25519 or NIST P-256 provides excellent classical security (~128 bits) with small key sizes, but is completely broken by a quantum computer.',
    recommendedRemediation:
      'Upgrade key agreement to ML-KEM (FIPS 203) or a hybrid scheme combining X25519 with ML-KEM-768 (as implemented in modern TLS 1.3 draft and OpenSSL 3.4/BoringSSL).',
    referenceLinks: [
      { title: 'NIST FIPS 203: ML-KEM', url: 'https://csrc.nist.gov/pubs/fips/203/final' },
      { title: 'IETF Hybrid Key Exchange in TLS 1.3', url: 'https://datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design/' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.php', '.c', '.cpp'],
    patterns: [
      { regex: /crypto\.createECDH\s*\(\s*['"](?:secp256k1|prime256v1|secp256r1|secp384r1|curve25519|X25519)['"]/i, confidence: 'High' },
      { regex: /KeyAgreement\.getInstance\s*\(\s*["']ECDH["']/i, confidence: 'High' },
      { regex: /ecdh\.ECDH\s*\(/i, confidence: 'High' },
      { regex: /ecdh\.X25519\s*\(/i, confidence: 'High' },
      { regex: /curve25519\.X25519\s*\(/i, confidence: 'High' },
      { regex: /x25519\.X25519\s*\(/i, confidence: 'High' },
      { regex: /ec\.generate_private_key\s*\(\s*ec\.(?:SECP256R1|SECP384R1|SECP521R1|SECP256K1)/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-PUB-ECC-ECDSA',
    version: RULES_VERSION,
    title: 'Elliptic-Curve Digital Signature (ECDSA / EdDSA) Detected',
    category: 'public-key',
    defaultSeverity: 'Medium',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'future-forgeability',
    algorithmName: 'ECDSA / Ed25519',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Identified ECDSA or Ed25519/Ed448 digital signature generation or verification.',
    quantumMigrationRelevance:
      'Digital signatures protect authenticity and integrity. Because signatures do not encapsulate confidential session secrets, they are NOT subject to retrospective "Harvest Now, Decrypt Later" decryption. However, when a CRQC emerges, an attacker can extract private keys from published public keys and forge valid signatures.',
    conventionalSecurityRelevance:
      'ECDSA with secp256r1 or Ed25519 provides strong classical security. ECDSA requires deterministic nonce generation (RFC 6979) to avoid private key leakage from repeated nonces.',
    recommendedRemediation:
      'Plan transition to ML-DSA (NIST FIPS 204) for general application signatures, or SLH-DSA (NIST FIPS 205) for long-term critical root keys and firmware authentication.',
    referenceLinks: [
      { title: 'NIST FIPS 204: ML-DSA Standard', url: 'https://csrc.nist.gov/pubs/fips/204/final' },
      { title: 'NIST FIPS 205: SLH-DSA Standard', url: 'https://csrc.nist.gov/pubs/fips/205/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.php', '.c', '.cpp'],
    patterns: [
      { regex: /crypto\.createSign\s*\(\s*['"](?:SHA256|SHA384|SHA512)['"]\s*\).*?(?:sign|update)/i, confidence: 'Medium' },
      { regex: /Signature\.getInstance\s*\(\s*["'](?:SHA256withECDSA|SHA384withECDSA|SHA512withECDSA|NONEwithECDSA|Ed25519)["']/i, confidence: 'High' },
      { regex: /ecdsa\.sign\s*\(/i, confidence: 'High' },
      { regex: /ecdsa\.SignASN1\s*\(/i, confidence: 'High' },
      { regex: /ed25519\.Sign\s*\(/i, confidence: 'High' },
      { regex: /algorithm\s*:\s*['"](?:ES256|ES384|ES512|EdDSA)['"]/i, confidence: 'High' },
      { regex: /jsonwebtoken.*?(?:ES256|ES384|ES512)/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-PUB-DH-KEYEX',
    version: RULES_VERSION,
    title: 'Finite Field Diffie-Hellman (FFDHE) Key Exchange Detected',
    category: 'public-key',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    algorithmName: 'Diffie-Hellman',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Identified traditional finite-field Diffie-Hellman key exchange parameters or execution.',
    quantumMigrationRelevance:
      'Finite field discrete logarithms are vulnerable to Shor\'s quantum algorithm. Long-term recorded sessions negotiated with classical Diffie-Hellman are vulnerable to HNDL exposure.',
    conventionalSecurityRelevance:
      'Diffie-Hellman parameters below 2048 bits (e.g., Logjam attack) are susceptible to classical precomputation attacks. 2048+ bit FFDHE is computationally heavy compared to modern primitives.',
    recommendedRemediation:
      'Replace classical FFDHE with ML-KEM (FIPS 203) or hybrid post-quantum key exchange.',
    referenceLinks: [
      { title: 'NIST FIPS 203 ML-KEM', url: 'https://csrc.nist.gov/pubs/fips/203/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.c', '.cpp'],
    patterns: [
      { regex: /crypto\.createDiffieHellman\s*\(/i, confidence: 'High' },
      { regex: /crypto\.createDiffieHellmanGroup\s*\(/i, confidence: 'High' },
      { regex: /DHParameterSpec\b/i, confidence: 'High' },
      { regex: /KeyAgreement\.getInstance\s*\(\s*["']DH["']\s*\)/i, confidence: 'High' },
      { regex: /dh\.generate_parameters\s*\(/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-PUB-DSA-SIGN',
    version: RULES_VERSION,
    title: 'Digital Signature Algorithm (DSA) Usage Detected',
    category: 'public-key',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'future-forgeability',
    algorithmName: 'DSA',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Identified classical Digital Signature Algorithm (DSA) key generation or verification.',
    quantumMigrationRelevance:
      'DSA is completely broken by Shor\'s algorithm on a quantum computer.',
    conventionalSecurityRelevance:
      'DSA is formally deprecated in NIST SP 800-131A Rev 2 and FIPS 186-5 for digital signature generation. It should be removed regardless of quantum considerations.',
    recommendedRemediation:
      'Decommission DSA immediately. For classical transition, use ECDSA/Ed25519; for post-quantum compliance, adopt ML-DSA (NIST FIPS 204).',
    referenceLinks: [
      { title: 'NIST FIPS 186-5 Digital Signature Standard', url: 'https://csrc.nist.gov/pubs/fips/186-5/final' },
      { title: 'NIST FIPS 204 ML-DSA', url: 'https://csrc.nist.gov/pubs/fips/204/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.c', '.sh'],
    patterns: [
      { regex: /crypto\.generateKeyPair(?:Sync)?\s*\(\s*['"]dsa['"]/i, confidence: 'High' },
      { regex: /KeyPairGenerator\.getInstance\s*\(\s*["']DSA["']/i, confidence: 'High' },
      { regex: /dsa\.generate_private_key\s*\(/i, confidence: 'High' },
      { regex: /openssl\s+dsaparam\b/i, confidence: 'High' },
      { regex: /openssl\s+gendsa\b/i, confidence: 'High' },
    ],
  },

  // --- B. CRYPTOGRAPHIC LIBRARIES & APIS ---
  {
    id: 'PQC-LIB-JWT-ALGO',
    version: RULES_VERSION,
    title: 'Asymmetric JWT Algorithm Selection Detected',
    category: 'cryptographic-api',
    defaultSeverity: 'Medium',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'future-forgeability',
    algorithmName: 'JWT-Asymmetric',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'JSON Web Token (JWT) signing or verification configured with asymmetric algorithms (RS256, RS384, RS512, ES256, ES384, ES512, PS256).',
    quantumMigrationRelevance:
      'Short-lived session JWTs have minimal retroactive quantum exposure, but long-lived API tokens or persistent credentials signed with RSA/ECDSA can be forged by a future quantum attacker who factors the signing key.',
    conventionalSecurityRelevance:
      'Verify that verification logic explicitly verifies the `alg` header to protect against algorithm confusion attacks (e.g. none or HMAC substitution).',
    recommendedRemediation:
      'Ensure token lifetimes are kept short (minutes). As IETF JOSE drafts for ML-DSA standardize (e.g. draft-ietf-cose-post-quantum-signatures), prepare identity providers for crypto-agility.',
    referenceLinks: [
      { title: 'IETF Post-Quantum Signatures in JOSE', url: 'https://datatracker.ietf.org/doc/draft-ietf-jose-pqc/' },
      { title: 'NIST FIPS 204 ML-DSA', url: 'https://csrc.nist.gov/pubs/fips/204/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.json', '.env', '.yaml', '.yml'],
    patterns: [
      { regex: /algorithm(?:s)?\s*[:=]\s*\[?\s*['"](?:RS256|RS384|RS512|ES256|ES384|ES512|PS256|PS384|PS512)['"]/i, confidence: 'High' },
      { regex: /jwt\.sign\s*\([^)]*algorithm\s*:\s*['"](?:RS256|ES256|PS256)['"]/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-LIB-NODE-CRYPTO',
    version: RULES_VERSION,
    title: 'Node.js Native Crypto Module Usage',
    category: 'cryptographic-api',
    defaultSeverity: 'Informational',
    defaultConfidence: 'Medium',
    classification: 'Potential cryptographic usage',
    quantumImpactType: 'crypto-agility',
    algorithmName: 'Node.js Crypto',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Usage of Node.js `node:crypto` built-in module. Verify whether asymmetric key generation, public encryption, or key exchange functions are in active use.',
    quantumMigrationRelevance:
      'Node.js delegates cryptographic routines to OpenSSL. As OpenSSL 3.4+ integrates ML-KEM and ML-DSA, tracking where native crypto APIs are invoked aids post-quantum migration planning.',
    conventionalSecurityRelevance:
      'Node.js crypto is officially supported and maintained.',
    recommendedRemediation:
      'Audit crypto calls to identify whether asymmetric primitives (RSA, ECDH) are used, and ensure cryptographic agility through abstracted wrappers.',
    referenceLinks: [
      { title: 'Node.js Crypto Documentation', url: 'https://nodejs.org/api/crypto.html' },
    ],
    fileExtensions: ['.js', '.ts', '.mjs', '.cjs'],
    patterns: [
      { regex: /require\s*\(\s*['"](?:node:)?crypto['"]\s*\)/, confidence: 'High' },
      { regex: /import\s+.*?\s+from\s+['"](?:node:)?crypto['"]/, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-LIB-PY-CRYPTOGRAPHY',
    version: RULES_VERSION,
    title: 'Python Cryptography Hazard / Asymmetric Primitives Imported',
    category: 'cryptographic-api',
    defaultSeverity: 'Medium',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'crypto-agility',
    algorithmName: 'Python-Hazmat-Asymmetric',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Imported Python `cryptography.hazmat.primitives.asymmetric` modules (rsa, ec, dsa, dh, x25519, ed25519).',
    quantumMigrationRelevance:
      'Direct use of Python hazmat asymmetric modules locks applications into classical public key algorithms. Tracking these call sites is necessary for PQC migration.',
    conventionalSecurityRelevance:
      'The Python `cryptography` package is the gold standard for Python security, but callers must manage algorithm lifecycles responsibly.',
    recommendedRemediation:
      'Encapsulate asymmetric cryptography behind domain-specific interfaces to enable drop-in PQC replacement once liboqs-python or standard library bindings stabilize.',
    referenceLinks: [
      { title: 'Python Cryptography Documentation', url: 'https://cryptography.io/' },
    ],
    fileExtensions: ['.py'],
    patterns: [
      { regex: /from\s+cryptography\.hazmat\.primitives\.asymmetric\s+import\s+(?:rsa|ec|dsa|dh|x25519|ed25519)/i, confidence: 'High' },
      { regex: /from\s+Crypto\.PublicKey\s+import\s+(?:RSA|ECC|DSA)/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-LIB-JAVA-SECURITY',
    version: RULES_VERSION,
    title: 'Java Security JCA / BouncyCastle Cryptographic Provider Usage',
    category: 'cryptographic-api',
    defaultSeverity: 'Informational',
    defaultConfidence: 'Medium',
    classification: 'Potential cryptographic usage',
    quantumImpactType: 'crypto-agility',
    algorithmName: 'Java-JCA',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Detected Java Cryptography Architecture (JCA) or Bouncy Castle provider references.',
    quantumMigrationRelevance:
      'Java 24+ and recent Bouncy Castle releases (1.78+) include implementations of ML-KEM and ML-DSA. Centralized JCA provider registration makes PQC migration relatively structured.',
    conventionalSecurityRelevance:
      'Ensure BouncyCastle version is kept up to date to avoid known timing or side-channel vulnerabilities.',
    recommendedRemediation:
      'Update Bouncy Castle to version >= 1.78 to enable NIST FIPS 203 (ML-KEM) and FIPS 204 (ML-DSA) algorithm providers.',
    referenceLinks: [
      { title: 'Bouncy Castle Post-Quantum Documentation', url: 'https://www.bouncycastle.org/documentation.html' },
    ],
    fileExtensions: ['.java', '.kt', '.scala', '.groovy'],
    patterns: [
      { regex: /import\s+org\.bouncycastle\.pqc\b/i, confidence: 'High' },
      { regex: /import\s+java\.security\.KeyPairGenerator\b/i, confidence: 'Medium' },
      { regex: /import\s+javax\.crypto\.KeyAgreement\b/i, confidence: 'Medium' },
    ],
  },

  // --- C. PROTOCOL, CONFIGURATION & WEAK/LEGACY ALGORITHMS ---
  {
    id: 'PQC-CFG-TLS-CIPHER',
    version: RULES_VERSION,
    title: 'TLS Cipher Suite Configuration Without Post-Quantum Key Exchange',
    category: 'protocol-config',
    defaultSeverity: 'Medium',
    defaultConfidence: 'Medium',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    algorithmName: 'TLS-Cipher-Suite',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'Configuration specifies classical TLS cipher suites (e.g. ECDHE-RSA-AES128-GCM-SHA256, ECDHE-ECDSA-AES256-GCM-SHA384) without hybrid post-quantum key exchange enabled.',
    quantumMigrationRelevance:
      'TLS connections without hybrid post-quantum key exchange (such as X25519MLKEM768) are vulnerable to passive eavesdropping and recording for future decryption.',
    conventionalSecurityRelevance:
      'Modern TLS 1.3 with AEAD ciphers (AES-GCM, CHACHA20-POLY1305) is conventionally secure.',
    recommendedRemediation:
      'Enable TLS 1.3 and configure hybrid post-quantum key exchange groups (e.g., X25519MLKEM768 or X25519Kyber768Draft00) on reverse proxies and servers (e.g., NGINX with OpenSSL 3.4 or Cloudflare/AWS PQC endpoints).',
    referenceLinks: [
      { title: 'Cloudflare Post-Quantum Cryptography Support', url: 'https://blog.cloudflare.com/post-quantum-to-all/' },
      { title: 'IETF TLS 1.3 Post-Quantum Key Exchange', url: 'https://datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design/' },
    ],
    fileExtensions: ['.conf', '.json', '.yaml', '.yml', '.js', '.ts', '.py', '.toml'],
    patterns: [
      { regex: /cipher(?:s)?\s*[:=]\s*['"].*?(?:ECDHE-RSA|ECDHE-ECDSA|DHE-RSA).*?['"]/i, confidence: 'High' },
      { regex: /ssl_ciphers\s+['"]?[^;]+['"]?;/i, confidence: 'Medium' },
    ],
  },
  {
    id: 'PQC-CFG-SSH-KEX',
    version: RULES_VERSION,
    title: 'SSH Key Exchange Configuration Without PQC Hybrid',
    category: 'protocol-config',
    defaultSeverity: 'Low',
    defaultConfidence: 'Medium',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    algorithmName: 'SSH-KEX',
    algorithmCategory: 'asymmetric',
    quantumStatus: 'vulnerable-shor',
    description:
      'SSH configuration (`sshd_config` or client config) specifies classical key exchange algorithms (e.g. curve25519-sha256, diffie-hellman-group14-sha256).',
    quantumMigrationRelevance:
      'SSH sessions carrying confidential files or commands can be recorded and cracked by a future CRQC if classical KEX algorithms are exclusively used.',
    conventionalSecurityRelevance:
      'curve25519-sha256 is strong conventionally.',
    recommendedRemediation:
      'OpenSSH 9.0+ defaults to `sntrup761x25519-sha512@openssh.com` hybrid KEX, and OpenSSH 9.9+ introduces `mlkem768x25519-sha512`. Verify server configuration allows hybrid post-quantum algorithms in `KexAlgorithms`.',
    referenceLinks: [
      { title: 'OpenSSH Release Notes and PQC KEX', url: 'https://www.openssh.com/releasenotes.html' },
    ],
    filePatterns: [/sshd?_config$/i, /\.ssh\/config$/i],
    patterns: [
      { regex: /KexAlgorithms\s+(?:[^\n#]+)/i, confidence: 'Medium' },
    ],
  },
  {
    id: 'PQC-LEGACY-BROKEN-CIPHER',
    version: RULES_VERSION,
    title: 'Conventional Insecure / Broken Cryptographic Algorithm Detected',
    category: 'weak-legacy',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    algorithmName: 'DES / 3DES / RC4 / MD5 / SHA-1',
    algorithmCategory: 'legacy-weak',
    quantumStatus: 'legacy-insecure',
    description:
      'Detected legacy or broken cryptographic algorithm (DES, 3DES/TripleDES, RC4/ARC4, MD5, or SHA-1). This is a classical vulnerability distinct from post-quantum migration concerns.',
    quantumMigrationRelevance:
      'These algorithms are already broken by classical attacks and lack both conventional and quantum security. Their presence demonstrates technical debt that must be addressed prior to or alongside post-quantum migration.',
    conventionalSecurityRelevance:
      'MD5 and SHA-1 suffer from practical collision attacks. DES and 3DES have insufficient key lengths (56-bit effective, Sweet32 birthday attacks). RC4 is vulnerable to keystream biases.',
    recommendedRemediation:
      'For hashing, use SHA-256, SHA-384, SHA-512, or SHA-3. For symmetric encryption, use AES-256-GCM or ChaCha20-Poly1305. For password storage, use Argon2id or bcrypt.',
    referenceLinks: [
      { title: 'NIST SP 800-131A Rev. 2: Transitioning Cryptographic Algorithms', url: 'https://csrc.nist.gov/pubs/sp/800/131/a/r2/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.php', '.c', '.cpp', '.cs'],
    patterns: [
      { regex: /crypto\.createCipheriv?\s*\(\s*['"](?:des|des3|des-ede3|rc4|blowfish|arcfour)/i, confidence: 'High' },
      { regex: /crypto\.createHash\s*\(\s*['"](?:md5|sha1)['"]/i, confidence: 'High' },
      { regex: /hashlib\.(?:md5|sha1)\s*\(/i, confidence: 'High' },
      { regex: /MessageDigest\.getInstance\s*\(\s*["'](?:MD5|SHA-1|SHA1)["']/i, confidence: 'High' },
      { regex: /Cipher\.getInstance\s*\(\s*["'](?:DES|DESede|RC4|Blowfish)/i, confidence: 'High' },
      { regex: /md5\.New\s*\(\)|sha1\.New\s*\(\)/, confidence: 'High' },
    ],
  },

  // --- D. POST-QUANTUM CRYPTOGRAPHY STANDARDS & HYBRID INDICATORS ---
  {
    id: 'PQC-ALG-MLKEM-FIPS203',
    version: RULES_VERSION,
    title: 'Post-Quantum Key Encapsulation (ML-KEM / FIPS 203) Indicator Detected',
    category: 'pqc-implementation',
    defaultSeverity: 'Informational',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'quantum-resistant',
    algorithmName: 'ML-KEM (FIPS 203)',
    algorithmCategory: 'post-quantum',
    quantumStatus: 'quantum-resistant',
    description:
      'Detected implementation or usage of Module-Lattice-Based Key-Encapsulation Mechanism (ML-KEM), standardized by NIST in FIPS 203 (derived from CRYSTALS-Kyber).',
    quantumMigrationRelevance:
      'POSITIVE PQC READINESS: ML-KEM is the primary NIST-standardized post-quantum key encapsulation algorithm, designed to provide quantum-resistant confidentiality against Shor\'s algorithm.',
    conventionalSecurityRelevance:
      'Provides both strong classical and post-quantum security based on the hardness of the Module Learning with Errors (M-LWE) lattice problem.',
    recommendedRemediation:
      'Verified positive adoption. Ensure implementation conforms to final NIST FIPS 203 parameters (ML-KEM-512 for security category 1, ML-KEM-768 for category 3, ML-KEM-1024 for category 5).',
    referenceLinks: [
      { title: 'NIST FIPS 203: ML-KEM Specification', url: 'https://csrc.nist.gov/pubs/fips/203/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.json', '.toml'],
    patterns: [
      { regex: /\b(?:ML-KEM-512|ML-KEM-768|ML-KEM-1024|mlkem512|mlkem768|mlkem1024)\b/i, confidence: 'High' },
      { regex: /\b(?:CRYSTALS-Kyber|kyber512|kyber768|kyber1024)\b/i, confidence: 'High' },
      { regex: /MLKEM(?:768|1024|512)KeyPair/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-ALG-MLDSA-FIPS204',
    version: RULES_VERSION,
    title: 'Post-Quantum Digital Signature (ML-DSA / FIPS 204) Indicator Detected',
    category: 'pqc-implementation',
    defaultSeverity: 'Informational',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'quantum-resistant',
    algorithmName: 'ML-DSA (FIPS 204)',
    algorithmCategory: 'post-quantum',
    quantumStatus: 'quantum-resistant',
    description:
      'Detected implementation or configuration of Module-Lattice-Based Digital Signature Algorithm (ML-DSA), standardized by NIST in FIPS 204 (derived from CRYSTALS-Dilithium).',
    quantumMigrationRelevance:
      'POSITIVE PQC READINESS: ML-DSA is NIST\'s primary post-quantum digital signature standard, safeguarding against quantum signature forgery.',
    conventionalSecurityRelevance:
      'Based on the Module Short Integer Solution (M-SIS) and M-LWE lattice problems, resistant to both classical and quantum cryptanalysis.',
    recommendedRemediation:
      'Verified positive adoption. Ensure parameters match NIST FIPS 204: ML-DSA-44 (category 2), ML-DSA-65 (category 3), or ML-DSA-87 (category 5).',
    referenceLinks: [
      { title: 'NIST FIPS 204: ML-DSA Specification', url: 'https://csrc.nist.gov/pubs/fips/204/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.json', '.toml'],
    patterns: [
      { regex: /\b(?:ML-DSA-44|ML-DSA-65|ML-DSA-87|mldsa44|mldsa65|mldsa87)\b/i, confidence: 'High' },
      { regex: /\b(?:CRYSTALS-Dilithium|dilithium2|dilithium3|dilithium5)\b/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-ALG-SLHDSA-FIPS205',
    version: RULES_VERSION,
    title: 'Stateless Hash-Based Digital Signature (SLH-DSA / FIPS 205) Detected',
    category: 'pqc-implementation',
    defaultSeverity: 'Informational',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'quantum-resistant',
    algorithmName: 'SLH-DSA (FIPS 205)',
    algorithmCategory: 'post-quantum',
    quantumStatus: 'quantum-resistant',
    description:
      'Detected Stateless Hash-Based Digital Signature Algorithm (SLH-DSA), standardized in FIPS 205 (derived from SPHINCS+).',
    quantumMigrationRelevance:
      'POSITIVE PQC READINESS: SLH-DSA relies solely on the security properties of hash functions (SHA-2 / SHAKE), providing a mathematical fallback should unforeseen lattice vulnerabilities arise.',
    conventionalSecurityRelevance:
      'Highly conservative security assumptions. Signature sizes are larger than ML-DSA, making it well-suited for code signing, firmware verification, and root certificates.',
    recommendedRemediation:
      'Verified positive adoption. Use SLH-DSA for high-security long-lived digital signature infrastructure.',
    referenceLinks: [
      { title: 'NIST FIPS 205: SLH-DSA Specification', url: 'https://csrc.nist.gov/pubs/fips/205/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.json', '.toml'],
    patterns: [
      { regex: /\b(?:SLH-DSA|slh_dsa|slhdsa)\b/i, confidence: 'High' },
      { regex: /\b(?:SPHINCS\+|sphincsplus)\b/i, confidence: 'High' },
    ],
  },
  {
    id: 'PQC-HYBRID-KEX',
    version: RULES_VERSION,
    title: 'Hybrid Classical + Post-Quantum Key Exchange Detected',
    category: 'pqc-implementation',
    defaultSeverity: 'Informational',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'quantum-resistant',
    algorithmName: 'Hybrid X25519+ML-KEM',
    algorithmCategory: 'hybrid',
    quantumStatus: 'quantum-resistant',
    description:
      'Detected hybrid key exchange configuration combining classical elliptic-curve Diffie-Hellman with post-quantum key encapsulation (e.g., X25519MLKEM768 or X25519Kyber768Draft00).',
    quantumMigrationRelevance:
      'POSITIVE PQC READINESS: Hybrid key exchange provides defense-in-depth: security holds as long as EITHER the classical curve OR the post-quantum lattice algorithm remains unbroken.',
    conventionalSecurityRelevance:
      'Recommended transition architecture by NIST, BSI, ANSSI, and major industry vendors (Google, Cloudflare, Apple).',
    recommendedRemediation:
      'Maintain hybrid configuration while transitioning full production infrastructure towards standard FIPS 203 implementations.',
    referenceLinks: [
      { title: 'NIST PQC FAQ on Hybrid Schemes', url: 'https://csrc.nist.gov/Projects/post-quantum-cryptography/faqs' },
      { title: 'IETF Hybrid Key Exchange in TLS 1.3', url: 'https://datatracker.ietf.org/doc/draft-ietf-tls-hybrid-design/' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.conf', '.json'],
    patterns: [
      { regex: /\b(?:X25519MLKEM768|X25519Kyber768Draft00|SecP256r1MLKEM768|sntrup761x25519)\b/i, confidence: 'High' },
      { regex: /hybrid.*?(?:kyber|mlkem|pqc)/i, confidence: 'Medium' },
      { regex: /liboqs|open-quantum-safe/i, confidence: 'High' },
    ],
  },
];
