let mode = 'login';

const nameGroup = document.getElementById('name-group');
const submitBtn = document.getElementById('submit-btn');
const authMsg = document.getElementById('auth-msg');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');

showLoginBtn.addEventListener('click', () => {
  mode = 'login';
  nameGroup.style.display = 'none';
  submitBtn.textContent = 'Login';
  showLoginBtn.classList.remove('btn-secondary');
  showRegisterBtn.classList.add('btn-secondary');
  authMsg.textContent = '';
});

showRegisterBtn.addEventListener('click', () => {
  mode = 'register';
  nameGroup.style.display = 'block';
  submitBtn.textContent = 'Register';
  showRegisterBtn.classList.remove('btn-secondary');
  showLoginBtn.classList.add('btn-secondary');
  authMsg.textContent = '';
});

document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  authMsg.textContent = '';

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const endpoint = mode === 'register' ? '/auth/register' : '/auth/login';
  const body = mode === 'register' ? { name, email, password } : { email, password };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      authMsg.style.color = '#dc2626';
      authMsg.textContent = data.error || 'Authentication failed.';
      return;
    }

    setAuth(data.token, data.user);
    authMsg.style.color = '#15803d';
    authMsg.textContent = `${data.message} Redirecting...`;
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 700);
  } catch (err) {
    authMsg.style.color = '#dc2626';
    authMsg.textContent = 'Network error.';
  }
});