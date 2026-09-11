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
 *
 * Payload:
 * {
 *     target_id,
 *     target_aturan_detail_id,
 *     nomor_bal,
 *     berat_kotor
 * }
 */
export const storeStream = async (payload) => {
    return await api.post(
        `${BASE_PATH}/stream`,
        payload
    );
};

/**
 * 3. Mengambil data live cache & nomor bal berikutnya
 *
 * Params:
 * {
 *     target_id,
 *     target_aturan_detail_id
 * }
 */
export const getLiveData = async (
    targetId,
    detailId
) => {
    return await api.get(
        `${BASE_PATH}/live-data`,
        {
            params: {
                target_id: targetId,
                target_aturan_detail_id: detailId,
            },
        }
    );
};

/**
 * 4. Hapus 1 bal dari Cache Staging
 */
export const deleteCache = async (id) => {
    return await api.delete(
        `${BASE_PATH}/cache/${id}`
    );
};

/**
 * 5. Hapus SELURUH Cache berdasarkan Target ID
 */
export const clearCacheByTarget = async (
    targetId
) => {
    return await api.delete(
        `${BASE_PATH}/cache/target/${targetId}`
    );
};

/**
 * 6. Commit Final
 *
 * Payload:
 * {
 *     target_id,
 *     target_aturan_detail_id
 * }
 */
export const commitFinal = async (payload) => {
    return await api.post(
        `${BASE_PATH}/commit`,
        payload
    );
};

/**
 * 7. Update status target
 *
 * status:
 * pending | active | finish
 */
export const updateTargetStatus = async (
    targetId,
    status
) => {
    return await api.patch(
        `${BASE_PATH}/target/${targetId}/status`,
        {
            status,
        }
    );
};