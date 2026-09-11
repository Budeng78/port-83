
import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/timbangan/pos1/report';

const getAll = () => {
    return axios.get(BASE_URL);
};

const getByTarget = (targetId) => {
    return axios.get(
        `${BASE_URL}/${targetId}`
    );
};

export default {
    getAll,
    getByTarget,
};
