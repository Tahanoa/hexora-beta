// ===== Home / Landing Page (بعد از لاگین) =====

document.addEventListener('DOMContentLoaded', async function () {
    const session = await loadSession();
    const userStr = session ? JSON.stringify(session) : null;
    if (!userStr) {
        window.location.href = '/login';
        return;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
    }

    const isAdmin = Array.isArray(user.roles) && user.roles.includes('ADMIN');

    document.getElementById('userNameText').textContent = user.username || 'کاربر';

    const actionsContainer = document.getElementById('actionButtons');
    actionsContainer.innerHTML = '';

    if (isAdmin) {
        actionsContainer.innerHTML += `
            <a href="/dashboard"
               class="bg-[#00C26E] hover:bg-[#4DFFB8] text-[#0B0F14] font-semibold rounded-xl px-6 py-4 transition-all duration-300 flex items-center justify-center gap-2">
                <i class="fas fa-chart-pie"></i> ورود به داشبورد مدیریت
            </a>
            <a href="/profile"
               class="bg-[#1A1F26] hover:bg-[#2A2F36] text-[#F5F7FA] font-semibold rounded-xl px-6 py-4 transition-all duration-300 border border-[rgba(0,194,110,0.08)] flex items-center justify-center gap-2">
                <i class="fas fa-user"></i> پروفایل من
            </a>
        `;
    } else {
        actionsContainer.innerHTML += `
            <div class="col-span-full bg-[#1A1F26] rounded-xl p-4 text-[#8A94A6] text-sm border border-[rgba(255,255,255,0.05)]">
                <i class="fas fa-info-circle ml-1"></i>
                حساب شما دسترسی به پنل مدیریت را ندارد.
            </div>
        `;
    }

    document.getElementById('logoutBtn').addEventListener('click', async function () {
        try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
        } catch (e) {
            console.error('Logout error:', e);
        }
        localStorage.removeItem('user');
        window.location.href = '/login';
    });
});