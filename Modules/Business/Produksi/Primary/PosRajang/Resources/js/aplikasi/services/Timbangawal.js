import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/api/posrajang/timbangawal';

const apiClient = api.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

export const Timbangawal = {
    initiateTimbanganDraft: async (data) => {
        const response = await apiClient.post('/connect-and-init', data);
        return response.data;
    },

    cariBatch: async (data) => {
        const response = await apiClient.post('/cari-batch', data);
        return response.data;
    },

    tambahTally: async (data) => {
        const response = await apiClient.post('/karung', data);
        return response.data;
    },

    deleteTally: async (data) => {
        const response = await apiClient.delete('/karung', { data });
        return response.data;
    },

    updateDraft: async (data) => {
        const response = await apiClient.post('/update-draft', data);
        return response.data;
    },

    commitTimbangan: async (data) => {
        const response = await apiClient.post('/finish-session', data);
        return response.data;
    },

    printBatch: async (id) => {
        const response = await apiClient.get(`/print/${id}`, {
            responseType: 'text',
        });
        return response.data;
    },
};