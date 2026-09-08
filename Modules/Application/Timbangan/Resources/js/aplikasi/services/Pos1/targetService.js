import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/timbangan/pos1/target';

const targetService = {
    getAll: () =>
        axios.get(BASE_URL),

    getById: (id) =>
        axios.get(`${BASE_URL}/${id}`),

    create: (data) =>
        axios.post(BASE_URL, data),

    update: (id, data) =>
        axios.put(`${BASE_URL}/${id}`, data),

    delete: (id) =>
        axios.delete(`${BASE_URL}/${id}`),
};

export default targetService;