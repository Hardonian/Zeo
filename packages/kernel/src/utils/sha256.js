/**
 * Pure JS Implementation of SHA-256 for isomorphic usage.
 * No dependencies on node:crypto or crypto.subtle.
 * Based on reputable FIPS 180-4 reference implementation logic.
 */
// Constants
const K = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
]);
// Utilities
function rotr(x, n) {
    return (x >>> n) | (x << (32 - n));
}
function ch(x, y, z) {
    return (x & y) ^ (~x & z);
}
function maj(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
}
function sigma0(x) {
    return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
}
function sigma1(x) {
    return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
}
function gamma0(x) {
    return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
}
function gamma1(x) {
    return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);
}
export function sha256(message) {
    const msg = typeof message === 'string' ? new TextEncoder().encode(message) : message;
    const len = msg.length * 8;
    // Padding
    const padLen = ((len + 64) >>> 9) << 4; // 16 32-bit words (512 bits) per block
    const padded = new Uint8Array(((padLen + 16) * 4));
    padded.set(msg);
    padded[msg.length] = 0x80;
    // Length (big-endian 64-bit)
    const view = new DataView(padded.buffer);
    view.setUint32(padded.length - 4, len, false); // low 32 bits, simpler for < 4GB inputs
    const w = new Uint32Array(64);
    let H = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    for (let i = 0; i < padded.length; i += 64) {
        const chunk = padded.subarray(i, i + 64);
        for (let j = 0; j < 16; j++) {
            w[j] = (chunk[j * 4] << 24) | (chunk[j * 4 + 1] << 16) | (chunk[j * 4 + 2] << 8) | chunk[j * 4 + 3];
        }
        for (let j = 16; j < 64; j++) {
            w[j] = (gamma1(w[j - 2]) + w[j - 7] + gamma0(w[j - 15]) + w[j - 16]) >>> 0;
        }
        let [a, b, c, d, e, f, g, h] = H;
        for (let j = 0; j < 64; j++) {
            const temp1 = (h + sigma1(e) + ch(e, f, g) + K[j] + w[j]) >>> 0;
            const temp2 = (sigma0(a) + maj(a, b, c)) >>> 0;
            h = g;
            g = f;
            f = e;
            e = (d + temp1) >>> 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) >>> 0;
        }
        H[0] = (H[0] + a) >>> 0;
        H[1] = (H[1] + b) >>> 0;
        H[2] = (H[2] + c) >>> 0;
        H[3] = (H[3] + d) >>> 0;
        H[4] = (H[4] + e) >>> 0;
        H[5] = (H[5] + f) >>> 0;
        H[6] = (H[6] + g) >>> 0;
        H[7] = (H[7] + h) >>> 0;
    }
    // Convert to hex string
    let hex = '';
    for (let i = 0; i < 8; i++) {
        hex += H[i].toString(16).padStart(8, '0');
    }
    return hex;
}
//# sourceMappingURL=sha256.js.map