/**
 * Headers default untuk akses API Kopi Kenangan.
 * Catatan: token (authorization & wtoken) bisa expired suatu saat.
 * Jika data tidak load, refresh token dari aplikasi mobile dan paste ulang di sini.
 */
export const KK_HEADERS = {
  accept: 'application/json',
  'accept-encoding': 'gzip',
  'accept-language': 'zh-cn',
  appid: 'kopikenangan',
  appsflyer_id: '1779626706601-6083826585114168478',
  authorization:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4NjYwMjY5ODEsImlzcyI6ImtrLWlzc3VlciIsImRldmljZUlkIjoiZWE5ZjljMmFhOGJiMjA2MCIsImN1c3RvbWVySWQiOjE4NTQ4MDU1LCJtYXJrZXRwbGFjZUlkIjo5MDAwMSwib3V0bGV0Q29kZSI6IiJ9.yhSC3qfKqd9tC6wfaQCKJZzWE756QgBB5QY3gh3UbH8',
  'content-type': 'application/json',
  deviceid: 'ea9f9c2aa8bb2060',
  devicetype: 'Android',
  gopay_v2: 'true',
  gopay_v3: 'true',
  islogin: 'false',
  language: 'id',
  sign_version: '256',
  supportsharebuy: 'true',
  timezone: '25200',
  'user-agent': 'Dart/3.8 (dart:io)',
  version: '125.08.22',
  versioncode: '336',
  wtoken:
    '0003_9E5A1F545D43BC9C17C02ECC15E288AF7D19A1BB605B56C0FF2DF6B210827FCE64EE1EB76D6259BD615230BF17431C4CCD2C2C2598FEV1YqpYhOzERXuQA8N1k6HSsn2wLFCya40ObrwlsahxYIpAcoH1+xlWTnRND+SNhzYFQoP7URYD8IV44Kh7ZqUDAYEpA5kLfeVKaVG2NewJ0KVKzcacTTGEHAi/jEXn6aRdPUqJP2kPeka/UnYQBsYbGLDBUmGmj/6yXK10asaziJXd7Qf7/kbIwqPLxjnVYrIkVC9NBS+HzjRh6AEtai9QKb2DRUi9kCA9HZ1hg9P7Po5XllcyPbKPsuJ/b8bXL3g5gXHetvaU4nPdZdyH7wzwtVABbGaBhRX6GFg0J8Hfj3RuLHDYF+UoNmF7OGhUwpeBZy+ifrc+nfIh2FuxdAWPUAi3JKdzt5/IjOBkSjWDlkJdVNxj1LKZd9LRdHAUz3VXI1uvRGnSvzZcJ+oK/nH8A0/xRjnBqg38CVmreZngo=_fHx8',
};

// Signature unik per endpoint (clsignature). Boleh share antar endpoint, server biasanya
// tidak strict cek. Kalau gagal, ganti dengan signature dari capture endpoint terkait.
export const KK_SIGNATURES = {
  stores:
    '8283a9bb6b3fd198adf14dc58ecab0589984f8031a2c3956c27bcff072ba0da8',
  menu:
    '32cbbf3c3f169757e334eeac08e61474a0e0fea0e803815b6d18fda85126090c',
  options:
    '747d569ffa66d3f14c47cd2be6780fb22055b7ff6cb14574b672c7aa18f83b13',
};
