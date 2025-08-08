// Utility untuk API calls ke backend yang terpisah
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const apiCall = async (endpoint, options = {}) => {
  const url = `${BACKEND_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json();
};

export const apiGet = (endpoint) => apiCall(endpoint);
export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});
export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const apiDelete = (endpoint) => apiCall(endpoint, {
  method: 'DELETE',
});

// Axios wrapper untuk kompatibilitas
export const axiosGet = async (endpoint, config = {}) => {
  let url = `${BACKEND_URL}${endpoint}`;
  
  // Handle query parameters
  if (config.params) {
    const searchParams = new URLSearchParams();
    Object.keys(config.params).forEach(key => {
      if (config.params[key] !== undefined && config.params[key] !== null && config.params[key] !== '') {
        searchParams.append(key, config.params[key]);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return { data: await response.json() };
};

export const axiosPost = async (endpoint, data = {}, config = {}) => {
  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return { data: await response.json() };
};

export const axiosPut = async (endpoint, data = {}, config = {}) => {
  const url = `${BACKEND_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return { data: await response.json() };
};
