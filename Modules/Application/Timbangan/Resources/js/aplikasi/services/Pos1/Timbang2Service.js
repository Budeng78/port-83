import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/timbangan/pos1/timbang2';

const timbang2Service = {

    /**
     * Ambil Target Kerja yang sudah memiliki
     * data pada Timbang 1.
     */
    async getTargetTimbang1() {

        const response = await axios.get(
            `${BASE_URL}/target`
        );

        return response.data;
    },


    /**
     * Ambil data Timbang 1 berdasarkan
     * target dan detail aturan.
     */
    async getTimbang1(
        targetId,
        detailId
    ) {

        const response = await axios.get(
            `${BASE_URL}/timbang1/${targetId}/${detailId}`
        );

        return response.data;
    },


    /**
     * Simpan timbang 2 ke cache.
     */
    async storeStream(data) {

        const response = await axios.post(
            `${BASE_URL}/stream`,
            data
        );

        return response.data;
    },


    /**
     * Ambil live/cache data Timbang 2.
     */
    async getLiveData(
        targetId,
        detailId
    ) {

        const response = await axios.get(
            `${BASE_URL}/live-data/${targetId}/${detailId}`
        );

        return response.data;
    },


    /**
     * Hapus satu cache.
     */
    async deleteCache(id) {

        const response = await axios.delete(
            `${BASE_URL}/cache/${id}`
        );

        return response.data;
    },


    /**
     * Hapus seluruh cache berdasarkan target.
     */
    async clearCacheByTarget(targetId) {

        const response = await axios.delete(
            `${BASE_URL}/cache/target/${targetId}`
        );

        return response.data;
    },


    /**
     * Commit cache menjadi data permanen.
     */
    async commitFinal(
        targetId,
        detailId
    ) {

        const response = await axios.post(
            `${BASE_URL}/commit`,
            {
                target_id: targetId,
                target_aturan_detail_id: detailId,
            }
        );

        return response.data;
    },

};

export default timbang2Service;