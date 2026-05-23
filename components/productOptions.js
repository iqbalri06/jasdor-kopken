/**
 * Helper untuk opsi produk.
 * Tentukan apakah sebuah produk punya opsi yang perlu dipilih user.
 */
export function hasCustomization(data) {
  if (!data) return false;
  const dims = data.product_dimension_wording?.dimension_wordings || [];
  const addons = data.product_addon_wording?.addon_wordings || [];
  const notes = data.notes || [];

  if (dims.length > 0) return true;
  if (addons.length > 0) return true;

  // notes dianggap punya opsi jika ada group dengan minimal 2 nilai
  for (const n of notes) {
    for (const g of n.groups || []) {
      if ((g.values || []).length > 1) return true;
    }
  }
  return false;
}

/**
 * Bangun item untuk cart langsung dari data options (tanpa modal).
 * Hanya dipanggil jika hasCustomization(data) === false.
 */
export function buildSimpleCartItem(product, data) {
  const map = data?.option_product_map || {};
  // Untuk produk tanpa opsi, key biasanya string kosong "".
  const matched = map[''] || Object.values(map)[0] || null;

  const price = matched ? Number(matched.price) : Number(data?.base_product?.price) || Number(product.price) || 0;
  const productCode = matched?.product_code || product.product_code || `simple_${product.id}`;

  return {
    id: productCode,
    name: product.name || data?.base_product?.name || 'Produk',
    product_code: productCode,
    price,
    orig_price: Number(product.orig_price) || price,
    image: product.image || data?.base_product?.image || '',
    variant: '',
    addons: [],
    notes: [],
  };
}

export async function fetchOptions(product, storeCode) {
  const url = `/api/options?product_id=${encodeURIComponent(
    product.id
  )}&bundle_code=${encodeURIComponent(product.bundle_code || '')}&store_code=${encodeURIComponent(storeCode)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error_code !== 0 || !json.data) {
    throw new Error(json.msg || 'Gagal memuat opsi');
  }
  return json.data;
}
