import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

/*
|--------------------------------------------------------------------------
| BASE ENDPOINT
|--------------------------------------------------------------------------
|
| axios sudah memiliki /api sebagai baseURL.
|
| Jadi:
| /posrajang/timbang-awal
|
| menjadi:
| /api/posrajang/timbang-awal
|
*/

const BASE_URL = '/posrajang/timbang-awal';


/*
|--------------------------------------------------------------------------
| CREATE / CONNECT + INIT
|--------------------------------------------------------------------------
|
| Nama function dipertahankan agar kompatibel dengan
| TimbangAwal.jsx yang saat ini memanggil:
|
| timbangAwalRajangService.connectAndInitTimbangAwal()
|
| Backend:
|
| POST /api/posrajang/timbang-awal
|
*/

export const connectAndInitTimbangAwal = async (payload) => {
    const response = await api.post(
        BASE_URL,
        payload
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| RECOVERY
|--------------------------------------------------------------------------
|
| Backend:
|
| POST /api/posrajang/timbang-awal/recovery
|
*/

export const recoveryTimbangAwal = async (payload) => {
    const response = await api.post(
        `${BASE_URL}/recovery`,
        payload
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| GET SESSION
|--------------------------------------------------------------------------
|
| Backend:
|
| GET /api/posrajang/timbang-awal/{id}
|
*/

export const getTimbangAwalSession = async (dokumenId) => {
    const response = await api.get(
        `${BASE_URL}/${dokumenId}`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| STORE TALLY
|--------------------------------------------------------------------------
|
| Backend:
|
| POST /api/posrajang/timbang-awal/{id}/tally
|
*/

export const storeTally = async (dokumenId, payload) => {
    const response = await api.post(
        `${BASE_URL}/${dokumenId}/tally`,
        payload
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| DELETE TALLY
|--------------------------------------------------------------------------
|
| Backend:
|
| DELETE /api/posrajang/timbang-awal/{id}/tally/{nomorTally}
|
*/

export const deleteTally = async (dokumenId, nomorTally) => {
    const response = await api.delete(
        `${BASE_URL}/${dokumenId}/tally/${nomorTally}`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| UPDATE DRAFT
|--------------------------------------------------------------------------
|
| Backend:
|
| PUT /api/posrajang/timbang-awal/{id}/draft
|
*/

export const updateDraftTimbangAwal = async (
    dokumenId,
    payload
) => {
    const response = await api.put(
        `${BASE_URL}/${dokumenId}/draft`,
        payload
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| FINISH
|--------------------------------------------------------------------------
|
| Backend:
|
| POST /api/posrajang/timbang-awal/{id}/finish
|
*/

export const finishTimbangAwal = async (dokumenId) => {
    const response = await api.post(
        `${BASE_URL}/${dokumenId}/finish`
    );

    return response.data;
};


/*
|--------------------------------------------------------------------------
| PRINT
|--------------------------------------------------------------------------
|
| Backend:
|
| GET /api/posrajang/timbang-awal/{id}/print
|
*/

export const getPrintTimbangAwalUrl = (dokumenId) => {
    return `${BASE_URL}/${dokumenId}/print`;
};


/*
|--------------------------------------------------------------------------
| DEFAULT EXPORT
|--------------------------------------------------------------------------
*/

const TimbangAwalRajangService = {
    connectAndInitTimbangAwal,
    recoveryTimbangAwal,
    getTimbangAwalSession,
    storeTally,
    deleteTally,
    updateDraftTimbangAwal,
    finishTimbangAwal,
    getPrintTimbangAwalUrl,
};

export default TimbangAwalRajangService;