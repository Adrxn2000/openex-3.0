const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export function register(username, password) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function login(username, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function getBalance(token) {
  return request('/api/wallets/balance', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getAllBalances(token) {
  return request('/api/wallets/balances', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function deposit(token, amount) {
  return request('/api/wallets/deposit', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });
  
}

export function placeOrder(token, side, orderType, price, quantity) {
  return request('/api/orders', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({ side, orderType, price, quantity }),
  });
}
