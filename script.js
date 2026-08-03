/**
 * DEV SHOWCASE & CONTACT PORTFOLIO
 * Dynamic Interactivity, Admin Management & LocalStorage Persistence
 */

// ==========================================
// 1. DEFAULT PROJECT DATASET
// ==========================================
const defaultProjectsData = [
  {
    id: "revo-loyalty",
    title: "Revo Loyalty Mobile App",
    category: "mobile",
    categoryLabel: "Dev Mobile",
    shortDesc: "Application mobile cross-platform de fidélisation client en temps réel avec géolocalisation et QR codes dynamiques.",
    fullDesc: "Revo Loyalty est une solution mobile complète conçue avec Flutter & Dart. Elle permet aux clients de cumuler des points de fidélité via scannage QR, de suivre leurs récompenses en direct et d'interagir avec les commerces locaux grâce aux services de géolocalisation en arrière-plan.",
    image: "assets/images/loyalty_app.png",
    technologies: ["Flutter", "Dart", "Firebase", "Geolocator", "State Management", "Provider"],
    features: [
      "Système de récompenses et points instantanés",
      "Scannage et génération de QR Code sécurisé",
      "Service de géolocalisation en arrière-plan",
      "Interface Client et Dashboard Admin intégrés",
      "Notifications push personnalisées"
    ],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: "ecommerce-platform",
    title: "E-Commerce Fullstack Platform",
    category: "web",
    categoryLabel: "Web App",
    shortDesc: "Plateforme web e-commerce ultra-rapide avec gestion de panier en direct et passerelle de paiement sécurisée.",
    fullDesc: "Une application web e-commerce moderne intégrant un catalogue de produits interactif, une recherche instantanée avec filtres avancés, un panier persistant et une passerelle de paiement automatisée.",
    image: "assets/images/ecommerce.png",
    technologies: ["React", "Node.js", "Express", "MongoDB", "TailwindCSS", "Stripe API"],
    features: [
      "Architecture API RESTful performante",
      "Panier réactif et paiement sécurisé",
      "Gestion d'inventaire en temps réel",
      "Design entièrement adaptatif et dark mode"
    ],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: "analytics-dashboard",
    title: "Software Analytics & Admin Suite",
    category: "dashboards",
    categoryLabel: "Dashboards",
    shortDesc: "Tableau de bord de suivi de métriques et d'ingrédients/produits en temps réel pour administrateurs.",
    fullDesc: "Un dashboard administrateur haut de gamme offrant des graphiques interactifs en temps réel, la gestion des utilisateurs, la traçabilité des stocks d'ingrédients et la génération d'exportations de données PDF/Excel.",
    image: "assets/images/analytics.png",
    technologies: ["Vue.js", "TypeScript", "Chart.js", "PostgreSQL", "TailwindCSS"],
    features: [
      "Visualisation de métriques en temps réel",
      "Gestion granulaire des rôles et permissions",
      "Graphiques interactifs et filtres de dates",
      "Exportation automatique de rapports"
    ],
    demoUrl: "#",
    githubUrl: "#"
  },
  {
    id: "ai-api-gateway",
    title: "Developer AI Assistant API Gateway",
    category: "fullstack",
    categoryLabel: "APIs & Backend",
    shortDesc: "Microservice backend haute performance pour l'intégration de modèles d'IA et le traitement asynchrone.",
    fullDesc: "Une passerelle API sécurisée et évolutive développée pour orchestrer des appels de modèles d'IA, mettre en cache les requêtes fréquentes via Redis, et fournir un rate-limiting robuste pour applications web et mobile.",
    image: "assets/images/api.png",
    technologies: ["Python", "FastAPI", "Docker", "Redis", "OpenAI API", "PostgreSQL"],
    features: [
      "Traitement asynchrone ultra-rapide avec FastAPI",
      "Système de mise en cache Redis et limitation de débit",
      "Conteneurisation Docker complète et CI/CD",
      "Documentation Swagger / OpenAPI générée automatiquement"
    ],
    demoUrl: "#",
    githubUrl: "#"
  }
];

// LocalStorage key
const STORAGE_KEY = "dev_showcase_projects_v1";

// State variable
let projectsData = loadProjects();

function loadProjects() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Erreur de lecture du localStorage, retour aux projets par défaut", e);
    }
  }
  return [...defaultProjectsData];
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsData));
}

// ==========================================
// 2. DOM INITIALIZATION & EVENTS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const projectsGrid = document.getElementById("projectsGrid");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("searchInput");
  const header = document.querySelector(".header");
  const modalOverlay = document.getElementById("projectModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const contactForm = document.getElementById("contactForm");
  const copyEmailBtn = document.getElementById("copyEmailBtn");

  // Admin Modal Elements
  const adminModal = document.getElementById("adminModal");
  const adminBtn = document.getElementById("adminBtn");
  const adminBtnFooter = document.getElementById("adminBtnFooter");
  const adminCloseBtn = document.getElementById("adminCloseBtn");
  const adminTabListBtn = document.getElementById("adminTabListBtn");
  const adminTabFormBtn = document.getElementById("adminTabFormBtn");
  const adminViewList = document.getElementById("adminViewList");
  const adminViewForm = document.getElementById("adminViewForm");
  const projectAdminForm = document.getElementById("projectAdminForm");
  const resetProjectsBtn = document.getElementById("resetProjectsBtn");
  const adminFormTitle = document.getElementById("adminFormTitle");
  const editProjectIdInput = document.getElementById("editProjectId");

  let currentCategory = "all";
  let searchQuery = "";

  // Render Projects Grid
  renderProjects();
  updateStatsCounter();

  // Scroll Header Effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Filter Buttons Event Listener
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-filter");
      renderProjects();
    });
  });

  // Search Input Event Listener
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

  // Admin Modal Toggle
  const openAdmin = () => {
    renderAdminTable();
    switchAdminTab("list");
    adminModal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeAdmin = () => {
    adminModal.classList.remove("active");
    document.body.style.overflow = "";
  };

  if (adminBtn) adminBtn.addEventListener("click", openAdmin);
  if (adminBtnFooter) adminBtnFooter.addEventListener("click", openAdmin);
  if (adminCloseBtn) adminCloseBtn.addEventListener("click", closeAdmin);
  if (adminModal) {
    adminModal.addEventListener("click", (e) => {
      if (e.target === adminModal) closeAdmin();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalOverlay && modalOverlay.classList.contains("active")) closeModal();
      if (adminModal && adminModal.classList.contains("active")) closeAdmin();
    }
  });

  // Admin Tabs Switcher
  if (adminTabListBtn && adminTabFormBtn) {
    adminTabListBtn.addEventListener("click", () => switchAdminTab("list"));
    adminTabFormBtn.addEventListener("click", () => {
      resetAdminForm();
      switchAdminTab("form");
    });
  }

  function switchAdminTab(tab) {
    if (tab === "list") {
      adminTabListBtn.classList.add("active");
      adminTabFormBtn.classList.remove("active");
      adminViewList.style.display = "block";
      adminViewForm.style.display = "none";
    } else {
      adminTabFormBtn.classList.add("active");
      adminTabListBtn.classList.remove("active");
      adminViewForm.style.display = "block";
      adminViewList.style.display = "none";
    }
  }

  // Copy Email Functionality
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", () => {
      const email = "contact@abderrahmane-dev.com";
      navigator.clipboard.writeText(email).then(() => {
        showToast("Adresse email copiée dans le presse-papier !");
      }).catch(() => {
        showToast("Email : contact@abderrahmane-dev.com");
      });
    });
  }

  // Contact Form Submission
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("senderName").value;
      const submitBtn = contactForm.querySelector("button[type='submit']");
      
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
        showToast(`Merci ${name} ! Votre message a bien été envoyé.`);
      }, 1000);
    });
  }

  // Admin Form Submit (Add or Edit Project)
  if (projectAdminForm) {
    projectAdminForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const editId = editProjectIdInput.value;
      const title = document.getElementById("pTitle").value;
      const category = document.getElementById("pCategory").value;
      const categoryLabelMap = {
        mobile: "Dev Mobile",
        web: "Web App",
        fullstack: "APIs & Backend",
        dashboards: "Dashboards"
      };
      const categoryLabel = categoryLabelMap[category] || "Projet";
      const shortDesc = document.getElementById("pShortDesc").value;
      const fullDesc = document.getElementById("pFullDesc").value;
      const image = document.getElementById("pImage").value || "assets/images/loyalty_app.png";
      const techInput = document.getElementById("pTech").value;
      const featuresInput = document.getElementById("pFeatures").value;
      const demoUrl = document.getElementById("pDemoUrl").value || "#";
      const githubUrl = document.getElementById("pGithubUrl").value || "#";

      const technologies = techInput.split(",").map(t => t.trim()).filter(t => t.length > 0);
      const features = featuresInput.split("\n").map(f => f.trim()).filter(f => f.length > 0);

      if (editId) {
        // Edit existing project
        const index = projectsData.findIndex(p => p.id === editId);
        if (index !== -1) {
          projectsData[index] = {
            ...projectsData[index],
            title, category, categoryLabel, shortDesc, fullDesc, image, technologies, features, demoUrl, githubUrl
          };
          showToast("Projet mis à jour avec succès !");
        }
      } else {
        // Add new project
        const newProject = {
          id: "proj-" + Date.now(),
          title, category, categoryLabel, shortDesc, fullDesc, image, technologies, features, demoUrl, githubUrl
        };
        projectsData.unshift(newProject);
        showToast("Nouveau projet ajouté avec succès !");
      }

      saveProjects();
      renderProjects();
      renderAdminTable();
      updateStatsCounter();
      switchAdminTab("list");
      resetAdminForm();
    });
  }

  // Reset to default projects
  if (resetProjectsBtn) {
    resetProjectsBtn.addEventListener("click", () => {
      if (confirm("Voulez-vous vraiment réinitialiser la liste des projets avec les données par défaut ?")) {
        projectsData = [...defaultProjectsData];
        saveProjects();
        renderProjects();
        renderAdminTable();
        updateStatsCounter();
        showToast("Projets réinitialisés avec succès.");
      }
    });
  }

  // ==========================================
  // 3. HELPER FUNCTIONS
  // ==========================================
  function renderProjects() {
    if (!projectsGrid) return;

    const filtered = projectsData.filter(project => {
      const matchesCategory = (currentCategory === "all" || project.category === currentCategory);
      const matchesSearch = searchQuery === "" || 
        project.title.toLowerCase().includes(searchQuery) ||
        project.shortDesc.toLowerCase().includes(searchQuery) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchQuery));
      
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      projectsGrid.innerHTML = `
        <div class="no-results">
          <i class="fa-solid fa-folder-open"></i>
          <h3>Aucun projet trouvé</h3>
          <p>Essayez de modifier votre recherche ou d'ajouter un nouveau projet depuis l'Espace Admin.</p>
        </div>
      `;
      return;
    }

    projectsGrid.innerHTML = filtered.map(project => `
      <div class="project-card" data-id="${project.id}">
        <div class="project-thumbnail-wrapper">
          <img src="${project.image}" alt="${project.title}" class="project-thumbnail" onError="this.src='assets/images/loyalty_app.png'" />
          <span class="category-tag">${project.categoryLabel}</span>
        </div>
        <div class="project-body">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.shortDesc}</p>
          <div class="tech-stack-badges">
            ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
          </div>
          <div class="project-footer">
            <button class="btn btn-secondary btn-sm open-details-btn" onclick="openProjectModal('${project.id}')">
              <i class="fa-solid fa-circle-info"></i> En savoir plus
            </button>
            <div class="project-links">
              <a href="${project.githubUrl}" class="icon-link" title="Voir le code" target="_blank">
                <i class="fa-brands fa-github"></i>
              </a>
              <a href="${project.demoUrl}" class="icon-link" title="Démo en direct" target="_blank">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderAdminTable() {
    const adminTableBody = document.getElementById("adminTableBody");
    if (!adminTableBody) return;

    if (projectsData.length === 0) {
      adminTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; padding: 2rem; color: var(--text-muted);">
            Aucun projet enregistré. Cliquez sur "+ Ajouter un projet".
          </td>
        </tr>
      `;
      return;
    }

    adminTableBody.innerHTML = projectsData.map(p => `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.title}" class="admin-thumb-mini" onError="this.src='assets/images/loyalty_app.png'" />
        </td>
        <td>
          <strong style="color: var(--text-main); font-size: 0.95rem;">${p.title}</strong>
          <br/>
          <span style="font-size: 0.78rem; color: var(--text-dim);">${p.shortDesc.substring(0, 50)}...</span>
        </td>
        <td><span class="tech-badge">${p.categoryLabel}</span></td>
        <td>
          <div class="admin-action-btns">
            <button class="btn-icon-edit" onclick="editProject('${p.id}')" title="Modifier">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-icon-delete" onclick="deleteProject('${p.id}')" title="Supprimer">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.openProjectModal = function(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project || !modalOverlay) return;

    document.getElementById("modalImg").src = project.image;
    document.getElementById("modalTitle").innerText = project.title;
    document.getElementById("modalCategory").innerText = project.categoryLabel;
    document.getElementById("modalDesc").innerText = project.fullDesc;

    // Badges
    const modalTechContainer = document.getElementById("modalTechBadges");
    modalTechContainer.innerHTML = project.technologies.map(t => `<span class="tech-badge">${t}</span>`).join('');

    // Features
    const modalFeaturesContainer = document.getElementById("modalFeatures");
    modalFeaturesContainer.innerHTML = project.features.map(f => `
      <li><i class="fa-solid fa-check-circle"></i> ${f}</li>
    `).join('');

    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  window.editProject = function(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    editProjectIdInput.value = project.id;
    document.getElementById("pTitle").value = project.title;
    document.getElementById("pCategory").value = project.category;
    document.getElementById("pShortDesc").value = project.shortDesc;
    document.getElementById("pFullDesc").value = project.fullDesc;
    document.getElementById("pImage").value = project.image;
    document.getElementById("pTech").value = project.technologies.join(", ");
    document.getElementById("pFeatures").value = project.features.join("\n");
    document.getElementById("pDemoUrl").value = project.demoUrl;
    document.getElementById("pGithubUrl").value = project.githubUrl;

    adminFormTitle.innerText = "Modifier le Projet";
    switchAdminTab("form");
  };

  window.deleteProject = function(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.title}" ?`)) {
      projectsData = projectsData.filter(p => p.id !== projectId);
      saveProjects();
      renderProjects();
      renderAdminTable();
      updateStatsCounter();
      showToast(`Projet "${project.title}" supprimé.`);
    }
  };

  function resetAdminForm() {
    editProjectIdInput.value = "";
    projectAdminForm.reset();
    adminFormTitle.innerText = "Ajouter un Nouveau Projet";
  }

  function updateStatsCounter() {
    const totalCountElem = document.getElementById("totalProjectsStat");
    if (totalCountElem) {
      totalCountElem.innerText = `${projectsData.length}+`;
    }
  }

  function closeModal() {
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
});
