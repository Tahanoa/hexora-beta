(() => {
  const language = localStorage.getItem('hexora-lang') || localStorage.getItem('hexora-showcase-language') || 'fa';
  document.documentElement.lang = language === 'en' ? 'en' : 'fa';
  document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  let profileRequest;
  const webUrl = value => {
    const text = String(value || '').trim();
    if (!text || (/^[a-z][\w+.-]*:/i.test(text) && !/^https?:\/\//i.test(text))) return null;
    try {
      const url = new URL(/^https?:\/\//i.test(text) ? text : 'https://' + text);
      return /^https?:$/.test(url.protocol) && url.hostname.includes('.') && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  };
  function links(profile) {
    if (!profile) return [];
    const result = [
      ['GitHub', profile.githubUrl, 'fa-brands fa-github'],
      ['LinkedIn', profile.linkedinUrl, 'fa-brands fa-linkedin-in'],
      ['Instagram', profile.instagramUrl, 'fa-brands fa-instagram']
    ].flatMap(([label, value, icon]) => {
      const href = webUrl(value);
      return href ? [{label, href, icon, external: true}] : [];
    });
    const email = String(profile.email || '').trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) result.push({label: 'Email', fa: 'ایمیل', href: 'mailto:' + email, icon: 'fa-regular fa-envelope', external: false});
    const phone = String(profile.phone || '').replace(/[۰-۹]/g, c => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c))).replace(/[٠-٩]/g, c => String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[\s()-]/g, '');
    if (/^\+?\d{8,15}$/.test(phone)) result.push({label: 'Phone', fa: 'تلفن', href: 'tel:' + phone, icon: 'fa-solid fa-phone', external: false});
    return result;
  }
  function load() {
    return profileRequest ||= fetch('/api/profile/public').then(async response => {
      if (!response.ok) throw Error('Unable to load public profile');
      const json = await response.json();
      return json.data ?? json;
    });
  }
  window.HexoraPublicProfile = {load, links};
})();
