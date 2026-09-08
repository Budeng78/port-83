import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/timbangan/pos1';

const targetAturanService = {
    getAll: (targetId) =>
        axios.get(
            `${BASE_URL}/target/${targetId}/aturan`
        ),

    getById: (id) =>
        axios.get(
            `${BASE_URL}/aturan/${id}`
        ),

    create: (data) =>
        axios.post(
            `${BASE_URL}/aturan`,
            data
        ),

    update: (id, data) =>
        axios.put(
            `${BASE_URL}/aturan/${id}`,
            data
        ),

    delete: (id) =>
        axios.delete(
            `${BASE_URL}/aturan/${id}`
        ),
};

export default targetAturanService;