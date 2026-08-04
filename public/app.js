/**
 * DEV SHOWCASE - CLIENT SCRIPT
 * Dynamic REST API Integration
 */

let siteData = {
  hero: {},
  stats: [],
  projects: [],
  skills: [],
  contactInfo: {}
};

let currentCategory = "all";
let searchQuery = "";
let currentLang = localStorage.getItem("lang") || "fr";
let currentTheme = localStorage.getItem("theme") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

// ==========================================
// TRANSLATIONS DICTIONARY (FR / EN / AR)
// ==========================================
const translations = {
  fr: {
    nav_home: "Accueil",
    nav_projects: "Réalisations",
    nav_tech: "Stack Technique",
    nav_contact: "Contact",
    cta_contact: '<i class="fa-regular fa-paper-plane"></i> Me Contacter',

    hero_explore_btn: '<i class="fa-solid fa-laptop-code"></i> Explorer mes Projets',
    hero_discuss_btn: '<i class="fa-solid fa-envelope"></i> Discuter d\'un projet',

    projects_tag: '<i class="fa-solid fa-cubes"></i> Mes Réalisations',
    projects_title: 'Découvrez mes <span class="gradient-text">Projets Récents</span>',
    projects_subtitle: 'Parcourez mes applications mobile, web et backends. Filtrez par catégorie ou recherchez une technologie spécifique.',
    search_placeholder: 'Rechercher un projet, une technologie (ex: Flutter, React, API)...',

    filter_all: 'Tous les projets',
    filter_mobile: 'Dev Mobile',
    filter_web: 'Web Apps',
    filter_fullstack: 'APIs & Backend',
    filter_dashboards: 'Dashboards',

    no_projects_found: 'Aucun projet trouvé',
    learn_more: '<i class="fa-solid fa-circle-info"></i> En savoir plus',

    tech_tag: '<i class="fa-solid fa-code"></i> Compétences',
    tech_title: 'Stack Technique <span class="gradient-text">& Outils</span>',
    tech_subtitle: 'L\'ensemble des technologies que j\'utilise au quotidien pour concevoir des applications performantes.',

    contact_tag: '<i class="fa-regular fa-paper-plane"></i> Prise de Contact',
    contact_title: 'Un projet en tête ? <span class="gradient-text">Contactez-moi</span>',
    contact_subtitle: 'Vous souhaitez développer une application mobile, créer un site web ou discuter d\'une collaboration ? Remplissez le formulaire ou envoyez-moi directement un message.',
    contact_info_title: 'Discutons de vos besoins',
    contact_info_desc: 'Je suis disponible pour étudier vos projets de développement, vous apporter un conseil technique ou collaborer sur vos idées.',
    contact_email_label: 'Email de contact',
    contact_location_label: 'Disponibilité',
    contact_social_label: 'Retrouvez mes travaux',

    form_name_label: 'Votre Nom / Entreprise *',
    form_name_placeholder: 'Ex: Jean Dupont',
    form_email_label: 'Votre Adresse Email *',
    form_email_placeholder: 'ex: jean@entreprise.com',
    form_type_label: 'Type de Projet',
    form_type_mobile: 'Développement Application Mobile (Flutter)',
    form_type_web: 'Création de Site Web / Web App',
    form_type_api: 'Développement Backend & API',
    form_type_other: 'Autre / Demande d\'information',
    form_msg_label: 'Détails de votre message *',
    form_msg_placeholder: 'Décrivez votre projet, vos objectifs et vos délais...',
    form_submit_btn: '<i class="fa-solid fa-paper-plane"></i> Envoyer le message',

    footer_copy: '© 2026 Revo Dev. Tous droits réservés. Présentation de travaux de développement logiciels & applications.'
  },
  en: {
    nav_home: "Home",
    nav_projects: "Projects",
    nav_tech: "Tech Stack",
    nav_contact: "Contact",
    cta_contact: '<i class="fa-regular fa-paper-plane"></i> Contact Me',

    hero_explore_btn: '<i class="fa-solid fa-laptop-code"></i> Explore My Projects',
    hero_discuss_btn: '<i class="fa-solid fa-envelope"></i> Discuss a Project',

    projects_tag: '<i class="fa-solid fa-cubes"></i> Portfolio Showcase',
    projects_title: 'Explore My <span class="gradient-text">Recent Projects</span>',
    projects_subtitle: 'Browse mobile apps, web applications, and backends. Filter by category or search by specific technology.',
    search_placeholder: 'Search project or technology (e.g., Flutter, React, API)...',

    filter_all: 'All Projects',
    filter_mobile: 'Mobile Dev',
    filter_web: 'Web Apps',
    filter_fullstack: 'APIs & Backend',
    filter_dashboards: 'Dashboards',

    no_projects_found: 'No projects found',
    learn_more: '<i class="fa-solid fa-circle-info"></i> Learn More',

    tech_tag: '<i class="fa-solid fa-code"></i> Skills & Expertise',
    tech_title: 'Tech Stack <span class="gradient-text">& Tools</span>',
    tech_subtitle: 'The technologies and tools I use daily to build high-performance applications.',

    contact_tag: '<i class="fa-regular fa-paper-plane"></i> Get In Touch',
    contact_title: 'Have a project in mind? <span class="gradient-text">Contact Me</span>',
    contact_subtitle: 'Looking to build a mobile app, web application, or discuss a collaboration? Fill out the form or send me a direct message.',
    contact_info_title: 'Let\'s discuss your project',
    contact_info_desc: 'I am available to discuss development projects, provide technical consulting, or collaborate on your ideas.',
    contact_email_label: 'Contact Email',
    contact_location_label: 'Availability',
    contact_social_label: 'Find my work',

    form_name_label: 'Your Name / Company *',
    form_name_placeholder: 'e.g., John Smith',
    form_email_label: 'Your Email Address *',
    form_email_placeholder: 'e.g., john@company.com',
    form_type_label: 'Project Type',
    form_type_mobile: 'Mobile App Development (Flutter)',
    form_type_web: 'Website / Web Application',
    form_type_api: 'Backend & API Development',
    form_type_other: 'Other / General Inquiry',
    form_msg_label: 'Message Details *',
    form_msg_placeholder: 'Describe your project, goals, and timeline...',
    form_submit_btn: '<i class="fa-solid fa-paper-plane"></i> Send Message',

    footer_copy: '© 2026 Revo Dev. All rights reserved. Software & Application Showcase.'
  },
  ar: {
    nav_home: "الرئيسية",
    nav_projects: "الأعمال",
    nav_tech: "التقنيات",
    nav_contact: "تواصل معي",
    cta_contact: '<i class="fa-regular fa-paper-plane"></i> اتصل بي',

    hero_explore_btn: '<i class="fa-solid fa-laptop-code"></i> استكشف مشاريعي',
    hero_discuss_btn: '<i class="fa-solid fa-envelope"></i> مناقشة مشروع',

    projects_tag: '<i class="fa-solid fa-cubes"></i> معرض الأعمال',
    projects_title: 'استكشف <span class="gradient-text">أحدث المشاريع</span>',
    projects_subtitle: 'تصفح تطبيقات الهاتف، الويب والأنظمة الخلفية. يمكنك التصفية حسب الفئة أو البحث عن تقنية معينة.',
    search_placeholder: 'ابحث عن مشروع أو تقنية (مثال: Flutter, React, API)...',

    filter_all: 'كل المشاريع',
    filter_mobile: 'تطبيقات الهاتف',
    filter_web: 'تطبيقات الويب',
    filter_fullstack: 'الواجهات البرمجية APIs',
    filter_dashboards: 'لوحات التحكم',

    no_projects_found: 'لم يتم العثور على مشاريع',
    learn_more: '<i class="fa-solid fa-circle-info"></i> التفاصيل',

    tech_tag: '<i class="fa-solid fa-code"></i> المهارات والتقنيات',
    tech_title: 'التقنيات <span class="gradient-text">والأدوات</span>',
    tech_subtitle: 'التقنيات والأدوات التي أستخدمها يومياً لبناء تطبيقات عالية الأداء.',

    contact_tag: '<i class="fa-regular fa-paper-plane"></i> تواصل معي',
    contact_title: 'لديك فكرة مشروع؟ <span class="gradient-text">تواصل معي</span>',
    contact_subtitle: 'هل ترغب في تطوير تطبيق هاتف، موقع ويب، أو مناقشة تعاون؟ املأ النموذج أو أرسل رسالة مباشرة.',
    contact_info_title: 'لنناقش متطلباتك',
    contact_info_desc: 'أنا متاح لدراسة مشاريعك البرمجية، تقديم استشارات تقنية، أو التعاون في أفكارك.',
    contact_email_label: 'البريد الإلكتروني',
    contact_location_label: 'التوفر',
    contact_social_label: 'تابع أعمالي على',

    form_name_label: 'الاسم / الشركة *',
    form_name_placeholder: 'مثال: أحمد محمد',
    form_email_label: 'البريد الإلكتروني *',
    form_email_placeholder: 'مثال: ahmed@company.com',
    form_type_label: 'نوع المشروع',
    form_type_mobile: 'تطوير تطبيق هاتف (Flutter)',
    form_type_web: 'تطوير موقع أو تطبيق ويب',
    form_type_api: 'تطوير واجهات خلفية APIs',
    form_type_other: 'استفسار عام / آخر',
    form_msg_label: 'تفاصيل الرسالة *',
    form_msg_placeholder: 'اشرح مشروعك، أهدافك، والجدول الزمني...',
    form_submit_btn: '<i class="fa-solid fa-paper-plane"></i> إرسال الرسالة',

    footer_copy: '© 2026 Revo Dev. جميع الحقوق محفوظة. معرض تطوير البرمجيات والتطبيقات.'
  }
};

// Apply Theme
function setTheme(theme) {
  currentTheme = theme;
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);

  const themeIcon = document.getElementById("themeIcon");
  if (themeIcon) {
    if (theme === "dark") {
      themeIcon.className = "fa-solid fa-sun";
    } else {
      themeIcon.className = "fa-solid fa-moon";
    }
  }
}

// Translation helper for dynamic backend strings & categories
function translateText(text) {
  if (!text || currentLang === 'fr') return text;

  const dictionary = {
    en: {
      "Disponible pour opportunités & projets freelance": "Available for freelance opportunities & projects",
      "Conception & Developpement Multi-Plateformes (Full-Stack Express API)": "Multi-Platform Design & Development (Full-Stack Express API)",
      "Bienvenue sur mon site vitrine. Découvrez l'ensemble de mes réalisations techniques : applications mobiles performantes (Flutter), plateformes web réactives (React/Node) et architectures d'APIs robustes.": "Welcome to my showcase website. Discover my technical projects: high-performance mobile apps (Flutter), responsive web platforms (React/Node), and robust API architectures.",
      "Projets Principaux": "Featured Projects",
      "Technologies Maîtrisées": "Mastered Technologies",
      "Code Moderne & Adaptatif": "Modern & Adaptive Code",
      "Réactivité & Suivi": "Responsiveness & Support",
      "Remote & Sur place": "Remote & On-site",
      "Dev Mobile": "Mobile Dev",
      "Web App": "Web App",
      "APIs & Backend": "APIs & Backend",
      "Dashboards": "Dashboards",
      "mobile": "Mobile Dev",
      "web": "Web App",
      "fullstack": "APIs & Backend",
      "dashboards": "Dashboards",
      "Développement Mobile": "Mobile Development",
      "Frontend Web": "Frontend Web",
      "Backend & APIs": "Backend & APIs",
      "Base de données & DevOps": "Database & DevOps",
      "Avancé": "Advanced",
      "Maîtrisé": "Proficient",
      "Expert": "Expert",
      "Notions": "Basics",
      "Projet": "Project"
    },
    ar: {
      "Disponible pour opportunités & projets freelance": "متاح للفرص والمشاريع الحرة",
      "Conception & Developpement Multi-Plateformes (Full-Stack Express API)": "تصميم وتطوير متعدد المنصات (Full-Stack Express API)",
      "Bienvenue sur mon site vitrine. Découvrez l'ensemble de mes réalisations techniques : applications mobiles performantes (Flutter), plateformes web réactives (React/Node) et architectures d'APIs robustes.": "مرحباً بكم في موقعي الشخصي. اكتشفوا أعمالي التقنية: تطبيقات هاتف عالية الأداء (Flutter)، منصات ويب تفاعلية (React/Node) وبنيات برمجية robust.",
      "Projets Principaux": "المشاريع الرئيسية",
      "Technologies Maîtrisées": "التقنيات المتقنة",
      "Code Moderne & Adaptatif": "كود حديث ومتكيف",
      "Réactivité & Suivi": "سرعة استجابة ومتابعة",
      "Remote & Sur place": "عن بعد وفي الموقع",
      "Dev Mobile": "تطبيقات الهاتف",
      "Web App": "تطبيقات الويب",
      "APIs & Backend": "الواجهات البرمجية APIs",
      "Dashboards": "لوحات التحكم",
      "mobile": "تطبيقات الهاتف",
      "web": "تطبيقات الويب",
      "fullstack": "الواجهات البرمجية APIs",
      "dashboards": "لوحات التحكم",
      "Développement Mobile": "تطوير تطبيقات الهاتف",
      "Frontend Web": "تطوير واجهات الويب",
      "Backend & APIs": "الأنظمة الخلفية والـ APIs",
      "Base de données & DevOps": "قواعد البيانات و DevOps",
      "Avancé": "متقدم",
      "Maîtrisé": "متمكن",
      "Expert": "خبير",
      "Notions": "أساسيات",
      "Projet": "مشروع"
    }
  };

  return (dictionary[currentLang] && dictionary[currentLang][text]) || text;
}

// Apply Language
function setLanguage(lang) {
  if (!translations[lang]) lang = "fr";
  currentLang = lang;
  localStorage.setItem("lang", lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === "ar" ? "rtl" : "ltr");

  const langSelect = document.getElementById("langSelect");
  if (langSelect) langSelect.value = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  renderHero();
  renderStats();
  renderProjects();
  renderSkills();
  renderContactInfo();
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("projectModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const contactForm = document.getElementById("contactForm");
  const copyEmailBtn = document.getElementById("copyEmailBtn");

  // Initialize theme & language
  setTheme(currentTheme);
  setLanguage(currentLang);

  // Theme toggle listener
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  // Language select listener
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.addEventListener("change", (e) => {
      setLanguage(e.target.value);
    });
  }

  // Fetch initial data from REST API endpoint
  fetchSiteData();


  // Mobile Nav Hamburger Toggle
  const mobileNavToggle = document.getElementById("mobileNavToggle");
  const navLinks = document.getElementById("navLinks");
  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-open");
    });
  }

  // Scroll Header Effect

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Filter Pills Event Listener
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-filter");
      renderProjects();
    });
  });

  // Search Event Listener
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderProjects();
    });
  }

  // Modal Close Events
  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay && modalOverlay.classList.contains("active")) {
      closeModal();
    }
  });

  // Copy Email Functionality
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      const email = siteData.contactInfo.email || "contact@abderrahmane-dev.com";
      navigator.clipboard.writeText(email).then(() => {
        showToast("Adresse email copiée dans le presse-papier !");
      });
    });
  }

  // Submit Contact Form to POST /api/messages
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const senderName = document.getElementById("senderName").value;
      const senderEmail = document.getElementById("senderEmail").value;
      const projectType = document.getElementById("projectType").value;
      const message = document.getElementById("senderMessage").value;

      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...`;

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderName, senderEmail, projectType, message })
        });

        const resData = await response.json();

        if (response.ok) {
          contactForm.reset();
          showToast(`Merci ${senderName} ! Votre message a été transmis à l'administrateur.`);
        } else {
          showToast(resData.error || "Erreur lors de l'envoi du message.");
        }
      } catch (err) {
        showToast("Impossible de contacter le serveur.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});

// Fetch Data from Backend API Endpoint /api/site-data
async function fetchSiteData() {
  try {
    const res = await fetch("/api/site-data");
    if (!res.ok) throw new Error("Erreur serveur API");
    siteData = await res.json();

    if (siteData.theme) {
      document.body.className = siteData.theme;
    }

    renderHero();
    renderStats();
    renderProjects();
    renderSkills();
    renderContactInfo();
  } catch (err) {
    console.error("Erreur lors de la récupération des données:", err);
  }
}

// Render Hero Section
function renderHero() {
  if (!siteData.hero) return;
  const heroBadge = document.getElementById("heroBadge");
  const heroTitle = document.getElementById("heroTitle");
  const heroDesc = document.getElementById("heroDesc");
  const heroCodeSnippet = document.getElementById("heroCodeSnippet");

  if (siteData.hero.badgeText && heroBadge) {
    heroBadge.innerHTML = `<span class="status-dot"></span> ${translateText(siteData.hero.badgeText)}`;
  }

  if (siteData.hero.title && heroTitle) {
    heroTitle.innerHTML = translateText(siteData.hero.title);
  }

  if (siteData.hero.description && heroDesc) {
    heroDesc.innerText = translateText(siteData.hero.description);
  }

  if (siteData.hero.codeSnippet && heroCodeSnippet) {
    heroCodeSnippet.innerHTML = `<pre><code>${escapeHtml(siteData.hero.codeSnippet)}</code></pre>`;
  }
}


// Render Stats Strip
function renderStats() {
  const statsStrip = document.getElementById("statsStrip");
  if (!statsStrip || !siteData.stats) return;

  statsStrip.innerHTML = siteData.stats.map(s => `
    <div class="stat-item">
      <span class="stat-number">${s.number}</span>
      <span class="stat-label">${translateText(s.label)}</span>
    </div>
  `).join('');
}

// Render Projects Grid
function renderProjects() {
  const projectsGrid = document.getElementById("projectsGrid");
  if (!projectsGrid) return;

  const projectsList = Array.isArray(siteData.projects) ? siteData.projects : [];

  const filtered = projectsList.filter(project => {
    if (!project) return false;
    const category = project.category || "";
    const matchesCategory = (currentCategory === "all" || category === currentCategory);

    const titleStr = (project.title || "").toLowerCase();
    const descStr = (project.shortDesc || "").toLowerCase();
    const techArray = Array.isArray(project.technologies) ? project.technologies : [];
    const query = (searchQuery || "").toLowerCase();

    const matchesSearch = query === "" ||
      titleStr.includes(query) ||
      descStr.includes(query) ||
      techArray.some(tech => (tech || "").toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    const noResultsText = (translations[currentLang] && translations[currentLang].no_projects_found) || "Aucun projet trouvé";
    projectsGrid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
        <h3>${noResultsText}</h3>
      </div>
    `;
    return;
  }

  const learnMoreBtnText = (translations[currentLang] && translations[currentLang].learn_more) || '<i class="fa-solid fa-circle-info"></i> En savoir plus';

  const cardsHtml = filtered.map(project => {
    const imgSrc = project.image ? (project.image.startsWith('/') ? project.image : '/' + project.image) : '/assets/images/loyalty_app.png';
    const techArray = Array.isArray(project.technologies) ? project.technologies : [];
    const techBadgesHtml = techArray.map(tech => '<span class="tech-badge">' + tech + '</span>').join('');

    return `
    <div class="project-card" data-id="${project.id}">
      <div class="project-thumbnail-wrapper">
        <img src="${imgSrc}" alt="${project.title || 'Projet'}" class="project-thumbnail" onError="this.onerror=null; this.src='/assets/images/loyalty_app.png';" />
        <span class="category-tag">${translateText(project.categoryLabel || project.category || "Projet")}</span>
      </div>
      <div class="project-body">
        <h3 class="project-title">${project.title || 'Projet'}</h3>
        <p class="project-desc">${project.shortDesc || ''}</p>
        <div class="tech-stack-badges">
          ${techBadgesHtml}
        </div>
        <div class="project-footer">
          <button class="btn btn-secondary btn-sm" onclick="openProjectModal('${project.id}')">
            ${learnMoreBtnText}
          </button>
          <div style="display:flex; gap:0.6rem;">
            <a href="${project.demoUrl || '#'}" class="icon-link" title="Démo en direct" target="_blank">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  projectsGrid.innerHTML = cardsHtml;
}


// Render Skills Section
function renderSkills() {
  const techGrid = document.getElementById("techGrid");
  if (!techGrid || !siteData.skills) return;

  techGrid.innerHTML = siteData.skills.map(cat => `
    <div class="tech-category-card">
      <div class="category-icon-title">
        <div class="category-icon"><i class="fa-solid ${cat.icon || 'fa-code'}"></i></div>
        <h3 style="font-size: 1.15rem; font-weight: 700;">${translateText(cat.categoryTitle)}</h3>
      </div>
      <div class="tech-items-list">
        ${(cat.items || []).map(item => `
          <div class="tech-item">
            <span style="font-size: 0.92rem; font-weight: 500; display:flex; align-items:center; gap:0.5rem;">
              <i class="fa-solid fa-angle-right" style="color:var(--accent-cyan);"></i> ${item.name}
            </span>
            <span class="tech-level">${translateText(item.level)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Render Contact Details
function renderContactInfo() {
  const emailElem = document.getElementById("contactEmail");
  const locElem = document.getElementById("contactLocation");
  const githubLink = document.getElementById("githubLink");
  const linkedinLink = document.getElementById("linkedinLink");

  if (siteData.contactInfo.email && emailElem) emailElem.innerText = siteData.contactInfo.email;
  if (siteData.contactInfo.location && locElem) locElem.innerText = translateText(siteData.contactInfo.location);
  if (siteData.contactInfo.github && githubLink) githubLink.href = siteData.contactInfo.github;
  if (siteData.contactInfo.linkedin && linkedinLink) linkedinLink.href = siteData.contactInfo.linkedin;
}

window.openProjectModal = function(projectId) {
  const projectsList = Array.isArray(siteData.projects) ? siteData.projects : [];
  const project = projectsList.find(p => p.id === projectId);
  const modalOverlay = document.getElementById("projectModal");
  if (!project || !modalOverlay) return;

  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalCategory = document.getElementById("modalCategory");
  const modalDesc = document.getElementById("modalDesc");
  const modalTechBadges = document.getElementById("modalTechBadges");
  const modalFeatures = document.getElementById("modalFeatures");

  const imgSrc = project.image ? (project.image.startsWith('/') ? project.image : '/' + project.image) : '/assets/images/loyalty_app.png';

  if (modalImg) modalImg.src = imgSrc;
  if (modalTitle) modalTitle.innerText = project.title || "";
  if (modalCategory) modalCategory.innerText = translateText(project.categoryLabel || project.category || "Projet");
  if (modalDesc) modalDesc.innerText = project.fullDesc || project.shortDesc || "";

  if (modalTechBadges) {
    const techList = Array.isArray(project.technologies) ? project.technologies : [];
    modalTechBadges.innerHTML = techList.map(t => `<span class="tech-badge">${t}</span>`).join('');
  }

  if (modalFeatures) {
    const featList = Array.isArray(project.features) ? project.features : [];
    modalFeatures.innerHTML = featList.map(f => `<li><i class="fa-solid fa-check" style="color: var(--accent-primary); margin-right: 0.5rem;"></i> ${f}</li>`).join('');
  }

  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
};


function closeModal() {
  const modalOverlay = document.getElementById("projectModal");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function showToast(message) {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color: var(--accent-emerald);"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
