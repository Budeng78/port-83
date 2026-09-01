import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

/**
 * React Service
 * Manajemen Hasil Timbangan Awal Pos Rajang
 */
const hasilTimbanganService = {

    /**
     * Mengambil daftar hasil timbangan
     *
     * Endpoint:
     * GET /api/posrajang/timbangawal/hasil-timbangan
     */
    getAll(params = {}) {
        return api.get(
            '/posrajang/timbangawal/hasil-timbangan',
            {
                params,
            }
        );
    },

    /**
     * Mengambil detail satu dokumen hasil timbangan
     *
     * Endpoint:
     * GET /api/posrajang/timbangawal/hasil-timbangan/{id}
     */
    getDetail(id) {
        return api.get(
            `/posrajang/timbangawal/hasil-timbangan/${id}`
        );
    },

};

export default hasilTimbanganService;