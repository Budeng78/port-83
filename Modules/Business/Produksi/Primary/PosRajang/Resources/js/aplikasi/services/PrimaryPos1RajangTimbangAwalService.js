import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/posrajang/timbang/timbang-awal';

const PrimaryPos1RajangTimbangAwalService = {

    /**
     * ============================================================
     * CREATE HEADER
     * ============================================================
     *
     * Membuat dokumen timbang awal.
     *
     * Backend otomatis membuat nomor dokumen.
     */
    async createHeader(payload) {
        const response = await api.post(
            BASE_URL,
            payload
        );

        return response.data;
    },


    /**
     * ============================================================
     * GET TIMBANG / RECOVERY
     * ============================================================
     *
     * Mengambil header + cache tally.
     */
    async getTimbang(id) {

        if (!id) {
            throw new Error(
                'ID dokumen timbang tidak tersedia.'
            );
        }

        const response = await api.get(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },


    /**
     * ============================================================
     * NEXT TALLY
     * ============================================================
     *
     * Backend menentukan nomor tally berikutnya.
     *
     * Jangan menentukan nomor tally sendiri di JSX.
     */
    async getNextTally(id) {

        if (!id) {
            throw new Error(
                'ID dokumen timbang tidak tersedia.'
            );
        }

        const response = await api.get(
            `${BASE_URL}/${id}/next-tally`
        );

        return response.data;
    },


    /**
     * ============================================================
     * SAVE TALLY
     * ============================================================
     *
     * Menyimpan hasil timbang ke CACHE.
     *
     * Backend:
     *
     * berat_netto = berat_bruto - tara
     */
    async saveTally(id, payload) {

        if (!id) {
            throw new Error(
                'ID dokumen timbang tidak tersedia.'
            );
        }

        const response = await api.post(
            `${BASE_URL}/${id}/cache`,
            payload
        );

        return response.data;
    },


    /**
     * ============================================================
     * DELETE TALLY
     * ============================================================
     *
     * Menghapus tally dari CACHE.
     *
     * Contoh:
     *
     * 1
     * 2
     * 3
     * 4
     * 5
     *
     * delete 3
     *
     * menjadi:
     *
     * 1
     * 2
     * 3
     * 4
     *
     * Pergeseran nomor dilakukan oleh BACKEND.
     */
    async deleteTally(id, nomorTally) {

        if (!id) {
            throw new Error(
                'ID dokumen timbang tidak tersedia.'
            );
        }

        if (!nomorTally) {
            throw new Error(
                'Nomor tally tidak tersedia.'
            );
        }

        const response = await api.delete(
            `${BASE_URL}/${id}/cache/${nomorTally}`
        );

        return response.data;
    },


    /**
     * ============================================================
     * FINISH / CLOSE
     * ============================================================
     *
     * Backend melakukan:
     *
     * CACHE
     *   ↓
     * DETAIL
     *
     * HEADER
     *   ↓
     * completed
     *
     * CACHE
     *   ↓
     * soft delete
     */
    async finish(id) {

        if (!id) {
            throw new Error(
                'ID dokumen timbang tidak tersedia.'
            );
        }

        const response = await api.post(
            `${BASE_URL}/${id}/finish`
        );

        return response.data;
    },


    /**
     * ============================================================
     * HELPER: SIMPAN TALLY
     * ============================================================
     *
     * Memastikan tipe data yang dikirim ke backend benar.
     */
    async simpanTally(
        id,
        nomorTally,
        beratBruto,
        tara = null
    ) {

        const payload = {
            nomor_tally: Number(nomorTally),
            berat_bruto: Number(beratBruto),
        };

        /*
         * Tara hanya dikirim kalau memang diberikan.
         *
         * Jika null:
         * backend akan menggunakan tara header.
         */
        if (
            tara !== null &&
            tara !== undefined &&
            tara !== ''
        ) {
            payload.tara = Number(tara);
        }

        return await this.saveTally(
            id,
            payload
        );
    },


    /**
     * ============================================================
     * HELPER: DELETE TALLY
     * ============================================================
     */
    async hapusTally(
        id,
        nomorTally
    ) {

        return await this.deleteTally(
            id,
            Number(nomorTally)
        );
    },
};

export {
    PrimaryPos1RajangTimbangAwalService
};

export default PrimaryPos1RajangTimbangAwalService;