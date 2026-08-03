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

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".header");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("searchInput");
  const modalOverlay = document.getElementById("projectModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const contactForm = document.getElementById("contactForm");
  const copyEmailBtn = document.getElementById("copyEmailBtn");

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
    heroBadge.innerHTML = `<span class="status-dot"></span> ${siteData.hero.badgeText}`;
  }

  if (siteData.hero.title && heroTitle) {
    heroTitle.innerHTML = siteData.hero.title;
  }

  if (siteData.hero.description && heroDesc) {
    heroDesc.innerText = siteData.hero.description;
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
      <span class="stat-label">${s.label}</span>
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
    projectsGrid.innerHTML = `
      <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
        <h3>Aucun projet trouvé</h3>
        <p>Projets rechargeables dynamiquement depuis le Panneau d'Administration /admin.</p>
      </div>
    `;
    return;
  }

  const cardsHtml = filtered.map(project => {
    const imgSrc = project.image ? (project.image.startsWith('/') ? project.image : '/' + project.image) : '/assets/images/loyalty_app.png';
    const techArray = Array.isArray(project.technologies) ? project.technologies : [];
    const techBadgesHtml = techArray.map(tech => '<span class="tech-badge">' + tech + '</span>').join('');

    return `
    <div class="project-card" data-id="${project.id}">
      <div class="project-thumbnail-wrapper">
        <img src="${imgSrc}" alt="${project.title || 'Projet'}" class="project-thumbnail" onError="this.onerror=null; this.src='/assets/images/loyalty_app.png';" />
        <span class="category-tag">${project.categoryLabel || project.category || "Projet"}</span>
      </div>
      <div class="project-body">
        <h3 class="project-title">${project.title || 'Projet'}</h3>
        <p class="project-desc">${project.shortDesc || ''}</p>
        <div class="tech-stack-badges">
          ${techBadgesHtml}
        </div>
        <div class="project-footer">
          <button class="btn btn-secondary btn-sm" onclick="openProjectModal('${project.id}')">
            <i class="fa-solid fa-circle-info"></i> En savoir plus
          </button>
          <div style="display:flex; gap:0.6rem;">
            <a href="${project.githubUrl || '#'}" class="icon-link" title="Code GitHub" target="_blank">
              <i class="fa-brands fa-github"></i>
            </a>
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
        <h3 style="font-size: 1.15rem; font-weight: 700;">${cat.categoryTitle}</h3>
      </div>
      <div class="tech-items-list">
        ${(cat.items || []).map(item => `
          <div class="tech-item">
            <span style="font-size: 0.92rem; font-weight: 500; display:flex; align-items:center; gap:0.5rem;">
              <i class="fa-solid fa-angle-right" style="color:var(--accent-cyan);"></i> ${item.name}
            </span>
            <span class="tech-level">${item.level}</span>
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
  if (siteData.contactInfo.location && locElem) locElem.innerText = siteData.contactInfo.location;
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
  if (modalCategory) modalCategory.innerText = project.categoryLabel || project.category || "Projet";
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
