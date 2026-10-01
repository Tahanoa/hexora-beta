// ===== Dashboard with All API Connections =====

const translations = {
    fa: {
        dashboardTitle: 'داشبورد', dashboardSubtitle: 'خلاصه وضعیت سیستم',
        statProjects: 'کل پروژه‌ها', statCompleted: 'پروژه‌های تکمیل شده',
        statMessages: 'پیام‌های خوانده نشده', statSkills: 'مهارت‌ها',
        chartStatus: 'وضعیت پروژه‌ها', chartSkills: 'مهارت‌ها بر اساس دسته‌بندی',
        recentProjects: 'پروژه‌های اخیر', viewAll: 'مشاهده همه',
        noProjects: 'هیچ پروژه‌ای یافت نشد', inProgress: 'در حال انجام',
        completed: 'تکمیل شده', planning: 'برنامه‌ریزی شده', langText: 'فارسی',
        logout: 'خروج', logoutConfirm: 'آیا مطمئن هستید؟', logoutSuccess: 'با موفقیت خارج شدید',
        errorLoading: 'برخی داده‌ها بارگذاری نشدند', sessionExpired: 'نشست شما منقضی شده است',
        noAccess: 'شما به برخی بخش‌ها دسترسی ندارید',
        refreshSuccess: 'داده‌ها به‌روزرسانی شدند', totalProjects: 'کل پروژه‌ها', totalSkills: 'کل مهارت‌ها',
        backend: 'بک‌اند', frontend: 'فرانت‌اند', database: 'پایگاه داده', devops: 'دواپس', tools: 'ابزارها',
        experiences: 'سوابق کاری', services: 'سرویس‌ها', statistics: 'آمارها'
    },
    en: {
        dashboardTitle: 'Dashboard', dashboardSubtitle: 'System Overview',
        statProjects: 'Total Projects', statCompleted: 'Completed Projects',
        statMessages: 'Unread Messages', statSkills: 'Skills',
        chartStatus: 'Project Status', chartSkills: 'Skills by Category',
        recentProjects: 'Recent Projects', viewAll: 'View All',
        noProjects: 'No projects found', inProgress: 'In Progress',
        completed: 'Completed', planning: 'Planning', langText: 'English',
        logout: 'Logout', logoutConfirm: 'Are you sure?', logoutSuccess: 'Logged out successfully',
        errorLoading: 'Some data failed to load', sessionExpired: 'Your session has expired',
        noAccess: 'You do not have access to some sections',
        refreshSuccess: 'Data updated successfully', totalProjects: 'Total Projects', totalSkills: 'Total Skills',
        backend: 'Backend', frontend: 'Frontend', database: 'Database', devops: 'DevOps', tools: 'Tools',
        experiences: 'Experiences', services: 'Services', statistics: 'Statistics'
    }
};

let currentLang = localStorage.getItem('hexora-lang') || 'fa';
let isLoading = false;
let loadTimeout = null;
let refreshInterval = null;

const releaseInitialLoader = window.holdPageLoader?.() || (() => {});
document.addEventListener('DOMContentLoaded', async function () {
    const session = await loadSession();
    if (!session || !session.roles.includes('ADMIN')) { window.location.href = '/login'; return; }
    setupUserInfo();
    setupNavigation();
    applyLanguage(currentLang);
    await loadDashboardData();
    releaseInitialLoader();
    setupEventListeners();
    updateTimestamp();
    startAutoRefresh();
    document.querySelectorAll('.current-year').forEach((element) => {
        element.textContent = new Date().getFullYear();
    });

    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
});

// ===== Check Authentication (+ Role) =====
function checkAuth() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login';
        return;
    }

    try {
        const user = JSON.parse(userStr);
        if (!user.username) {
            window.location.href = '/login';
            return;
        }
        // داشبورد فقط برای ادمین است؛ سایر نقش‌ها به صفحه‌ی خانه هدایت می‌شوند
        const isAdmin = Array.isArray(user.roles) && user.roles.includes('ADMIN');
        if (!isAdmin) {
            window.location.href = '/';
        }
    } catch (e) {
        window.location.href = '/login';
    }
}

// ===== Setup User Info =====
function setupUserInfo() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        document.getElementById('userName').textContent = user.username || 'کاربر';
        document.getElementById('userInitial').textContent = (user.username || 'کاربر')[0].toUpperCase();
        const isAdmin = user.roles && user.roles.includes('ADMIN');
        document.getElementById('userRole').textContent = isAdmin ? 'ادمین' : 'کاربر';
    } catch (e) {
        console.error('Error parsing user data:', e);
    }
}

// ===== Setup Navigation =====
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
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
    document.getElementById('pageTitle').textContent = t.dashboardTitle;
    document.getElementById('pageSubtitle').textContent = t.dashboardSubtitle;
    document.getElementById('statProjectsLabel').textContent = t.statProjects;
    document.getElementById('statCompletedLabel').textContent = t.statCompleted;
    document.getElementById('statMessagesLabel').textContent = t.statMessages;
    document.getElementById('statSkillsLabel').textContent = t.statSkills;
    document.getElementById('chartStatusTitle').textContent = t.chartStatus;
    document.getElementById('chartSkillsTitle').textContent = t.chartSkills;
    document.getElementById('recentProjectsTitle').textContent = t.recentProjects;
    document.getElementById('viewAllText').textContent = t.viewAll;
    document.getElementById('dashboardLangText').textContent = t.langText;
    document.getElementById('totalProjectsLabel').textContent = t.totalProjects;
    document.getElementById('totalSkillsLabel').textContent = t.totalSkills;

    const statusLabels = document.querySelectorAll('#projectStatusList .text-sm:first-child');
    if (statusLabels.length >= 3) {
        statusLabels[0].textContent = t.inProgress;
        statusLabels[1].textContent = t.completed;
        statusLabels[2].textContent = t.planning;
    }

    const skillNames = document.querySelectorAll('.skill-name');
    const skillLabels = [t.backend, t.frontend, t.database, t.devops, t.tools];
    skillNames.forEach((el, index) => {
        if (el && skillLabels[index]) {
            el.textContent = skillLabels[index];
        }
    });
}

// ===== Sidebar =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const shouldOpen = !sidebar.classList.contains('open');
    setSidebarState(shouldOpen);
}

function setSidebarState(isOpen) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open', isOpen);
    overlay.classList.toggle('show', isOpen);
    document.body.classList.toggle('sidebar-open', isOpen && window.innerWidth < 1024);
    document.querySelectorAll('.sidebar-toggle').forEach((button) => {
        button.setAttribute('aria-expanded', String(isOpen));
        button.setAttribute('aria-label', isOpen ? 'بستن منو' : 'باز کردن منو');
    });
}

document.addEventListener('click', function (e) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const isSidebarClick = sidebar.contains(e.target);
    const isMenuBtn = e.target.closest('[onclick="toggleSidebar()"]');

    if (!isSidebarClick && !isMenuBtn && window.innerWidth < 1024) {
        setSidebarState(false);
    }
});

// ===== Fetch API with FormData support =====
async function fetchAPI(url, options = {}) {
    try {
        const isFormData = options.body instanceof FormData;

        const headers = {
            ...options.headers
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, {
            ...options,
            headers: headers
        });

        if (response.status === 401) {
            const t = translations[currentLang];
            showToast('error', t.sessionExpired, '');
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

// ===== Load Dashboard Data (Promise.allSettled به‌جای Promise.all) =====
async function loadDashboardData() {
    if (isLoading) return;
    isLoading = true;

    try {
        showSkeletons(true);

        const endpoints = [
            '/api/projects/public/stats',
            '/api/contact/stats',
            '/api/skills/public',
            '/api/projects/public/recent?limit=5',
            '/api/experience/public',
            '/api/services/public',
            '/api/statistics/public'
        ];

        const results = await Promise.allSettled(endpoints.map(url => fetchAPI(url)));

        const [projectStats, messageStats, skills, projects, experiences, services, statistics] =
            results.map(r => (r.status === 'fulfilled' ? r.value : null));

        const anyFailed = results.some(r => r.status === 'rejected' || r.value === null);

        updateStats(projectStats, messageStats, skills);
        updateCharts(projectStats, skills);
        updateRecentProjects(projects);
        updateExperiences(experiences);
        updateServices(services);
        updateStatistics(statistics);

        showSkeletons(false);
        updateTimestamp();

        if (anyFailed) {
            const t = translations[currentLang];
            showToast('warning', t.noAccess, '');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showSkeletons(false);
        const t = translations[currentLang];
        showToast('error', t.errorLoading, error.message);
    } finally {
        isLoading = false;
    }
}

function showSkeletons(show) {
    document.querySelectorAll('.skeleton-card').forEach(el => { el.style.display = show ? 'block' : 'none'; });
    document.querySelectorAll('.stat-card:not(.skeleton-card)').forEach(el => { el.style.display = show ? 'none' : 'block'; });
    document.querySelectorAll('.skeleton-status').forEach(el => { el.style.display = show ? 'block' : 'none'; });
    document.querySelectorAll('.status-item').forEach(el => { el.style.display = show ? 'none' : 'flex'; });
    document.querySelectorAll('.skeleton-skill').forEach(el => { el.style.display = show ? 'block' : 'none'; });
    document.querySelectorAll('.skill-item').forEach(el => { el.style.display = show ? 'none' : 'flex'; });
    document.querySelectorAll('.skeleton-project').forEach(el => { el.style.display = show ? 'block' : 'none'; });
    document.querySelectorAll('.project-item:not(.skeleton-project)').forEach(el => { el.style.display = show ? 'none' : 'flex'; });
}

function updateStats(projectStats, messageStats, skills) {
    const totalProjects = projectStats?.data?.total || 0;
    const completedProjects = projectStats?.data?.completed || 0;
    const unreadMessages = messageStats?.data?.unread || 0; // اگر کاربر دسترسی ADMIN نداشته باشد، null می‌ماند و 0 نشان داده می‌شود
    const totalSkills = skills?.data?.length || 0;

    animateNumber('totalProjects', totalProjects);
    animateNumber('completedProjects', completedProjects);
    animateNumber('unreadMessages', unreadMessages);
    animateNumber('totalSkills', totalSkills);

    document.getElementById('unreadBadge').textContent = unreadMessages;
    const t = translations[currentLang];
    document.getElementById('totalProjectsLabel').textContent = `${totalProjects} ${t.totalProjects}`;
    document.getElementById('totalSkillsLabel').textContent = `${totalSkills} ${t.totalSkills}`;
}

function animateNumber(elementId, targetValue) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = parseInt(element.textContent) || 0;
    const duration = 800;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (targetValue - startValue) * eased);
        element.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
        else element.textContent = targetValue;
    }
    requestAnimationFrame(update);
}

// ===== Update Charts (رفع باگ حساسیت به بزرگی/کوچکی حروف) =====
function updateCharts(projectStats, skills) {
    const data = projectStats?.data || {};
    const total = data.total || 1;
    const completed = data.completed || 0;
    const inProgress = data.inProgress || 0;
    const planning = total - completed - inProgress;

    updateBar('inProgressBar', 'inProgressCount', inProgress, total, '#FBBF24');
    updateBar('completedBar', 'completedCount', completed, total, '#00C26E');
    updateBar('planningBar', 'planningCount', planning, total, '#8A94A6');

    // بک‌اند نام enum جاوا را ارسال می‌کند (مثلاً "BACKEND"، نه "Backend")
    // بنابراین باید نرمالایز کنیم، نه اینکه دقیقاً برابری کنیم
    const skillData = skills?.data || [];
    const categories = { BACKEND: 0, FRONTEND: 0, DATABASE: 0, DEVOPS: 0, TOOLS: 0 };

    skillData.forEach(s => {
        const cat = (s.category || '').toUpperCase();
        if (Object.prototype.hasOwnProperty.call(categories, cat)) {
            categories[cat]++;
        }
    });

    const totalSkills = skillData.length || 1;
    updateBar('backendBar', 'backendCount', categories.BACKEND, totalSkills, '#00C26E');
    updateBar('frontendBar', 'frontendCount', categories.FRONTEND, totalSkills, '#4DFFB8');
    updateBar('databaseBar', 'databaseCount', categories.DATABASE, totalSkills, '#FBBF24');
    updateBar('devopsBar', 'devopsCount', categories.DEVOPS, totalSkills, '#EF4444');
    updateBar('toolsBar', 'toolsCount', categories.TOOLS, totalSkills, '#8B5CF6');
}

function updateBar(barId, countId, value, total, color) {
    const bar = document.getElementById(barId);
    const count = document.getElementById(countId);
    if (bar) {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        bar.style.width = `${percentage}%`;
        bar.style.background = color;
    }
    if (count) count.textContent = value;
}

// ===== Update Recent Projects (رفع باگ حساسیت به بزرگی/کوچکی حروف در status) =====
function updateRecentProjects(projects) {
    const container = document.getElementById('recentProjectsList');
    const t = translations[currentLang];

    document.querySelectorAll('.project-item:not(.skeleton-project)').forEach(el => el.remove());

    const data = projects?.data || [];

    if (data.length === 0) {
        container.innerHTML += `
            <div class="project-item text-center text-[#8A94A6] py-6">
                <i class="fas fa-folder-open text-3xl mb-2 block opacity-50"></i>
                <span>${t.noProjects}</span>
            </div>
        `;
        return;
    }

    const statusColors = {
        completed: 'status-completed',
        in_progress: 'status-in_progress',
        planning: 'status-planning'
    };

    const statusLabels = {
        completed: t.completed,
        in_progress: t.inProgress,
        planning: t.planning
    };

    data.slice(0, 5).forEach(project => {
        // بک‌اند "COMPLETED" / "IN_PROGRESS" می‌فرستد؛ اینجا به فرمت کلید JS تبدیل می‌کنیم
        const statusKey = (project.status || '').toLowerCase();

        const div = document.createElement('div');
        div.className = 'project-item flex items-center justify-between gap-4';
        div.style.display = 'flex';
        div.innerHTML = `
            <div class="flex items-center gap-3 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-[#00C26E]/10 flex items-center justify-center text-[#00C26E] flex-shrink-0">
                    <i class="fas fa-file-code"></i>
                </div>
                <div class="min-w-0">
                    <div class="font-medium text-sm truncate">${project.title || 'بدون عنوان'}</div>
                    <div class="text-xs text-[#8A94A6] truncate">${project.clientName || ''}</div>
                </div>
            </div>
            <span class="project-status ${statusColors[statusKey] || 'status-planning'} flex-shrink-0">
                ${statusLabels[statusKey] || project.status}
            </span>
        `;
        container.appendChild(div);
    });
}

function updateExperiences(experiences) {
    const container = document.getElementById('experiencesList');
    if (!container) return;

    const data = experiences?.data || [];
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `
            <div class="text-center text-[#8A94A6] py-4">
                <i class="fas fa-briefcase text-2xl mb-2 block opacity-50"></i>
                <span class="text-sm">هیچ سابقه کاری یافت نشد</span>
            </div>
        `;
        return;
    }

    data.slice(0, 3).forEach(exp => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0';
        div.innerHTML = `
            <div class="w-10 h-10 rounded-lg bg-[#4DFFB8]/10 flex items-center justify-center text-[#4DFFB8] flex-shrink-0">
                <i class="fas fa-building"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">${exp.position || ''}</div>
                <div class="text-xs text-[#8A94A6] truncate">${exp.company || ''}</div>
            </div>
            <span class="text-xs text-[#8A94A6] flex-shrink-0">
                ${exp.isCurrent ? 'فعلی' : (exp.endDate || '')}
            </span>
        `;
        container.appendChild(div);
    });
}

function updateServices(services) {
    const container = document.getElementById('servicesList');
    if (!container) return;

    const data = services?.data || [];
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `
            <div class="text-center text-[#8A94A6] py-4">
                <i class="fas fa-cogs text-2xl mb-2 block opacity-50"></i>
                <span class="text-sm">هیچ سرویسی یافت نشد</span>
            </div>
        `;
        return;
    }

    data.slice(0, 3).forEach(service => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0';
        div.innerHTML = `
            <div class="w-10 h-10 rounded-lg bg-[#FBBF24]/10 flex items-center justify-center text-[#FBBF24] flex-shrink-0">
                <i class="fas fa-cog"></i>
            </div>
            <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">${service.title || ''}</div>
                <div class="text-xs text-[#8A94A6] truncate">${service.description || ''}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateStatistics(statistics) {
    const container = document.getElementById('statisticsList');
    if (!container) return;

    const data = statistics?.data || [];
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `
            <div class="text-center text-[#8A94A6] py-4">
                <i class="fas fa-chart-bar text-2xl mb-2 block opacity-50"></i>
                <span class="text-sm">هیچ آماری یافت نشد</span>
            </div>
        `;
        return;
    }

    data.slice(0, 4).forEach(stat => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0';
        div.innerHTML = `
            <span class="text-sm text-[#8A94A6]">${stat.title || ''}</span>
            <span class="text-sm font-semibold text-[#00C26E]">${stat.value || '0'}</span>
        `;
        container.appendChild(div);
    });
}

function updateTimestamp() {
    const now = new Date();
    const time = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    document.getElementById('updateTime').textContent = time;
}

function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    refreshInterval = setInterval(() => loadDashboardData(), 60000);
    setInterval(updateTimestamp, 10000);
}

function refreshData() {
    if (loadTimeout) clearTimeout(loadTimeout);
    loadTimeout = setTimeout(() => {
        loadDashboardData();
        const t = translations[currentLang];
        showToast('success', '', t.refreshSuccess);
    }, 300);
}

function showToast(type, title, message, duration = 4000) {
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

async function handleLogout(e) {
    e.preventDefault();
    const t = translations[currentLang];
    if (!confirm(t.logoutConfirm)) return;

    try {
        await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('accessToken');
    } catch (error) {
        console.error('Logout error:', error);
    }

    localStorage.removeItem('user');
    showToast('success', t.logoutSuccess, '');
    setTimeout(() => window.location.href = '/login', 500);
}

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            setSidebarState(false);
        }
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            refreshData();
        }
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth >= 1024) {
            setSidebarState(false);
        }
    });
}

window.toggleSidebar = toggleSidebar;
window.toggleLanguage = toggleLanguage;
window.refreshData = refreshData;
window.showToast = showToast;
