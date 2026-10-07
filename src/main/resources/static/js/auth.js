// ===== Auth Handler =====

// ===== Toast System =====
function showToast(type, title, message, duration = 4000) {
    title=window.HexoraI18n.tr(title);message=window.HexoraI18n.tr(message);
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '<i class="fas fa-check-circle"></i>',
        error: '<i class="fas fa-times-circle"></i>',
        warning: '<i class="fas fa-exclamation-triangle"></i>',
        info: '<i class="fas fa-info-circle"></i>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, duration);
}

// ===== Password Toggle =====
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const icon = document.getElementById('passwordToggleIcon');
    const button = icon.closest('button');
    const showingPassword = passwordInput.type === 'password';

    if (showingPassword) {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }

    button.setAttribute('aria-pressed', String(showingPassword));
    button.setAttribute('aria-label', getCurrentLang()==='en'?(showingPassword?'Hide password':'Show password'):(showingPassword?'پنهان کردن رمز عبور':'نمایش رمز عبور'));
}

// ===== Get Language =====
function getCurrentLang() {
    return localStorage.getItem('hexora-lang') || 'fa';
}

// ===== Login Handler =====
async function handleLogin(form) {
    const button = document.getElementById('loginButton');
    const formData = new FormData(form);
    const lang = getCurrentLang();

    button.classList.add('loading');
    button.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usernameOrEmail: formData.get('usernameOrEmail'),
                password: formData.get('password')
            })
        });

        const result = await response.json();
        

        if (response.ok && result.success) {
            localStorage.setItem('accessToken', result.data.accessToken);
            localStorage.setItem('user', JSON.stringify(result.data.user));

            const successMsg = lang === 'fa'
                ? 'به پنل مدیریت خوش آمدید'
                : 'Welcome to the dashboard';
            showToast('success', lang === 'fa' ? 'موفق!' : 'Success!', successMsg);

            setTimeout(() => {
                const pending=sessionStorage.getItem('hexora-service-request');
                window.location.href = pending&&/^\d+$/.test(pending)?'/contact?service='+encodeURIComponent(pending):'/';
            }, 500);
        } else {
            const errorMsg = window.HexoraI18n.tr(result.message) || (lang === 'fa'
                ? 'نام کاربری یا رمز عبور اشتباه است'
                : 'Invalid username or password');
            showToast('error', lang === 'fa' ? 'خطا' : 'Error', errorMsg);
            button.classList.remove('loading');
            button.disabled = false;
        }
    } catch (error) {
        console.error('Login error:', error);
        const errorMsg = lang === 'fa'
            ? 'مشکل در ارتباط با سرور'
            : 'Server connection error';
        showToast('error', lang === 'fa' ? 'خطا' : 'Error', errorMsg);
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ===== Register Handler =====
async function handleRegister(form) {
    const button = document.getElementById('registerButton');
    const formData = new FormData(form);
    const lang = getCurrentLang();

    const password = formData.get('password');
    if (password.length < 8) {
        const errorMsg = lang === 'fa'
            ? 'رمز عبور باید حداقل ۸ کاراکتر باشد'
            : 'Password must be at least 8 characters';
        showToast('error', lang === 'fa' ? 'خطا' : 'Error', errorMsg);
        return;
    }

    button.classList.add('loading');
    button.disabled = true;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password')
            })
        });

        const result = await response.json();

        if (response.status === 201 && result.success) {
            const successMsg = lang === 'fa'
                ? 'ثبت نام با موفقیت انجام شد'
                : 'Registration completed successfully';
            showToast('success', lang === 'fa' ? 'موفق!' : 'Success!', successMsg);

            form.reset();

            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            const errorMsg = window.HexoraI18n.tr(result.message) || (lang === 'fa'
                ? 'مشکل در ثبت نام'
                : 'Registration failed');
            showToast('error', lang === 'fa' ? 'خطا' : 'Error', errorMsg);
            button.classList.remove('loading');
            button.disabled = false;
        }
    } catch (error) {
        console.error('Register error:', error);
        const errorMsg = lang === 'fa'
            ? 'مشکل در ارتباط با سرور'
            : 'Server connection error';
        showToast('error', lang === 'fa' ? 'خطا' : 'Error', errorMsg);
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// ===== Form Submission =====
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin(this);
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegister(this);
        });
    }
});
