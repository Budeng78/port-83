import axios from "axios";

/**
 * Gunakan host yang sedang digunakan browser.
 *
 * Support:
 *
 * LAN:
 *   http://192.168.4.222:83
 *   http://192.168.10.51:83
 *
 * DOMAIN:
 *   https://tpa.bintangkecil.sch.id
 *   https://tes.tpabintangkecil.sch.id
 */

const rootURL = window.location.origin;

const api = axios.create({
  baseURL: `${rootURL}/api`,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});


/**
 * REQUEST INTERCEPTOR
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (
      token &&
      token !== "undefined" &&
      token !== "null"
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


/**
 * SANCTUM CSRF COOKIE
 *
 * Otomatis menggunakan host yang sedang dibuka.
 */
export const csrf = async () => {
  return axios.get(
    `${rootURL}/sanctum/csrf-cookie`,
    {
      withCredentials: true,
    }
  );
};


/**
 * RESPONSE INTERCEPTOR
 */
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const { response: res } = error;

    /**
     * Validation Error
     */
    if (res?.status === 422) {
      const validationErrors = res.data?.errors;

      if (validationErrors) {
        const errorMessages = Object.values(validationErrors)
          .flat()
          .join("\n");

        alert(`Input Tidak Valid:\n${errorMessages}`);
      }

      return Promise.reject(error);
    }

    /**
     * Session expired / unauthorized
     */
    if (res && (res.status === 401 || res.status === 419)) {
      const currentPath =
        window.location.pathname.toLowerCase();

      if (!currentPath.includes("/login")) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");

        window.location.replace(
          "/app/login?reason=session_expired"
        );
      }
    }

    return Promise.reject(error);
  }
);

export default api;