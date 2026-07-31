import axios from "axios";

// 1. Definisikan URL berdasarkan Hostname
const baseURL =
  window.location.hostname === "192.168.1.102"
    ? "http://192.168.1.102:8000/api"
    : "https://tes.tpabintangkecil.sch.id/api";

// 2. Buat Instance Axios
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

/**
 * REQUEST INTERCEPTOR: Wajib ada agar token terkirim otomatis di header
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && token !== 'undefined' && token !== 'null') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * CSRF Cookie - Penting untuk Sanctum
 */
export const csrf = async () => {
  const rootURL = window.location.hostname === "192.168.1.102"
    ? "http://192.168.1.102:8000"
    : "https://tes.tpabintangkecil.sch.id";
    
  return await axios.get(`${rootURL}/sanctum/csrf-cookie`, { withCredentials: true });
};

/**
 * Response Interceptor: Validasi (422) & Auto-Logout (401/419)
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response: res } = error;

    if (res && res.status === 422) {
      const validationErrors = res.data.errors;
      const errorMessages = Object.values(validationErrors).flat().join("\n");
      alert("Input Tidak Valid:\n" + errorMessages);
      return Promise.reject(error);
    }

    if (res && (res.status === 401 || res.status === 419)) {
      const currentPath = window.location.pathname.toLowerCase();
      if (!currentPath.includes('/login')) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_data");
          window.location.replace("/app/login?reason=session_expired");
      }
    }

    return Promise.reject(error);
  }
);

export default api;