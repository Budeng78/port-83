import api from "@Modules/Platform/System/Resources/js/aplikasi/axios/axios.js";

const BASE_PATH = "/timbangan/pos1";

/**
 * 1. Mengambil daftar target kerja aktif
 */
export const getTargetAktif = async () => {
  return await api.get(`${BASE_PATH}/target-aktif`);
};

/**
 * 2. Simpan / Update stream berat kotor ke cache staging
 * Payload: { target_id, nomor_bal, berat_kotor }
 */
export const storeStream = async (payload) => {
  return await api.post(`${BASE_PATH}/stream`, payload);
};

/**
 * 3. Polling / Fetch Data Live Cache & Nomor Bal Berikutnya
 * Params: { target_id }
 */
export const getLiveData = async (targetId) => {
  return await api.get(`${BASE_PATH}/live-data`, {
    params: { target_id: targetId },
  });
};

/**
 * 4. Hapus 1 bal dari Cache Staging
 */
export const deleteCache = async (id) => {
  return await api.delete(`${BASE_PATH}/cache/${id}`);
};

/**
 * 5. Commit Final: Pindahkan seluruh Cache ke Tabel Utama
 * Payload: { target_id }
 */
export const commitFinal = async (targetId) => {
  return await api.post(`${BASE_PATH}/commit`, {
    target_id: targetId,
  });
};