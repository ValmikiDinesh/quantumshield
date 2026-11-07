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
      'Detected direct RSA public key encryption, decryption, or padding schemes (e.g., OAEP or PKCS#1 v1.5 padding schemes).',
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
      { regex: new RegExp(['RSA', 'PKCS1', 'OAEP_PADDING'].join('_') + '|' + ['RSA', 'PKCS1', 'PADDING'].join('_'), 'i'), confidence: 'High' },
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
      { regex: new RegExp(['json', 'webtoken'].join('') + '.*?(?:ES256|ES384|ES512)', 'i'), confidence: 'High' },
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
      { regex: new RegExp(['DH', 'Parameter', 'Spec'].join('') + '\\b', 'i'), confidence: 'High' },
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

  // =========================================================================
  // --- B. PRESENT-DAY THREAT DEFENSE: HARDCODED SECRETS & CREDENTIALS ---
  // =========================================================================
  {
    id: 'SEC-AWS-KEY',
    version: RULES_VERSION,
    title: 'Hardcoded AWS Access Key ID Detected',
    category: 'hardcoded-secret',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified an active or hardcoded Amazon Web Services (AWS) Access Key ID. Hardcoded AWS credentials in source repositories are rapidly harvested by automated botnets to hijack cloud resources, spin up unauthorized instances, or access private cloud data.',
    quantumMigrationRelevance:
      'Compromised IAM credentials allow adversaries immediate administrative exfiltration of stored historical ciphertexts, bypassing transit encryption defenses entirely.',
    conventionalSecurityRelevance:
      'CRITICAL BREACH RISK: AWS keys grant programmatic access to cloud infrastructure. Exposure violates SOC 2 CC6.1, ISO 27001 A.9.4, and CIS AWS Foundations Benchmark.',
    recommendedRemediation:
      '1. Immediately revoke this key in AWS IAM and generate a new key pair.\n2. Move credentials to environment variables or AWS Secrets Manager / Parameter Store.\n3. Utilize IAM Roles with short-lived STS tokens instead of static access keys.',
    compliance: {
      soc2: ['CC6.1', 'CC6.6'],
      iso27001: ['A.9.4.2', 'A.10.1.1'],
      pciDss: ['Req 8.2', 'Req 8.3'],
      nist: ['SP 800-53 IA-5'],
    },
    referenceLinks: [
      { title: 'AWS Best Practices for Managing Access Keys', url: 'https://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html' },
      { title: 'CIS AWS Foundations Benchmark', url: 'https://www.cisecurity.org/benchmark/amazon_web_services' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.json', '.env', '.yml', '.yaml', '.properties', '.sh', '.xml'],
    patterns: [
      { regex: /\b(AKIA[0-9A-Z]{16})\b/, confidence: 'High' },
    ],
    negativePatterns: [
      /AKIAIOSFODNN7EXAMPLE/, // Standard AWS mock key in documentation
    ],
  },
  {
    id: 'SEC-RAZORPAY-KEY',
    version: RULES_VERSION,
    title: 'Hardcoded Razorpay Live Key / Secret Detected',
    category: 'hardcoded-secret',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected live Razorpay API Key ID or Key Secret in source code or configuration files. Hardcoded payment gateway secrets allow attackers to forge orders, inspect customer transaction histories, or issue unauthorized refunds.',
    quantumMigrationRelevance:
      'Payment gateway credentials must be protected against both immediate exfiltration and long-term storage breaches.',
    conventionalSecurityRelevance:
      'CRITICAL FINANCIAL RISK: Direct violation of PCI-DSS v4.0 Requirement 8 and RBI Guidelines on Payment Aggregators.',
    recommendedRemediation:
      '1. Rotate the exposed key in the Razorpay Dashboard under Settings -> API Keys.\n2. Store live keys in secure backend environment files (.env) and never expose KEY_SECRET to frontend code or source control.',
    compliance: {
      pciDss: ['Req 3.4', 'Req 8.2', 'Req 8.3'],
      soc2: ['CC6.1'],
      dpdpAct: ['Section 8(5)'],
    },
    referenceLinks: [
      { title: 'Razorpay API Key Management Guide', url: 'https://razorpay.com/docs/payments/api-keys/' },
      { title: 'PCI-DSS v4.0 Official Standard', url: 'https://www.pcisecuritystandards.org/' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php', '.env', '.json', '.yaml', '.yml'],
    patterns: [
      { regex: /\b(rzp_live_[a-zA-Z0-9]{14})\b/, confidence: 'High' },
      { regex: /razorpay.*?secret\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i, confidence: 'High' },
    ],
  },
  {
    id: 'SEC-STRIPE-KEY',
    version: RULES_VERSION,
    title: 'Hardcoded Stripe Live Secret Key Detected',
    category: 'hardcoded-secret',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified a hardcoded live Stripe Secret Key or Restricted Key. Exposure of secret keys gives attackers full administrative access to your Stripe account, customer card tokens, and bank payouts.',
    quantumMigrationRelevance:
      'Secret payment keys represent primary targets for adversaries seeking financial account takeovers.',
    conventionalSecurityRelevance:
      'CRITICAL: Immediate violation of PCI-DSS Requirement 3.4 and 8.2. Attackers can execute charges, access PII, or drain accounts.',
    recommendedRemediation:
      '1. Immediately roll the secret key in the Stripe Dashboard (Developers -> API Keys).\n2. Load keys dynamically via environment variables on the server side only.',
    compliance: {
      pciDss: ['Req 3.4', 'Req 8.2'],
      soc2: ['CC6.1', 'CC6.6'],
    },
    referenceLinks: [
      { title: 'Stripe Security: Keeping Your Keys Safe', url: 'https://stripe.com/docs/keys' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php', '.env', '.json', '.yaml', '.yml'],
    patterns: [
      { regex: /\b((?:sk|rk)_live_[0-9a-zA-Z]{24,})\b/, confidence: 'High' },
    ],
  },
  {
    id: 'SEC-GITHUB-TOKEN',
    version: RULES_VERSION,
    title: 'Hardcoded GitHub Personal Access Token Detected',
    category: 'hardcoded-secret',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified a GitHub Personal Access Token (PAT) or OAuth token committed to code. Leaked tokens allow adversaries to clone private repositories, inject malicious commits, or access organization CI/CD pipelines.',
    quantumMigrationRelevance:
      'Source code repository compromise allows adversaries to inspect all cryptographic architectures and private keys.',
    conventionalSecurityRelevance:
      'HIGH RISK: Violates SOC 2 CC6.6 (Code integrity and developer access controls).',
    recommendedRemediation:
      '1. Revoke the token immediately in GitHub Settings -> Developer settings -> Personal access tokens.\n2. Use fine-grained, short-lived tokens and store them in GitHub Secrets or secure vault solutions.',
    compliance: {
      soc2: ['CC6.6'],
      iso27001: ['A.9.4.2'],
    },
    referenceLinks: [
      { title: 'GitHub Token Security Best Practices', url: 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.sh', '.env', '.json', '.yml', '.yaml'],
    patterns: [
      { regex: /\b(ghp_[a-zA-Z0-9]{36})\b/, confidence: 'High' },
      { regex: /\b(github_pat_[a-zA-Z0-9_]{82})\b/, confidence: 'High' },
    ],
  },
  {
    id: 'SEC-GOOGLE-KEY',
    version: RULES_VERSION,
    title: 'Hardcoded Google Cloud / Maps API Key Detected',
    category: 'hardcoded-secret',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified a Google Cloud or Google Maps API key in source files. Unrestricted API keys can be abused to consume paid Google Cloud services, geocoding credits, or access unauthorized GCP APIs.',
    quantumMigrationRelevance:
      'Cloud platform API keys should be restricted by IP or HTTP referrer to prevent unauthorized exfiltration.',
    conventionalSecurityRelevance:
      'Violates CIS GCP Foundations Benchmark and SOC 2 CC6.1.',
    recommendedRemediation:
      '1. Apply API restrictions and application restrictions (HTTP referrers / IP addresses) in Google Cloud Console.\n2. Store backend GCP credentials in environment variables.',
    compliance: {
      soc2: ['CC6.1'],
      iso27001: ['A.9.4.2'],
    },
    referenceLinks: [
      { title: 'Google Cloud Best Practices for API Key Security', url: 'https://cloud.google.com/docs/authentication/api-keys' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.html', '.env', '.json'],
    patterns: [
      { regex: /\b(AIza[0-9A-Za-z\-_]{35})\b/, confidence: 'High' },
    ],
  },
  {
    id: 'SEC-PRIVATE-KEY-FILE',
    version: RULES_VERSION,
    title: 'Hardcoded Cryptographic Private Key Block Detected',
    category: 'hardcoded-secret',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    description:
      'Detected plaintext RSA, OpenSSH, EC, or DSA private key block directly embedded in source code or committed key files. Anyone with repository read access can decrypt historical communications or impersonate your servers.',
    quantumMigrationRelevance:
      'Exposed asymmetric private keys completely nullify any encryption protections, enabling immediate decryption of all stored ciphertexts.',
    conventionalSecurityRelevance:
      'CRITICAL: Catastrophic cryptographic compromise. Violates PCI-DSS Req 3.5, ISO 27001 A.10.1, and SOC 2 CC6.1.',
    recommendedRemediation:
      '1. Treat the key as compromised; generate a brand new key pair and revoke the associated public certificate.\n2. Load private keys exclusively from an encrypted secrets store (AWS KMS, HashiCorp Vault) or filesystem paths with 0600 permissions.',
    compliance: {
      iso27001: ['A.10.1.2'],
      pciDss: ['Req 3.5', 'Req 3.6'],
      soc2: ['CC6.1', 'CC6.7'],
      nist: ['SP 800-57 Key Management'],
    },
    referenceLinks: [
      { title: 'NIST SP 800-57: Recommendation for Key Management', url: 'https://csrc.nist.gov/pubs/sp/800/57/pt1/r5/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.pem', '.key', '.pkcs8', '.env', '.json', '.txt'],
    patterns: [
      { regex: /-----BEGIN (?:[A-Z0-9_-]+ )?PRIVATE KEY-----/, confidence: 'High' },
    ],
  },
  {
    id: 'SEC-FRONTEND-LEAK',
    version: RULES_VERSION,
    title: 'Sensitive Backend Secret Exposed with Client-Side Framework Prefix',
    category: 'hardcoded-secret',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected a high-privilege secret (SECRET, PRIVATE_KEY, DATABASE_URL) prepended with a public client-side framework prefix (VITE_, NEXT_PUBLIC_, REACT_APP_). Bundlers automatically bake these variables into client JavaScript bundles, making them visible to any website visitor in browser DevTools.',
    quantumMigrationRelevance:
      'Publicly exposed server secrets compromise the entire backend perimeter.',
    conventionalSecurityRelevance:
      'CRITICAL FRONTEND EXPOSURE: Client-side bundles are completely public. Violates OWASP Top 10 Security Misconfiguration.',
    recommendedRemediation:
      '1. Remove the client-side prefix (NEXT_PUBLIC_, VITE_, REACT_APP_) from the variable name.\n2. Access this secret strictly on the server side (Node.js/Express/Next API routes) and never pass it to client components.',
    compliance: {
      soc2: ['CC6.6'],
      pciDss: ['Req 8.2'],
      iso27001: ['A.12.1'],
    },
    referenceLinks: [
      { title: 'Vite Environment Variables Security Guide', url: 'https://vitejs.dev/guide/env-and-mode.html#env-variables' },
      { title: 'Next.js Environment Variables Security', url: 'https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables' },
    ],
    fileExtensions: ['.env', '.env.local', '.env.production', '.js', '.ts', '.jsx', '.tsx'],
    patterns: [
      { regex: /(?:NEXT_PUBLIC_|VITE_|REACT_APP_)(?:[A-Z0-9_]*?(?:SECRET|PRIVATE|KEY_SECRET|AUTH_SECRET|DATABASE_URL|MONGO_URI))\s*=\s*['"]?[a-zA-Z0-9_\-\+]{8,}/, confidence: 'High' },
    ],
  },

  // =========================================================================
  // --- C. PRESENT-DAY THREAT DEFENSE: BROKEN CLASSICAL CRYPTOGRAPHY ---
  // =========================================================================
  {
    id: 'CRYPTO-WEAK-MD5',
    version: RULES_VERSION,
    title: 'Broken MD5 Hash Function Usage Detected',
    category: 'weak-legacy',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    algorithmName: 'MD5',
    algorithmCategory: 'legacy-weak',
    quantumStatus: 'legacy-insecure',
    description:
      'Identified usage of MD5 message digest algorithm. MD5 has severe practical collision vulnerabilities that allow attackers to forge digital signatures, generate collision certificates, or crack hashed passwords in milliseconds via online rainbow tables.',
    quantumMigrationRelevance:
      'MD5 is fundamentally broken by classical computing; quantum computing further accelerates collision and preimage attacks via Grover\'s algorithm.',
    conventionalSecurityRelevance:
      'HIGH RISK: Disallowed by NIST SP 800-131A, PCI-DSS Req 3.4, and ISO 27001. Passwords hashed with MD5 are virtually in cleartext.',
    recommendedRemediation:
      '1. For passwords: Use Argon2id (RFC 9106) or bcrypt (work factor >= 12).\n2. For general hashing / checksums: Upgrade to SHA-256 or SHA-512 (FIPS 180-4) or SHA-3 (FIPS 202).',
    compliance: {
      nist: ['SP 800-131A Revision 2'],
      pciDss: ['Req 3.4'],
      iso27001: ['A.10.1.1'],
      soc2: ['CC6.1'],
    },
    referenceLinks: [
      { title: 'NIST SP 800-131A: Transitioning the Use of Cryptographic Algorithms', url: 'https://csrc.nist.gov/pubs/sp/800/131/a/r2/final' },
      { title: 'OWASP Password Storage Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php', '.cs', '.rb'],
    patterns: [
      { regex: /crypto\.createHash\s*\(\s*['"]md5['"]\s*\)/i, confidence: 'High' },
      { regex: /hashlib\.md5\s*\(/i, confidence: 'High' },
      { regex: /MessageDigest\.getInstance\s*\(\s*["']MD5["']\s*\)/i, confidence: 'High' },
      { regex: /md5\s*\([^)]+\)/i, confidence: 'Medium' },
    ],
  },
  {
    id: 'CRYPTO-WEAK-SHA1',
    version: RULES_VERSION,
    title: 'Deprecated SHA-1 Hash Function Usage Detected',
    category: 'weak-legacy',
    defaultSeverity: 'Medium',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    algorithmName: 'SHA-1',
    algorithmCategory: 'legacy-weak',
    quantumStatus: 'legacy-insecure',
    description:
      'Identified usage of the SHA-1 cryptographic hash algorithm. SHA-1 has practical collision attacks demonstrated by Google and CWI Amsterdam (SHAttered attack). NIST officially announced the complete deprecation of SHA-1 by 2030.',
    quantumMigrationRelevance:
      'SHA-1 lacks both classical collision resistance and quantum resistance.',
    conventionalSecurityRelevance:
      'Deprecated by NIST, CA/Browser Forum, and PCI-DSS for digital signatures and certificates.',
    recommendedRemediation:
      'Upgrade to SHA-256 or SHA-512 (FIPS 180-4) or SHA-3 / SHAKE256 (FIPS 202). For HMACs, use HMAC-SHA256.',
    compliance: {
      nist: ['SP 800-131A', 'NIST Transition from SHA-1'],
      pciDss: ['Req 3.4'],
      iso27001: ['A.10.1.1'],
    },
    referenceLinks: [
      { title: 'NIST Announces Complete SHA-1 Deprecation', url: 'https://www.nist.gov/news-events/news/2022/12/nist-retires-sha-1-cryptographic-algorithm' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php', '.cs'],
    patterns: [
      { regex: /crypto\.createHash\s*\(\s*['"]sha1['"]\s*\)/i, confidence: 'High' },
      { regex: /hashlib\.sha1\s*\(/i, confidence: 'High' },
      { regex: /MessageDigest\.getInstance\s*\(\s*["']SHA-?1["']\s*\)/i, confidence: 'High' },
    ],
  },
  {
    id: 'CRYPTO-MODE-AES-ECB',
    version: RULES_VERSION,
    title: 'Insecure AES Electronic Codebook (ECB) Mode Detected',
    category: 'weak-legacy',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    algorithmName: 'AES-ECB',
    algorithmCategory: 'symmetric',
    quantumStatus: 'legacy-insecure',
    description:
      'Identified AES cipher operating in Electronic Codebook (ECB) mode. ECB mode divides plaintext into blocks and encrypts each block independently without an Initialization Vector (IV). Identical plaintext blocks produce identical ciphertext blocks, leaking structural patterns of encrypted files and records.',
    quantumMigrationRelevance:
      'Symmetric encryption must use Authenticated Encryption (AEAD) to withstand both classical tampering and quantum-assisted chosen-ciphertext attacks.',
    conventionalSecurityRelevance:
      'HIGH RISK: Violates PCI-DSS Requirement 3.4 and NIST SP 800-38A recommendations.',
    recommendedRemediation:
      'Replace AES-ECB with an Authenticated Encryption with Associated Data (AEAD) mode such as AES-256-GCM or ChaCha20-Poly1305. Always generate a cryptographically random, unique 12-byte IV for every encryption operation.',
    compliance: {
      nist: ['SP 800-38D (AES-GCM)'],
      pciDss: ['Req 3.4'],
      iso27001: ['A.10.1.1'],
      soc2: ['CC6.1'],
    },
    referenceLinks: [
      { title: 'NIST SP 800-38D: Recommendation for Block Cipher Modes (GCM)', url: 'https://csrc.nist.gov/pubs/sp/800/38/d/final' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php', '.cs'],
    patterns: [
      { regex: /createCipher(?:iv)?\s*\(\s*['"]aes-(?:128|192|256)-ecb['"]/i, confidence: 'High' },
      { regex: /Cipher\.getInstance\s*\(\s*["']AES\/ECB\/[^"']+["']\s*\)/i, confidence: 'High' },
      { regex: /AES\.new\s*\([^,]+,\s*AES\.MODE_ECB/i, confidence: 'High' },
    ],
  },
  {
    id: 'CRYPTO-WEAK-DES',
    version: RULES_VERSION,
    title: 'Obsolete DES / 3DES / RC4 Symmetric Cipher Usage Detected',
    category: 'weak-legacy',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    algorithmName: 'DES/RC4',
    algorithmCategory: 'legacy-weak',
    quantumStatus: 'legacy-insecure',
    description:
      'Identified usage of obsolete symmetric ciphers (DES, Triple-DES, or RC4). DES has a 56-bit key size crackable in hours by brute force; 3DES has 64-bit block size susceptible to Sweet32 collision attacks; RC4 suffers from severe keystream biases.',
    quantumMigrationRelevance:
      'Small key and block sizes are trivial to break with both classical brute-force and quantum Grover acceleration.',
    conventionalSecurityRelevance:
      'Completely prohibited by NIST SP 800-131A, PCI-DSS v4.0, and ISO 27001.',
    recommendedRemediation:
      'Migrate immediately to AES-256-GCM (NIST FIPS 197) or ChaCha20-Poly1305 (RFC 8439).',
    compliance: {
      nist: ['SP 800-131A'],
      pciDss: ['Req 3.4'],
      iso27001: ['A.10.1.1'],
    },
    referenceLinks: [
      { title: 'NIST Deprecation of Triple-DES (SP 800-131A)', url: 'https://csrc.nist.gov/pubs/sp/800/131/a/r2/final' },
      { title: 'Sweet32 Birthday Attacks on 64-bit Block Ciphers', url: 'https://sweet32.info/' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php', '.cs'],
    patterns: [
      { regex: /createCipher(?:iv)?\s*\(\s*['"](?:des|des-ede|des-ede3|rc4|arcfour)[^'"]*['"]/i, confidence: 'High' },
      { regex: /Cipher\.getInstance\s*\(\s*["'](?:DES|DESede|RC4|ARCFOUR)[^"']*["']/i, confidence: 'High' },
    ],
  },
  {
    id: 'CRYPTO-INSECURE-RANDOM',
    version: RULES_VERSION,
    title: 'Insecure Pseudorandom Number Generator (PRNG) in Security Context',
    category: 'weak-legacy',
    defaultSeverity: 'Medium',
    defaultConfidence: 'Medium',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected standard non-cryptographic random functions (Math.random, random.random) used in context of tokens, salts, passwords, or keys. Standard PRNGs are deterministic and predictable, allowing adversaries to calculate future session IDs or reset tokens.',
    quantumMigrationRelevance:
      'Predictable random seeds compromise both classical and post-quantum key generation.',
    conventionalSecurityRelevance:
      'Violates OWASP Top 10 Cryptographic Failures and CWE-338 (Use of Cryptographically Feeble PRNG).',
    recommendedRemediation:
      'Use a Cryptographically Secure Pseudorandom Number Generator (CSPRNG): crypto.randomBytes() in Node.js, secrets.token_hex() in Python, or SecureRandom in Java.',
    compliance: {
      nist: ['SP 800-90A'],
      pciDss: ['Req 8.2'],
      iso27001: ['A.10.1.1'],
    },
    referenceLinks: [
      { title: 'CWE-338: Use of Cryptographically Feeble PRNG', url: 'https://cwe.mitre.org/data/definitions/338.html' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go'],
    patterns: [
      { regex: /(?:token|secret|password|nonce|salt|key)\s*[:=].*?Math\.random\s*\(\s*\)/i, confidence: 'High' },
      { regex: /(?:token|secret|password|nonce|salt|key)\s*[:=].*?random\.random\s*\(\s*\)/i, confidence: 'High' },
    ],
  },

  // =========================================================================
  // --- D. PRESENT-DAY THREAT DEFENSE: OWASP TOP 10 SAST VULNERABILITIES ---
  // =========================================================================
  {
    id: 'OWASP-SSRF-METADATA',
    version: RULES_VERSION,
    title: 'Server-Side Request Forgery (SSRF) / Cloud Metadata Probe Risk',
    category: 'owasp-top-10',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected potential Server-Side Request Forgery (SSRF) or direct reference to cloud instance metadata service IP (169.254.169.254). Attackers exploit unvalidated dynamic HTTP requests to query internal network services or steal cloud IAM role credentials from the AWS EC2 / GCP instance metadata service.',
    quantumMigrationRelevance:
      'Stolen cloud IAM credentials grant adversaries immediate access to cloud data stores regardless of transit encryption.',
    conventionalSecurityRelevance:
      'CRITICAL: OWASP Top 10 #10 (Server-Side Request Forgery). The primary attack vector in major cloud breaches (e.g. Capital One breach).',
    recommendedRemediation:
      '1. Implement strict URL allowlisting and disallow private IP ranges (127.0.0.1, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.169.254).\n2. Enforce IMDSv2 on AWS EC2 to require session-token based metadata queries.',
    compliance: {
      soc2: ['CC6.6'],
      iso27001: ['A.12.1.2'],
      pciDss: ['Req 6.5.1'],
    },
    referenceLinks: [
      { title: 'OWASP Server-Side Request Forgery Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html' },
      { title: 'AWS IMDSv2 Transition Guide', url: 'https://aws.amazon.com/blogs/security/defense-in-depth-open-firewalls-reverse-proxies-ssrf-vulnerabilities-ec2-instance-metadata-service/' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php'],
    patterns: [
      { regex: /169\.254\.169\.254/, confidence: 'High' },
      { regex: /metadata\.google\.internal/, confidence: 'High' },
    ],
  },
  {
    id: 'OWASP-IDOR-BROKEN-AUTH',
    version: RULES_VERSION,
    title: 'Potential Insecure Direct Object Reference (IDOR) / Missing Multi-Tenant Scope',
    category: 'owasp-top-10',
    defaultSeverity: 'High',
    defaultConfidence: 'Medium',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified database query fetching records directly by primary key parameter (req.params.id) without scoping by the authenticated user\'s organizationId or userId. An attacker can tamper with the ID parameter in the URL to view or modify other tenants\' confidential data.',
    quantumMigrationRelevance:
      'Tenant isolation is a fundamental prerequisite for data privacy across all cryptographic architectures.',
    conventionalSecurityRelevance:
      'HIGH RISK: OWASP Top 10 #1 (Broken Access Control) - the most prevalent web application vulnerability.',
    recommendedRemediation:
      'Always include the authenticated organizationId or userId in the database filter query: e.g. Model.findOne({ _id: req.params.id, organizationId: req.user.organizationId }).',
    compliance: {
      soc2: ['CC6.1', 'CC6.3'],
      iso27001: ['A.9.4.1'],
      pciDss: ['Req 6.5.8'],
      dpdpAct: ['Section 8(5)'],
    },
    referenceLinks: [
      { title: 'OWASP Insecure Direct Object Reference Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java'],
    patterns: [
      { regex: /findById\s*\(\s*req\.params\.[a-zA-Z0-9_]+\s*\)/, confidence: 'Medium' },
    ],
  },
  {
    id: 'OWASP-INJECTION-SQL',
    version: RULES_VERSION,
    title: 'SQL Injection via String Concatenation Detected',
    category: 'owasp-top-10',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected dynamic SQL query constructed using string concatenation or template literals. Unsanitized user inputs concatenated into raw SQL statements allow adversaries to bypass authentication, extract entire databases, or destroy data.',
    quantumMigrationRelevance:
      'SQL injection compromises the underlying storage engine, rendering all higher-level security controls ineffective.',
    conventionalSecurityRelevance:
      'CRITICAL: OWASP Top 10 #3 (Injection). CWE-89.',
    recommendedRemediation:
      'Always use parameterized queries (prepared statements) or an established ORM/query builder (e.g., Prisma, TypeORM, SQLAlchemy) with parameter placeholders ($1, ?). Never concatenate raw input into SQL strings.',
    compliance: {
      pciDss: ['Req 6.5.1'],
      soc2: ['CC6.6'],
      iso27001: ['A.14.2.5'],
    },
    referenceLinks: [
      { title: 'OWASP SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php'],
    patterns: [
      { regex: /(?:query|execute)\s*\(\s*['"](?:SELECT|INSERT|UPDATE|DELETE)\s+[^'"]*['"]\s*\+/i, confidence: 'High' },
      { regex: /(?:query|execute)\s*\(\s*`\s*(?:SELECT|INSERT|UPDATE|DELETE)\s+[^`]*\${/i, confidence: 'High' },
    ],
  },
  {
    id: 'OWASP-INJECTION-CMD',
    version: RULES_VERSION,
    title: 'Command Injection via System Shell Execution Detected',
    category: 'owasp-top-10',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected execution of system shell commands with dynamic variable input (child_process.exec, os.system). If any portion of the command string is user-influenced, attackers can execute arbitrary shell commands on the host server.',
    quantumMigrationRelevance:
      'Host compromise gives attackers root access to file systems and cryptographic memory.',
    conventionalSecurityRelevance:
      'CRITICAL: OWASP Top 10 #3 (Injection) and CWE-78.',
    recommendedRemediation:
      'Avoid invoking system shells. If external processes are required, use child_process.execFile() or subprocess.run([args], shell=False) passing arguments as a fixed array, never as a concatenated string.',
    compliance: {
      pciDss: ['Req 6.5.1'],
      soc2: ['CC6.6'],
      iso27001: ['A.12.1.2'],
    },
    referenceLinks: [
      { title: 'OWASP Command Injection Defense', url: 'https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php'],
    patterns: [
      { regex: /child_process\.(?:exec|execSync)\s*\(\s*`[^`]*\${/i, confidence: 'High' },
      { regex: /os\.system\s*\(\s*f['"][^'"]*\{/i, confidence: 'High' },
      { regex: /subprocess\.(?:call|Popen|run)\s*\([^,]+,\s*shell\s*=\s*True/i, confidence: 'High' },
    ],
  },
  {
    id: 'OWASP-PATH-TRAVERSAL',
    version: RULES_VERSION,
    title: 'Path Traversal / Arbitrary File Read Risk Detected',
    category: 'owasp-top-10',
    defaultSeverity: 'High',
    defaultConfidence: 'Medium',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected filesystem read/write operation joining user input directly into file paths. Attackers can supply "../" sequences to escape the designated folder and read sensitive configuration files (e.g., /etc/passwd or .env).',
    quantumMigrationRelevance:
      'Path traversal exposes local private keys and environment files to unauthorized downloading.',
    conventionalSecurityRelevance:
      'HIGH RISK: OWASP Top 10 #1 (Broken Access Control) and CWE-22.',
    recommendedRemediation:
      'Sanitize all file path inputs using path.basename(), and verify the resolved canonical path starts with the allowed base directory: e.g. path.resolve(baseDir, userInput).startsWith(baseDir).',
    compliance: {
      soc2: ['CC6.6'],
      iso27001: ['A.12.1'],
      pciDss: ['Req 6.5.8'],
    },
    referenceLinks: [
      { title: 'OWASP Path Traversal Cheat Sheet', url: 'https://owasp.org/www-community/attacks/Path_Traversal' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go'],
    patterns: [
      { regex: /fs\.(?:readFile|readFileSync|createReadStream)\s*\(\s*path\.join\s*\([^,]+,\s*req\.(?:query|params|body)/, confidence: 'High' },
    ],
  },
  {
    id: 'OWASP-XSS-UNSAFE-DOM',
    version: RULES_VERSION,
    title: 'Unsafe DOM Injection / Cross-Site Scripting (XSS) Sink Detected',
    category: 'owasp-top-10',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified usage of dangerouslySetInnerHTML or innerHTML sinks in frontend components. If dynamic HTML is rendered without rigorous sanitization (e.g. DOMPurify), adversaries can execute malicious JavaScript to steal session tokens or redirect users.',
    quantumMigrationRelevance:
      'XSS allows adversaries to hijack customer sessions in the browser before data reaches backend encryption.',
    conventionalSecurityRelevance:
      'HIGH RISK: OWASP Top 10 #3 (Injection) and CWE-79.',
    recommendedRemediation:
      'Avoid raw HTML rendering. If HTML must be rendered, sanitize all user content through DOMPurify (DOMPurify.sanitize(dirtyHtml)) before injection.',
    compliance: {
      pciDss: ['Req 6.5.7'],
      soc2: ['CC6.6'],
      iso27001: ['A.14.2.5'],
    },
    referenceLinks: [
      { title: 'OWASP Cross-Site Scripting Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
    ],
    fileExtensions: ['.jsx', '.tsx', '.js', '.ts', '.vue', '.html'],
    patterns: [
      { regex: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:/, confidence: 'High' },
      { regex: /\.innerHTML\s*=\s*[a-zA-Z0-9_]+/, confidence: 'Medium' },
    ],
  },

  // =========================================================================
  // --- E. PRESENT-DAY THREAT DEFENSE: INSECURE NETWORK TRANSPORT & TLS ---
  // =========================================================================
  {
    id: 'NET-TLS-DISABLED-VERIFY',
    version: RULES_VERSION,
    title: 'Disabled TLS Certificate Verification Detected (rejectUnauthorized: false)',
    category: 'insecure-transport',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified code explicitly disabling TLS/SSL certificate validation (e.g., rejectUnauthorized: false in Node.js or verify=False in Python). This disables authenticity verification of external servers, allowing attackers to intercept API traffic, credentials, and payment data via Man-in-the-Middle (MITM) proxies.',
    quantumMigrationRelevance:
      'Disabling transport security nullifies all cipher suites and post-quantum key exchange mechanisms.',
    conventionalSecurityRelevance:
      'CRITICAL: Direct violation of PCI-DSS Requirement 4.1 and SOC 2 CC6.6.',
    recommendedRemediation:
      'Always keep TLS certificate verification enabled in production. If using custom enterprise certificates, add the custom Root Certificate Authority to the system or application trust store rather than disabling verification globally.',
    compliance: {
      pciDss: ['Req 4.1'],
      soc2: ['CC6.6'],
      iso27001: ['A.10.1.1', 'A.13.1.1'],
    },
    referenceLinks: [
      { title: 'Node.js HTTPS Agent rejectUnauthorized Security Notice', url: 'https://nodejs.org/api/https.html#https_class_https_agent' },
      { title: 'Python Requests SSL Verification Guide', url: 'https://requests.readthedocs.io/en/latest/user/advanced/#ssl-cert-verification' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.php'],
    patterns: [
      { regex: /rejectUnauthorized\s*:\s*false/i, confidence: 'High' },
      { regex: /verify\s*=\s*False\b/, confidence: 'High' },
      { regex: /InsecureRequestWarning/, confidence: 'Medium' },
      { regex: /TrustAllCertificates|allowAllCert/i, confidence: 'High' },
    ],
  },
  {
    id: 'NET-PLAINTEXT-HTTP-AUTH',
    version: RULES_VERSION,
    title: 'Unencrypted Plain HTTP Endpoint for Sensitive API Detected',
    category: 'insecure-transport',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'harvest-now-decrypt-later',
    description:
      'Identified unencrypted cleartext HTTP endpoint (http://) configured for sensitive authentication, payment, or API routes. Cleartext communication exposes data to network sniffers and eavesdropping adversaries.',
    quantumMigrationRelevance:
      'Cleartext transmissions can be harvested immediately without needing any cryptanalysis.',
    conventionalSecurityRelevance:
      'HIGH RISK: Violates PCI-DSS Requirement 4.1 (Protect Cardholder Data in Transit).',
    recommendedRemediation:
      'Enforce HTTPS exclusively across all production endpoints and set Strict-Transport-Security (HSTS) headers.',
    compliance: {
      pciDss: ['Req 4.1'],
      iso27001: ['A.13.1.1'],
      soc2: ['CC6.6'],
    },
    referenceLinks: [
      { title: 'OWASP Transport Layer Protection Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go', '.env', '.json'],
    patterns: [
      { regex: /http:\/\/(?:api|auth|login|checkout|payment|secure)\.[a-zA-Z0-9\-\.]+/i, confidence: 'High' },
    ],
  },

  // =========================================================================
  // --- F. PRESENT-DAY THREAT DEFENSE: PII & FINANCIAL DATA LEAKAGE ---
  // =========================================================================
  {
    id: 'PII-AADHAAR-EXPOSURE',
    version: RULES_VERSION,
    title: 'Indian National Identity (Aadhaar Number) Pattern Detected',
    category: 'pii-financial-leak',
    defaultSeverity: 'High',
    defaultConfidence: 'Medium',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected unmasked 12-digit Indian Aadhaar number pattern in source code or static fixtures. Storing unmasked national identity numbers in repositories violates regulatory data protection mandates.',
    quantumMigrationRelevance:
      'Citizen identity credentials must be encrypted with post-quantum compliant algorithms for long-term archival.',
    conventionalSecurityRelevance:
      'REGULATORY COMPLIANCE RISK: Violates India Digital Personal Data Protection (DPDP) Act 2023 and UIDAI regulations.',
    recommendedRemediation:
      'Mask all Aadhaar numbers showing only the last 4 digits (e.g., XXXX-XXXX-1234). Never store unencrypted identity numbers in source control.',
    compliance: {
      dpdpAct: ['Section 8(5)', 'Section 9'],
      iso27001: ['A.18.1.4'],
    },
    referenceLinks: [
      { title: 'UIDAI Aadhaar Data Security Guidelines', url: 'https://uidai.gov.in/' },
      { title: 'India Digital Personal Data Protection Act 2023', url: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.json', '.csv', '.sql'],
    patterns: [
      { regex: /\b[2-9][0-9]{3}\s?[0-9]{4}\s?[0-9]{4}\b/, confidence: 'Medium' },
    ],
    negativePatterns: [
      /1234\s?5678\s?9012/, // standard dummy test sequence
      /0000\s?0000\s?0000/,
    ],
  },
  {
    id: 'PII-PAN-CARD-EXPOSURE',
    version: RULES_VERSION,
    title: 'Indian Permanent Account Number (PAN Card) Pattern Detected',
    category: 'pii-financial-leak',
    defaultSeverity: 'High',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected 10-character Indian PAN card format in source code or configuration files. Exposing financial tax IDs exposes organizations to regulatory penalties and identity fraud.',
    quantumMigrationRelevance:
      'Financial identifiers require strong cryptographic protection in storage and transit.',
    conventionalSecurityRelevance:
      'Violates RBI KYC/AML master directions and India DPDP Act 2023.',
    recommendedRemediation:
      'Redact or tokenize PAN card numbers. Never check real citizen financial records into source control repositories.',
    compliance: {
      dpdpAct: ['Section 8(5)'],
      pciDss: ['Req 3.4'],
    },
    referenceLinks: [
      { title: 'Income Tax Department PAN Guidelines', url: 'https://www.incometax.gov.in/' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.json', '.csv', '.sql'],
    patterns: [
      { regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/, confidence: 'High' },
    ],
    negativePatterns: [
      /ABCDE1234F/, // standard documentation mock PAN
    ],
  },
  {
    id: 'PII-CREDIT-CARD-EXPOSURE',
    version: RULES_VERSION,
    title: 'Payment Card Account Number (PAN) Pattern Detected',
    category: 'pii-financial-leak',
    defaultSeverity: 'Critical',
    defaultConfidence: 'High',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Detected unmasked credit or debit card primary account number (PAN). Committing real card numbers to source control is a catastrophic violation of Payment Card Industry standards.',
    quantumMigrationRelevance:
      'Cardholder data must be secured against both current data scraping and future decryption.',
    conventionalSecurityRelevance:
      'CRITICAL: Direct violation of PCI-DSS v4.0 Requirement 3.4 (Render PAN unreadable anywhere it is stored).',
    recommendedRemediation:
      '1. Immediately delete the card data and purge the repository commit history.\n2. Utilize payment gateway tokenization (Razorpay / Stripe Elements) so card numbers never touch your application servers.',
    compliance: {
      pciDss: ['Req 3.4', 'Req 3.5'],
      soc2: ['CC6.1'],
    },
    referenceLinks: [
      { title: 'PCI Security Standards Council: Requirement 3', url: 'https://www.pcisecuritystandards.org/' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.json', '.sql', '.txt'],
    patterns: [
      { regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/, confidence: 'High' },
    ],
    negativePatterns: [
      /4111\s?1111\s?1111\s?1111/, // standard mock card
      /4100\s?2800\s?0000\s?1007/, // Razorpay test card
    ],
  },
  {
    id: 'PII-LOG-SENSITIVE-DATA',
    version: RULES_VERSION,
    title: 'Logging Statement Printing Sensitive Credentials or PII',
    category: 'pii-financial-leak',
    defaultSeverity: 'Medium',
    defaultConfidence: 'Medium',
    classification: 'Confirmed pattern match',
    quantumImpactType: 'not-quantum-specific',
    description:
      'Identified application logging call (console.log, logger.info, print) directly printing sensitive identifiers such as passwords, auth tokens, PAN cards, or Aadhaar numbers. Application logs are frequently routed to centralized logging providers (Datadog, CloudWatch) where unauthorized users can inspect them.',
    quantumMigrationRelevance:
      'Leaked plain-text tokens in logs bypass all cryptographic confidentiality layers.',
    conventionalSecurityRelevance:
      'Violates OWASP Top 10 #9 (Security Logging and Monitoring Failures) and PCI-DSS Requirement 10.',
    recommendedRemediation:
      'Implement an automated logger sanitizer or exclude sensitive keys from logging serialization (e.g. using pino-noir or custom redact filters).',
    compliance: {
      pciDss: ['Req 3.4', 'Req 10.2'],
      soc2: ['CC6.6'],
      iso27001: ['A.12.4.1'],
    },
    referenceLinks: [
      { title: 'OWASP Logging Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html' },
    ],
    fileExtensions: ['.js', '.ts', '.py', '.java', '.go'],
    patterns: [
      { regex: /(?:console\.log|logger\.(?:info|debug|warn)|print)\s*\([^)]*(?:password|aadhaar|pan_card|credit_card|auth_token|client_secret)/i, confidence: 'Medium' },
    ],
  },
];
