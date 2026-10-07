// ===== Profile Page JavaScript =====

// ===== Translations =====
const translations = {
    fa: {
        profileTitle: 'پروفایل',
        profileSubtitle: 'مدیریت اطلاعات شخصی و تنظیمات',
        fullNameLabel: 'نام کامل',
        brandNameLabel: 'نام برند',
        bioLabel: 'بیوگرافی',
        locationLabel: 'موقعیت مکانی',
        saveProfileBtn: 'ذخیره تغییرات',
        changePasswordTitle: 'تغییر رمز عبور',
        currentPasswordLabel: 'رمز عبور فعلی',
        newPasswordLabel: 'رمز عبور جدید',
        confirmPasswordLabel: 'تکرار رمز عبور جدید',
        changePasswordBtnText: 'تغییر رمز عبور',
        securityTitle: 'تنظیمات امنیتی',
        twoFactorLabel: 'احراز هویت دو مرحله‌ای',
        twoFactorDesc: 'افزایش امنیت حساب کاربری',
        deleteAccountLabel: 'حذف حساب کاربری',
        deleteAccountDesc: 'این عمل غیرقابل بازگشت است',
        deleteAccountBtn: 'حذف',
        emailLabel: 'ایمیل',
        usernameLabel: 'نام کاربری',
        joinedLabel: 'تاریخ عضویت',
        roleLabel: 'نقش‌ها',
        statProjectsLabel: 'پروژه',
        statSkillsLabel: 'مهارت',
        statExperiencesLabel: 'سابقه',
        saveSuccess: 'اطلاعات با موفقیت ذخیره شد',
        saveError: 'خطا در ذخیره اطلاعات',
        passwordChangeSuccess: 'رمز عبور با موفقیت تغییر کرد',
        passwordChangeError: 'خطا در تغییر رمز عبور',
        passwordMismatch: 'رمز عبور جدید و تکرار آن مطابقت ندارند',
        currentPasswordRequired: 'رمز عبور فعلی را وارد کنید',
        newPasswordRequired: 'رمز عبور جدید را وارد کنید',
        confirmPasswordRequired: 'تکرار رمز عبور را وارد کنید',
        deleteConfirm: 'آیا از حذف حساب کاربری خود مطمئن هستید؟ این عمل غیرقابل بازگشت است.',
        deleteSuccess: 'حساب کاربری با موفقیت حذف شد',
        deleteError: 'خطا در حذف حساب کاربری',
        avatarUploadSuccess: 'تصویر پروفایل با موفقیت آپلود شد',
        avatarUploadError: 'خطا در آپلود تصویر',
        invalidImage: 'فرمت تصویر نامعتبر است. فقط JPEG, PNG, GIF, WEBP مجاز هستند.',
        imageTooLarge: 'حجم تصویر باید کمتر از 5 مگابایت باشد',
        langText: 'فارسی',
        logout: 'خروج',
        logoutConfirm: 'آیا مطمئن هستید؟',
        logoutSuccess: 'با موفقیت خارج شدید',
        sessionExpired: 'نشست شما منقضی شده است',
        online: 'آنلاین',
        offline: 'آفلاین',
        busy: 'مشغول'
    },
    en: {
        profileTitle: 'Profile',
        profileSubtitle: 'Manage personal information and settings',
        fullNameLabel: 'Full Name',
        brandNameLabel: 'Brand Name',
        bioLabel: 'Bio',
        locationLabel: 'Location',
        saveProfileBtn: 'Save Changes',
        changePasswordTitle: 'Change Password',
        currentPasswordLabel: 'Current Password',
        newPasswordLabel: 'New Password',
        confirmPasswordLabel: 'Confirm New Password',
        changePasswordBtnText: 'Change Password',
        securityTitle: 'Security Settings',
        twoFactorLabel: 'Two-Factor Authentication',
        twoFactorDesc: 'Enhance account security',
        deleteAccountLabel: 'Delete Account',
        deleteAccountDesc: 'This action is irreversible',
        deleteAccountBtn: 'Delete',
        emailLabel: 'Email',
        usernameLabel: 'Username',
        joinedLabel: 'Joined',
        roleLabel: 'Roles',
        statProjectsLabel: 'Projects',
        statSkillsLabel: 'Skills',
        statExperiencesLabel: 'Experiences',
        saveSuccess: 'Information saved successfully',
        saveError: 'Error saving information',
        passwordChangeSuccess: 'Password changed successfully',
        passwordChangeError: 'Error changing password',
        passwordMismatch: 'Passwords do not match',
        currentPasswordRequired: 'Current password is required',
        newPasswordRequired: 'New password is required',
        confirmPasswordRequired: 'Confirm password is required',
        deleteConfirm: 'Are you sure you want to delete your account? This action is irreversible.',
        deleteSuccess: 'Account deleted successfully',
        deleteError: 'Error deleting account',
        avatarUploadSuccess: 'Profile image uploaded successfully',
        avatarUploadError: 'Error uploading profile image',
        invalidImage: 'Invalid image format. Only JPEG, PNG, GIF, WEBP are allowed.',
        imageTooLarge: 'Image size must be less than 5MB',
        langText: 'English',
        logout: 'Logout',
        logoutConfirm: 'Are you sure?',
        logoutSuccess: 'Logged out successfully',
        sessionExpired: 'Your session has expired',
        online: 'Online',
        offline: 'Offline',
        busy: 'Busy'
    }
};

let currentProfile = {};
let currentLang = localStorage.getItem('hexora-lang') || 'fa';

// ===== DOM Ready =====
const releaseInitialLoader = window.holdPageLoader?.() || (() => {});
document.addEventListener('DOMContentLoaded', async function() {
    const session = await loadSession();
    if (!session || !session.roles.includes('ADMIN')) { window.location.href = '/login'; return; }
    setupUserInfo();
    setupNavigation();
    applyLanguage(currentLang);
    await loadProfileData();
    releaseInitialLoader();
    loadUserAvatar(); // ✅ بارگذاری Avatar
    setupEventListeners();
    document.querySelectorAll('.current-year').forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
});

// ===== Check Authentication =====
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login';
        return;
    }
}

// ===== Setup User Info =====
function setupUserInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        document.getElementById('userName').textContent = user.username || 'کاربر';
        document.getElementById('userInitial').textContent = (user.username || 'کاربر')[0].toUpperCase();
        document.getElementById('profileFullName').textContent = user.username || 'کاربر';

        const isAdmin = user.roles && user.roles.includes('ADMIN');
        const roleText = isAdmin ? 'ادمین' : 'کاربر';
        document.getElementById('userRole').textContent = roleText;
        document.getElementById('profileRole').innerHTML = window.HexoraI18n.markup(roleText);
        document.getElementById('profileEmail').textContent = user.email || '---';
        document.getElementById('profileUsername').textContent = user.username || '---';
        document.getElementById('profileRoles').innerHTML = user.roles ? user.roles.map(role=>window.HexoraI18n.markup(role==='ADMIN'?'ادمین':role==='USER'?'کاربر':role)).join(', ') : '---';

        // Set avatar initial
        const initial = (user.username || 'کاربر')[0].toUpperCase();
        document.getElementById('avatarText').textContent = initial;

        // Set joined date (mock - should come from server)
        const joined=document.getElementById('profileJoined'),date=new Date(user.createdAt);
        joined.setAttribute('data-i18n-date',user.createdAt||'');
        joined.textContent=Number.isNaN(+date)?'—':date.toLocaleDateString(currentLang==='en'?'en-US':'fa-IR');

    } catch (e) {
        console.error('Error parsing user data:', e);
    }
}

// ===== Setup Navigation =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Allow navigation
            } else if (href === '#') {
                e.preventDefault();
                const t = translations[currentLang];
                showToast('info', 'در حال توسعه', 'این بخش به زودی افزوده خواهد شد');
            }
        });
    });
}

// ===== Language =====
function toggleLanguage() {
    currentLang = currentLang === 'fa' ? 'en' : 'fa';
    localStorage.setItem('hexora-lang', currentLang);
    applyLanguage(currentLang);
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
}

function applyLanguage(lang) {
    const t = translations[lang];
    document.getElementById('pageTitle').textContent = t.profileTitle;
    document.getElementById('pageSubtitle').textContent = t.profileSubtitle;
    document.getElementById('fullNameLabel').textContent = t.fullNameLabel;
    document.getElementById('brandNameLabel').textContent = t.brandNameLabel;
    document.getElementById('bioLabel').textContent = t.bioLabel;
    document.getElementById('locationLabel').textContent = t.locationLabel;
    document.getElementById('saveProfileBtn').textContent = t.saveProfileBtn;
    document.getElementById('changePasswordTitle').textContent = t.changePasswordTitle;
    document.getElementById('currentPasswordLabel').textContent = t.currentPasswordLabel;
    document.getElementById('newPasswordLabel').textContent = t.newPasswordLabel;
    document.getElementById('confirmPasswordLabel').textContent = t.confirmPasswordLabel;
    document.getElementById('changePasswordBtnText').textContent = t.changePasswordBtnText;
    document.getElementById('securityTitle').textContent = t.securityTitle;
    document.getElementById('twoFactorLabel').textContent = t.twoFactorLabel;
    document.getElementById('twoFactorDesc').textContent = t.twoFactorDesc;
    document.getElementById('deleteAccountLabel').textContent = t.deleteAccountLabel;
    document.getElementById('deleteAccountDesc').textContent = t.deleteAccountDesc;
    document.getElementById('deleteAccountBtn').textContent = t.deleteAccountBtn;
    document.getElementById('emailLabel').textContent = t.emailLabel;
    document.getElementById('usernameLabel').textContent = t.usernameLabel;
    document.getElementById('joinedLabel').textContent = t.joinedLabel;
    document.getElementById('roleLabel').textContent = t.roleLabel;
    document.getElementById('statProjectsLabel').textContent = t.statProjectsLabel;
    document.getElementById('statSkillsLabel').textContent = t.statSkillsLabel;
    document.getElementById('statExperiencesLabel').textContent = t.statExperiencesLabel;
    document.getElementById('profileLangText').textContent = t.langText;
}

// Sidebar state is shared by every management page.
function toggleSidebar() { window.HexoraAdminShell.toggle(); }
function setSidebarState(open) { window.HexoraAdminShell.setOpen(open); }

// ===== Fetch API with FormData support =====
async function fetchAPI(url, options = {}) {
    try {
        // Check if body is FormData
        const isFormData = options.body instanceof FormData;

        // Prepare headers
        const headers = {
            ...options.headers
        };

        // Only set Content-Type to JSON if body is NOT FormData
        if (!isFormData && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers: headers
        });

        if (response.status === 401) {
            const t = translations[currentLang];
            showToast('error', t.sessionExpired || 'نشست شما منقضی شده است', '');
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            setTimeout(() => window.location.href = '/login', 1500);
            throw new Error('Unauthorized');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
}

// ===== Load Profile Data =====
async function loadProfileData() {
    try {
        // Load profile data from API
        const profile = await fetchAPI('/api/profile/public');
        if (profile && profile.success) {
            const data = profile.data;
            currentProfile = data;
            const savedUser=JSON.parse(localStorage.getItem('user')||'null');if(savedUser){savedUser.avatarId=data.avatarId;localStorage.setItem('user',JSON.stringify(savedUser));}loadUserAvatar();
            document.getElementById('fullName').value = data.fullName || '';
            document.getElementById('brandName').value = data.brandName || '';
            const fields = ['fullName','brandName','title','email','phone','location','bio','shortDescription','aboutText','journeyText','githubUrl','linkedinUrl','instagramUrl','workingStatus'];
            fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = data[id] || ''; });
        }

        // Load stats
        const [projects, skills, experiences] = await Promise.all([
            fetchAPI('/api/projects/public/stats'),
            fetchAPI('/api/skills/public'),
            fetchAPI('/api/experience/public')
        ]);

        document.getElementById('statProjects').textContent = projects?.data?.total || 0;
        document.getElementById('statSkills').textContent = skills?.data?.length || 0;
        document.getElementById('statExperiences').textContent = experiences?.data?.length || 0;

    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

// ================================================================
// ✅ راه حل 4: نمایش با URL (ساده‌ترین روش)
// ================================================================

// ===== نمایش Avatar از URL =====
function loadUserAvatar() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.avatarId) {
            const avatar = document.getElementById('profileAvatar');
            const avatarImg = document.getElementById('avatarImage');
            const avatarText = document.getElementById('avatarText');

            // نمایش تصویر با URL
            if (avatarImg) {
                avatarImg.src = `/api/media/public/${user.avatarId}`;
                avatarImg.style.display = 'block';
                avatarText.style.display = 'none';
            } else {
                // اگر img وجود ندارد، مستقیماً در div قرار می‌دهیم
                avatar.innerHTML = `<img src="/api/media/public/${user.avatarId}" alt="Avatar" class="w-full h-full rounded-full object-cover">`;
            }
        }
    } catch (e) {
        console.error('Error loading avatar:', e);
    }
}

// ===== Upload Avatar =====
async function uploadAvatar(input) {
    const file = input.files?.[0];
    if (!file) return;
    const t = translations[currentLang];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { showToast('error', t.invalidImage || 'فرمت تصویر نامعتبر است', ''); input.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { showToast('error', t.imageTooLarge || 'حجم تصویر باید کمتر از ۵ مگابایت باشد', ''); input.value = ''; return; }
    const avatar = document.getElementById('profileAvatar');
    avatar.innerHTML = `<i class="fas fa-spinner fa-spin text-2xl text-[#00C26E]" aria-label="${window.HexoraI18n.tr('در حال آپلود')}"></i>`;
    try {
        const formData = new FormData(); formData.append('file', file, file.name);
        const result = await fetchAPI('/api/profile/avatar', { method: 'POST', body: formData });
        if (!result?.success || !result.data?.avatarId) throw new Error(result?.message || 'Upload failed');
        const avatarId = result.data.avatarId;
        window.dispatchEvent(new Event('profile-avatar-updated'));
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) { user.avatarId = avatarId; localStorage.setItem('user', JSON.stringify(user)); }
        avatar.innerHTML = `<img src="/api/media/public/${avatarId}?v=${Date.now()}" alt="${window.HexoraI18n.tr('تصویر پروفایل')}" class="w-full h-full rounded-full object-cover">`;
        showToast('success', t.avatarUploadSuccess || 'تصویر پروفایل با موفقیت آپلود شد', '');
    } catch (error) {
        console.error('Upload error:', error);
        showToast('error', t.avatarUploadError || 'خطا در آپلود تصویر', error.message || '');
        resetAvatar();
    } finally { input.value = ''; }
}

// ===== Reset Avatar =====
function resetAvatar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const initial = (user?.username || 'کاربر')[0].toUpperCase();
    const avatar = document.getElementById('profileAvatar');
    avatar.innerHTML = `<span id="avatarText" class="text-4xl font-bold">${initial}</span>`;
}


// ===== Password Strength =====
document.getElementById('newPassword')?.addEventListener('input', function() {
    const password = this.value;
    const container = document.getElementById('passwordStrength');
    const bars = [
        document.getElementById('strengthBar1'),
        document.getElementById('strengthBar2'),
        document.getElementById('strengthBar3'),
        document.getElementById('strengthBar4')
    ];
    const text = document.getElementById('strengthText');

    if (password.length === 0) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

    const colors = ['#EF4444', '#FBBF24', '#4DFFB8', '#00C26E'];
    const labels = currentLang === 'fa' ? ['ضعیف', 'متوسط', 'خوب', 'قوی'] : ['Weak', 'Medium', 'Good', 'Strong'];

    bars.forEach((bar, index) => {
        if (index < strength) {
            bar.style.width = '100%';
            bar.style.background = colors[index];
            bar.parentElement.style.background = 'transparent';
        } else {
            bar.style.width = '0%';
            bar.style.background = 'transparent';
            bar.parentElement.style.background = 'var(--hexora-dark-gray)';
        }
    });

    text.textContent = labels[strength - 1] || labels[0];
    text.style.color = colors[strength - 1] || colors[0];
});

// ===== Toggle Password Visibility =====
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + 'Icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// ===== Update Profile =====
document.getElementById('profileForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const button = document.getElementById('updateProfileBtn');
    const t = translations[currentLang];

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const data = {avatarId:currentProfile.avatarId||null,profileImage:currentProfile.profileImage||null};
        ['fullName','brandName','title','email','phone','location','bio','shortDescription','aboutText','journeyText','githubUrl','linkedinUrl','instagramUrl','workingStatus']
            .forEach(id => { const el = document.getElementById(id); if (el) data[id] = el.value.trim(); });

        const result = await fetchAPI('/api/profile/me', {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        if (result.success) {
            showToast('success', t.saveSuccess, '');
            loadProfileData();
        } else {
            showToast('error', t.saveError, window.HexoraI18n.tr(result.message) || '');
        }
    } catch (error) {
        showToast('error', t.saveError, error.message || '');
    } finally {
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-save"></i> ${t.saveProfileBtn}`;
    }
});

// ===== Change Password =====
document.getElementById('passwordForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const button = document.getElementById('changePasswordBtn');
    const t = translations[currentLang];

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword) {
        showToast('error', t.currentPasswordRequired, '');
        return;
    }

    if (!newPassword) {
        showToast('error', t.newPasswordRequired, '');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('error', t.passwordMismatch, '');
        return;
    }

    if (newPassword.length < 8) {
        showToast('error', window.HexoraI18n.tr('رمز عبور جدید باید حداقل 8 کاراکتر باشد'), '');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const result = await fetchAPI('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (result.success) {
            showToast('success', t.passwordChangeSuccess, '');
            document.getElementById('passwordForm').reset();
            document.getElementById('passwordStrength').classList.add('hidden');
        } else {
            showToast('error', t.passwordChangeError, window.HexoraI18n.tr(result.message) || '');
        }
    } catch (error) {
        showToast('error', t.passwordChangeError, error.message || '');
    } finally {
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-key"></i> ${t.changePasswordBtnText}`;
    }
});

// ===== Two-Factor Toggle =====
document.getElementById('twoFactorToggle')?.addEventListener('change', function() {
    const t = translations[currentLang];
    if (this.checked) {
        showToast('info', window.HexoraI18n.tr('در حال توسعه'), window.HexoraI18n.tr('احراز هویت دو مرحله‌ای به زودی فعال خواهد شد'));
        setTimeout(() => this.checked = false, 1000);
    }
});

// ===== Delete Account =====
function confirmDeleteAccount() {
    const t = translations[currentLang];
    if (confirm(t.deleteConfirm)) {
        showToast('warning', window.HexoraI18n.tr('در حال توسعه'), window.HexoraI18n.tr('حذف حساب کاربری به زودی امکان‌پذیر خواهد بود'));
    }
}

// ===== Toast System =====
function showToast(type, title, message, duration = 4000) {
    title=window.HexoraI18n.tr(title);message=window.HexoraI18n.tr(message);
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '<i class="fas fa-check-circle text-[#00C26E]"></i>',
        error: '<i class="fas fa-times-circle text-[#EF4444]"></i>',
        warning: '<i class="fas fa-exclamation-triangle text-[#FBBF24]"></i>',
        info: '<i class="fas fa-info-circle text-[#3B82F6]"></i>'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-content">
            ${title ? `<div class="toast-title">${title}</div>` : ''}
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.closest('.toast').remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 400);
        }
    }, duration);
}

// ===== Logout =====
document.getElementById('logoutBtn')?.addEventListener('click', async function(e) {
    e.preventDefault();
    const t = translations[currentLang];

    if (!confirm(t.logoutConfirm)) return;

    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
        });
    } catch (error) {
        console.error('Logout error:', error);
    }

    localStorage.removeItem('user');
    showToast('success', t.logoutSuccess, '');
    setTimeout(() => window.location.href = '/login', 500);
});

// ===== Event Listeners =====
function setupEventListeners() {
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') setSidebarState(false);
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) setSidebarState(false);
    });
}

// ===== Expose functions globally =====
window.toggleSidebar = toggleSidebar;
window.toggleLanguage = toggleLanguage;
window.togglePasswordVisibility = togglePasswordVisibility;
window.uploadAvatar = uploadAvatar;
window.confirmDeleteAccount = confirmDeleteAccount;
window.showToast = showToast;

// Save availability independently of unrelated profile field validation.
document.getElementById('workingStatus')?.addEventListener('change', async event => {
 const select=event.currentTarget, previous=currentProfile?.workingStatus||'AVAILABLE';
 if(!currentProfile?.id){showToast('error',window.HexoraI18n.tr('ابتدا پروفایل را ذخیره کنید'),'');select.value=previous;return;}
 select.disabled=true;
 try {const result=await fetchAPI(`/api/profile/${currentProfile.id}/status?status=${encodeURIComponent(select.value)}`,{method:'PATCH'});if(!result.success)throw Error(result.message||window.HexoraI18n.tr('ذخیره ناموفق بود'));currentProfile.workingStatus=result.data.workingStatus;showToast('success',window.HexoraI18n.tr('وضعیت همکاری ذخیره شد'),'');}
 catch(error){select.value=previous;showToast('error',window.HexoraI18n.tr('خطا در ذخیره وضعیت'),error.message);}
 finally{select.disabled=false;}
});
