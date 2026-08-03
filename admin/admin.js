/**
 * DEV SHOWCASE - ADMIN DASHBOARD SCRIPT
 * Complete CRUD REST API Integration
 */

let adminData = {
  hero: {},
  stats: [],
  projects: [],
  skills: [],
  contactInfo: {},
  messages: []
};

document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".menu-item");
  const refreshBtn = document.getElementById("refreshBtn");

  // Load All Admin Data from REST API Endpoint
  loadAdminData();

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadAdminData();
      showAdminToast("Données actualisées depuis l'API !");
    });
  }

  // Logout buttons
  async function handleLogout() {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        window.location.href = '/admin/login';
      }
    } catch (err) {
      window.location.href = '/admin/login';
    }
  }

  const logoutBtn = document.getElementById("logoutBtn");
  const logoutBtnTop = document.getElementById("logoutBtnTop");
  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (logoutBtnTop) logoutBtnTop.addEventListener("click", handleLogout);

  // Mobile Sidebar Hamburger Toggle
  const adminMobileToggle = document.getElementById("adminMobileToggle");
  const adminSidebar = document.querySelector(".admin-sidebar");
  if (adminMobileToggle && adminSidebar) {
    adminMobileToggle.addEventListener("click", () => {
      adminSidebar.classList.toggle("mobile-open");
    });
  }


  // Sidebar Menu Tab Switching
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      menuItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const tabName = item.getAttribute("data-tab");
      switchTab(tabName);

      // Close mobile sidebar after tab selection
      if (adminSidebar) adminSidebar.classList.remove("mobile-open");
    });
  });


  // Theme Cards Selection Event Listener
  const themeCards = document.querySelectorAll(".theme-select-card");
  themeCards.forEach(card => {
    card.addEventListener("click", async () => {
      const selectedTheme = card.getAttribute("data-theme");
      try {
        const response = await fetch("/api/admin/theme", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: selectedTheme })
        });
        const resJson = await response.json();
        if (response.ok) {
          showAdminToast(`Thème changé : ${selectedTheme}`);
          highlightSelectedTheme(selectedTheme);
        } else {
          showAdminToast(resJson.error, true);
        }
      } catch (e) {
        showAdminToast("Erreur lors de la mise à jour du thème.", true);
      }
    });
  });


  // PROJECT FORM EVENTS
  const addNewProjectBtn = document.getElementById("addNewProjectBtn");
  const cancelProjectBtn = document.getElementById("cancelProjectBtn");
  const projectForm = document.getElementById("projectForm");

  if (addNewProjectBtn) {
    addNewProjectBtn.addEventListener("click", () => {
      resetProjectForm();
      document.getElementById("projectFormCard").style.display = "block";
    });
  }

  if (cancelProjectBtn) {
    cancelProjectBtn.addEventListener("click", () => {
      document.getElementById("projectFormCard").style.display = "none";
      resetProjectForm();
    });
  }

  if (projectForm) {
    projectForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const editId = document.getElementById("editProjId").value;
      const title = document.getElementById("pTitle").value;
      const category = document.getElementById("pCategory").value;
      const shortDesc = document.getElementById("pShortDesc").value;
      const fullDesc = document.getElementById("pFullDesc").value;
      const image = document.getElementById("pImage").value || "assets/images/loyalty_app.png";
      const techVal = document.getElementById("pTech").value;
      const featVal = document.getElementById("pFeatures").value;
      const demoUrl = document.getElementById("pDemoUrl").value || "#";
      const githubUrl = document.getElementById("pGithubUrl").value || "#";

      const technologies = techVal.split(",").map(t => t.trim()).filter(t => t.length > 0);
      const features = featVal.split("\n").map(f => f.trim()).filter(f => f.length > 0);

      const payload = { title, category, shortDesc, fullDesc, image, technologies, features, demoUrl, githubUrl };

      try {
        let response;
        if (editId) {
          response = await fetch(`/api/admin/projects/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          response = await fetch("/api/admin/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }

        const resJson = await response.json();
        if (response.ok) {
          showAdminToast(resJson.message || "Projet enregistré avec succès !");
          document.getElementById("projectFormCard").style.display = "none";
          resetProjectForm();
          await loadAdminData();
        } else {
          showAdminToast(resJson.error || "Erreur serveur.", true);
        }
      } catch (err) {
        showAdminToast("Erreur réseau API.", true);
      }
    });
  }

  // HERO FORM EVENT (PUT /api/admin/hero)
  const heroForm = document.getElementById("heroForm");
  if (heroForm) {
    heroForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const badgeText = document.getElementById("heroBadgeText").value;
      const title = document.getElementById("heroTitleInput").value;
      const description = document.getElementById("heroDescInput").value;
      const codeSnippet = document.getElementById("heroCodeInput").value;

      // Extract stats
      const stats = adminData.stats.map((stat, idx) => {
        const numVal = document.getElementById(`stat_num_${idx}`)?.value || stat.number;
        const lblVal = document.getElementById(`stat_lbl_${idx}`)?.value || stat.label;
        return { ...stat, number: numVal, label: lblVal };
      });

      try {
        const response = await fetch("/api/admin/hero", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ badgeText, title, description, codeSnippet, stats })
        });
        const resJson = await response.json();
        if (response.ok) {
          showAdminToast(resJson.message);
          await loadAdminData();
        } else {
          showAdminToast(resJson.error, true);
        }
      } catch (err) {
        showAdminToast("Erreur lors de la mise à jour du Hero.", true);
      }
    });
  }

  // ADD SKILL FORM (POST /api/admin/skills)
  const addSkillForm = document.getElementById("addSkillForm");
  if (addSkillForm) {
    addSkillForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const category = document.getElementById("skillCategory").value;
      const name = document.getElementById("skillName").value;
      const level = document.getElementById("skillLevel").value;

      try {
        const response = await fetch("/api/admin/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, name, level })
        });
        const resJson = await response.json();
        if (response.ok) {
          showAdminToast(resJson.message);
          document.getElementById("skillName").value = "";
          await loadAdminData();
        } else {
          showAdminToast(resJson.error, true);
        }
      } catch (err) {
        showAdminToast("Erreur d'ajout du skill.", true);
      }
    });
  }

  // CONTACT INFO FORM (PUT /api/admin/contact-info)
  const contactInfoForm = document.getElementById("contactInfoForm");
  if (contactInfoForm) {
    contactInfoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("infoEmail").value;
      const location = document.getElementById("infoLocation").value;
      const github = document.getElementById("infoGithub").value;
      const linkedin = document.getElementById("infoLinkedin").value;

      try {
        const response = await fetch("/api/admin/contact-info", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, location, github, linkedin })
        });
        const resJson = await response.json();
        if (response.ok) {
          showAdminToast(resJson.message);
          await loadAdminData();
        } else {
          showAdminToast(resJson.error, true);
        }
      } catch (err) {
        showAdminToast("Erreur de mise à jour des coordonnées.", true);
      }
    });
  }
});

// Load Complete DB overview from /api/admin/data
async function loadAdminData() {
  try {
    const res = await fetch("/api/admin/data");
    if (!res.ok) throw new Error("Erreur de chargement API Admin");
    adminData = await res.json();

    highlightSelectedTheme();
    renderOverviewMetrics();
    renderProjectsTable();
    renderHeroForm();
    renderSkillsGrid();
    renderContactInfoForm();
    renderMessagesTable();
  } catch (err) {
    console.error("Erreur lors de la récupération des données Admin:", err);
    showAdminToast("Impossible de contacter l'API backend Express", true);
  }
}


function highlightSelectedTheme(themeName) {
  const currentTheme = themeName || adminData.theme || "theme-cyber";
  const themeCards = document.querySelectorAll(".theme-select-card");
  themeCards.forEach(card => {
    if (card.getAttribute("data-theme") === currentTheme) {
      card.style.borderColor = "var(--accent-cyan)";
      card.style.boxShadow = "0 0 20px rgba(56, 189, 248, 0.3)";
    } else {
      card.style.borderColor = "var(--border-color)";
      card.style.boxShadow = "none";
    }
  });
}

function switchTab(tabName) {
  const tabs = document.querySelectorAll(".admin-tab-content");
  const menuItems = document.querySelectorAll(".menu-item");
  const pageTitle = document.getElementById("pageTitle");

  const titleMap = {
    overview: "Vue d'ensemble du site",
    theme: "Personnalisation Thème & Couleurs",
    projects: "Gestion des Projets",
    hero: "Édition Hero & Bio",
    skills: "Gestion de la Stack Technique",
    contact: "Coordonnées & Liens Réseaux",
    messages: "Boîte de Réception Messages"
  };

  tabs.forEach(t => t.classList.remove("active"));
  menuItems.forEach(i => i.classList.remove("active"));

  const targetTab = document.getElementById(`tab-${tabName}`);
  const targetMenu = document.querySelector(`.menu-item[data-tab="${tabName}"]`);

  if (targetTab) targetTab.classList.add("active");
  if (targetMenu) targetMenu.classList.add("active");
  if (pageTitle) pageTitle.innerText = titleMap[tabName] || "Panneau d'Administration";
}


function renderOverviewMetrics() {
  const pCountElem = document.getElementById("metricProjectsCount");
  const sCountElem = document.getElementById("metricSkillsCount");
  const mCountElem = document.getElementById("metricMessagesCount");
  const badgeElem = document.getElementById("msgCountBadge");

  if (pCountElem) pCountElem.innerText = (adminData.projects || []).length;
  
  let totalSkills = 0;
  (adminData.skills || []).forEach(cat => totalSkills += (cat.items || []).length);
  if (sCountElem) sCountElem.innerText = totalSkills;

  const msgCount = (adminData.messages || []).length;
  if (mCountElem) mCountElem.innerText = msgCount;
  if (badgeElem) badgeElem.innerText = msgCount;
}

function renderProjectsTable() {
  const tbody = document.getElementById("projectsTableBody");
  if (!tbody) return;

  if (!adminData.projects || adminData.projects.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:2rem; color: var(--text-muted);">
          Aucun projet enregistré dans l'API. Cliquez sur "Nouveau Projet".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminData.projects.map(p => {
    const imgSrc = p.image ? (p.image.startsWith('/') ? p.image : '/' + p.image) : '/assets/images/loyalty_app.png';
    return `
    <tr>
      <td><img src="${imgSrc}" class="table-thumb" onError="this.onerror=null; this.src='/assets/images/loyalty_app.png';" /></td>
      <td>
        <strong style="color:var(--text-main);">${p.title}</strong><br/>
        <span style="font-size:0.8rem; color:var(--text-muted);">${(p.shortDesc || '').substring(0, 60)}...</span>
      </td>
      <td><span style="padding:0.25rem 0.6rem; background:rgba(56,189,248,0.1); border-radius:12px; color:var(--accent-primary); font-size:0.8rem;">${p.categoryLabel || p.category}</span></td>
      <td><span style="font-size:0.8rem; font-family:'Fira Code', monospace; color:var(--text-muted);">${(p.technologies || []).slice(0, 3).join(', ')}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editProject('${p.id}')" title="Modifier via API"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon btn-icon-danger" onclick="deleteProject('${p.id}')" title="Supprimer via API"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}


function renderHeroForm() {
  if (!adminData.hero) return;
  const badgeElem = document.getElementById("heroBadgeText");
  const titleElem = document.getElementById("heroTitleInput");
  const descElem = document.getElementById("heroDescInput");
  const codeElem = document.getElementById("heroCodeInput");

  if (badgeElem) badgeElem.value = adminData.hero.badgeText || "";
  if (titleElem) titleElem.value = adminData.hero.title || "";
  if (descElem) descElem.value = adminData.hero.description || "";
  if (codeElem) codeElem.value = adminData.hero.codeSnippet || "";

  const statsInputsGrid = document.getElementById("statsInputsGrid");
  if (statsInputsGrid && adminData.stats) {
    statsInputsGrid.innerHTML = adminData.stats.map((s, idx) => `
      <div style="background: rgba(0,0,0,0.2); padding:1rem; border-radius:12px; border:1px solid var(--border-color);">
        <label class="form-label">Compteur #${idx + 1} Valeur</label>
        <input type="text" id="stat_num_${idx}" class="form-control" value="${s.number}" style="margin-bottom:0.6rem;" />
        <label class="form-label">Libellé</label>
        <input type="text" id="stat_lbl_${idx}" class="form-control" value="${s.label}" />
      </div>
    `).join('');
  }
}

function renderSkillsGrid() {
  const container = document.getElementById("skillsContainerGrid");
  if (!container || !adminData.skills) return;

  container.innerHTML = adminData.skills.map(cat => `
    <div class="skill-cat-box">
      <h3 style="font-size:1.1rem; font-weight:700; margin-bottom:1rem; display:flex; align-items:center; gap:0.6rem;">
        <i class="fa-solid ${cat.icon || 'fa-code'}" style="color:var(--accent-cyan);"></i> ${cat.categoryTitle}
      </h3>
      <div>
        ${(cat.items || []).map(item => `
          <span class="skill-chip">
            <strong>${item.name}</strong> (${item.level})
            <i class="fa-solid fa-xmark delete-chip" onclick="deleteSkill('${cat.category}', '${encodeURIComponent(item.name)}')"></i>
          </span>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function renderContactInfoForm() {
  if (!adminData.contactInfo) return;
  const emailElem = document.getElementById("infoEmail");
  const locElem = document.getElementById("infoLocation");
  const ghElem = document.getElementById("infoGithub");
  const liElem = document.getElementById("infoLinkedin");

  if (emailElem) emailElem.value = adminData.contactInfo.email || "";
  if (locElem) locElem.value = adminData.contactInfo.location || "";
  if (ghElem) ghElem.value = adminData.contactInfo.github || "";
  if (liElem) liElem.value = adminData.contactInfo.linkedin || "";
}


function renderMessagesTable() {
  const tbody = document.getElementById("messagesTableBody");
  if (!tbody) return;

  if (!adminData.messages || adminData.messages.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:2rem; color: var(--text-muted);">
          Aucun message reçu pour le moment.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = adminData.messages.map(m => `
    <tr>
      <td style="font-size:0.8rem; color:var(--text-muted);">${new Date(m.createdAt).toLocaleString('fr-FR')}</td>
      <td>
        <strong style="color:var(--text-main);">${m.senderName}</strong><br/>
        <a href="mailto:${m.senderEmail}" style="color:var(--accent-cyan); font-size:0.85rem;">${m.senderEmail}</a>
      </td>
      <td><span style="padding:0.2rem 0.5rem; background:rgba(168,85,247,0.15); color:var(--accent-purple); border-radius:8px; font-size:0.8rem;">${m.projectType}</span></td>
      <td style="max-width:300px; line-height:1.5; font-size:0.9rem;">${m.message}</td>
      <td>
        <button class="btn-icon btn-icon-danger" onclick="deleteMessage('${m.id}')" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// EDIT / DELETE ACTIONS (EXPRESS REST API ENDPOINTS)

window.editProject = function(id) {
  const proj = adminData.projects.find(p => p.id === id);
  if (!proj) return;

  document.getElementById("editProjId").value = proj.id;
  document.getElementById("pTitle").value = proj.title;
  document.getElementById("pCategory").value = proj.category;
  document.getElementById("pShortDesc").value = proj.shortDesc;
  document.getElementById("pFullDesc").value = proj.fullDesc;
  document.getElementById("pImage").value = proj.image;
  document.getElementById("pTech").value = (proj.technologies || []).join(", ");
  document.getElementById("pFeatures").value = (proj.features || []).join("\n");
  document.getElementById("pDemoUrl").value = proj.demoUrl;
  document.getElementById("pGithubUrl").value = proj.githubUrl;

  document.getElementById("projectFormTitle").innerText = "Modifier le Projet (ID: " + id + ")";
  document.getElementById("projectFormCard").style.display = "block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteProject = async function(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce projet de la base de données API ?")) {
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        showAdminToast(json.message);
        await loadAdminData();
      } else {
        showAdminToast(json.error, true);
      }
    } catch (e) {
      showAdminToast("Erreur lors de la suppression du projet.", true);
    }
  }
};

window.deleteSkill = async function(category, skillNameEncoded) {
  try {
    const res = await fetch(`/api/admin/skills/${category}/${skillNameEncoded}`, { method: "DELETE" });
    const json = await res.json();
    if (res.ok) {
      showAdminToast(json.message);
      await loadAdminData();
    } else {
      showAdminToast(json.error, true);
    }
  } catch (e) {
    showAdminToast("Erreur lors de la suppression de la compétence.", true);
  }
};

window.deleteMessage = async function(id) {
  if (confirm("Supprimer ce message de la boîte de réception ?")) {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok) {
        showAdminToast(json.message);
        await loadAdminData();
      } else {
        showAdminToast(json.error, true);
      }
    } catch (e) {
      showAdminToast("Erreur de suppression du message.", true);
    }
  }
};

function resetProjectForm() {
  document.getElementById("editProjId").value = "";
  document.getElementById("projectForm").reset();
  document.getElementById("projectFormTitle").innerText = "Ajouter un Nouveau Projet";
}

function showAdminToast(message, isError = false) {
  let toastContainer = document.getElementById("adminToastContainer");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "adminToastContainer";
    toastContainer.className = "admin-toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = "admin-toast";
  toast.style.borderColor = isError ? "var(--accent-red)" : "var(--accent-cyan)";
  toast.innerHTML = `
    <i class="fa-solid ${isError ? 'fa-circle-xmark' : 'fa-circle-check'}" style="color: ${isError ? 'var(--accent-red)' : 'var(--accent-emerald)'};"></i>
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
