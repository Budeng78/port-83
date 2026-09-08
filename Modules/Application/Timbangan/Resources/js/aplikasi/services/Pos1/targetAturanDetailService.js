import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/timbangan/pos1/aturan';

const targetAturanDetailService = {
    getAll: (targetAturanId) =>
        axios.get(`${BASE_URL}/${targetAturanId}/detail`),

    getById: (targetAturanId, detailId) =>
        axios.get(`${BASE_URL}/${targetAturanId}/detail/${detailId}`),

    create: (targetAturanId, data) =>
        axios.post(
            `${BASE_URL}/${targetAturanId}/detail`,
            data
        ),

    update: (targetAturanId, detailId, data) =>
        axios.put(
            `${BASE_URL}/${targetAturanId}/detail/${detailId}`,
            data
        ),

    delete: (targetAturanId, detailId) =>
        axios.delete(
            `${BASE_URL}/${targetAturanId}/detail/${detailId}`
        ),
};

export default targetAturanDetailService;