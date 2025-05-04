const tokenKey = 'token';

const spinner = document.getElementById('spinner');

async function login(e) {
  e.preventDefault();
  const res = await fetch('/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      username: e.target.username.value,
      password: e.target.password.value
    })
  });
  const data = await res.json();
  if (res.ok && data.token) {
    localStorage.setItem(tokenKey, data.token);
    location.href = '/search.html';
  } else {
    document.getElementById('loginError').textContent = data.error || 'Login failed';
  }
}

async function searchHandler(e) {
  e.preventDefault();
  spinner.classList.remove('hidden');
  try {
    const token = localStorage.getItem(tokenKey);
    const q = e.target.q.value;
    const res = await fetch(`/search?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    document.getElementById('searchResult').textContent = JSON.stringify(await res.json(), null, 2);
  } finally {
    spinner.classList.add('hidden');
  }
}

async function askHandler(e) {
  e.preventDefault();
  spinner.classList.remove('hidden');
  try {
    const token = localStorage.getItem(tokenKey);
    const q = e.target.q.value;
    const res = await fetch(`/ask?q=${encodeURIComponent(q)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    document.getElementById('askResult').textContent = JSON.stringify(await res.json(), null, 2);
  } finally {
    spinner.classList.add('hidden');
  }
}

function logout() {
  localStorage.removeItem(tokenKey);
  location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', searchHandler);
  }
  const askForm = document.getElementById('askForm');
  if (askForm) {
    askForm.addEventListener('submit', askHandler);
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
