/**
 * Main Application Logic for Kanchalika Saisud Portfolio
 * Handles Rendering, Theme Switching, Age Calculation, Filters, and Secret Shortcuts
 */

// Global State
let currentPortfolioData = null;
let currentCategoryFilter = "all";

// Calculate age precisely from birthdate string (YYYY-MM-DD)
function calculateAge(birthDateString) {
  const birthDate = new Date(birthDateString);
  const today = new Date();
  
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    months--;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Display only official clean age (e.g. 17 ปี)
  return {
    years: years,
    months: months,
    formatted: `${years} ปี`,
    formattedDetailed: `${years} ปี`
  };
}

// Switch Active Page (SPA Tab Views)
function switchPage(pageId, updateHash = true) {
  const validPages = ["home", "profile", "education", "courses", "portfolio"];
  if (!validPages.includes(pageId)) {
    pageId = "home";
  }

  // Hide all page-views, show only selected
  document.querySelectorAll(".page-view").forEach(page => {
    if (page.id === pageId) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  });

  // Update navbar links
  document.querySelectorAll(".nav-link").forEach(link => {
    const isCurrent = link.getAttribute("data-page") === pageId;
    link.classList.toggle("active", isCurrent);
  });

  document.querySelectorAll(".nav-link-mobile").forEach(link => {
    const isCurrent = link.getAttribute("data-page") === pageId;
    link.classList.toggle("font-semibold", isCurrent);
    link.classList.toggle("theme-text-accent", isCurrent);
  });

  // Close mobile menu
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileMenu) mobileMenu.classList.add("hidden");

  // Sync URL hash
  if (updateHash && window.location.hash !== `#${pageId}`) {
    history.pushState(null, "", `#${pageId}`);
  }

  // Scroll smoothly to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Format Thai Date
function formatThaiDate(dateString) {
  if (!dateString) return "-";
  const [year, month, day] = dateString.split("-").map(Number);
  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiYear = year + 543;
  return `${day} ${thaiMonths[month - 1]} ${thaiYear}`;
}

// Set Active Color Theme
function setTheme(themeKey) {
  document.documentElement.setAttribute("data-theme", themeKey);
  
  const labels = {
    "warm-zen": "Warm Zen",
    "academic": "Academic",
    "forest": "Forest Gold",
    "rose": "Rose ชมพู่",
    "dark": "Dark Minimal"
  };

  const labelEl = document.getElementById("current-theme-label");
  if (labelEl) {
    labelEl.textContent = labels[themeKey] || "Warm Zen";
  }

  // Save to settings
  if (currentPortfolioData) {
    currentPortfolioData.settings = currentPortfolioData.settings || {};
    currentPortfolioData.settings.activeTheme = themeKey;
    portfolioDB.saveData(currentPortfolioData);
  }

  // Close dropdown if open
  const menu = document.getElementById("theme-menu");
  if (menu) menu.classList.add("hidden");
}

// Change Active Font
function changeActiveFont(fontName) {
  document.documentElement.style.setProperty("--font-body", `'${fontName}', sans-serif`);
  document.documentElement.style.setProperty("--font-heading", `'${fontName}', serif`);
  
  if (currentPortfolioData) {
    currentPortfolioData.settings = currentPortfolioData.settings || {};
    currentPortfolioData.settings.activeFont = fontName;
    portfolioDB.saveData(currentPortfolioData);
  }
}

// Show Toast Message
function showToast(message, isSuccess = true) {
  const toast = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  const iconEl = document.getElementById("toast-icon");
  if (!toast) return;

  msgEl.textContent = message;
  iconEl.innerHTML = isSuccess
    ? `<svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`
    : `<svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

// Render Profile Section
async function renderProfile(profile) {
  if (!profile) return;

  // Hero Section
  const heroName = document.getElementById("hero-name");
  if (heroName) heroName.textContent = profile.name;
  
  const heroNick = document.getElementById("hero-nickname");
  if (heroNick) heroNick.textContent = `(${profile.nickname || "ชมพู่"})`;

  const heroMotto = document.getElementById("hero-motto");
  if (heroMotto) heroMotto.textContent = `"${profile.motto || ''}"`;

  const heroStudentID = document.getElementById("hero-studentid");
  if (heroStudentID) heroStudentID.textContent = profile.studentId;

  // Age calculation
  const ageInfo = calculateAge(profile.birthdate || "2008-11-20");
  const heroAge = document.getElementById("hero-age");
  if (heroAge) heroAge.textContent = ageInfo.formatted;

  const heroGpa = document.getElementById("hero-gpa");
  if (heroGpa && currentPortfolioData && currentPortfolioData.education) {
    const secEdu = currentPortfolioData.education.find(e => e.level.includes("มัธยม")) || currentPortfolioData.education[1];
    if (secEdu && secEdu.gpa) heroGpa.textContent = secEdu.gpa;
  }

  const cardName = document.getElementById("card-name");
  if (cardName) cardName.textContent = profile.name;

  // Profile Card Information
  const pFullName = document.getElementById("p-fullname");
  if (pFullName) pFullName.textContent = profile.name;

  const pNick = document.getElementById("p-nickname");
  if (pNick) pNick.textContent = profile.nickname || "ชมพู่";

  const pStudentID = document.getElementById("p-studentid");
  if (pStudentID) pStudentID.textContent = profile.studentId;

  const pBirth = document.getElementById("p-birthdate");
  if (pBirth) pBirth.textContent = formatThaiDate(profile.birthdate);

  const pAgeDetail = document.getElementById("p-age-detail");
  if (pAgeDetail) pAgeDetail.textContent = ageInfo.formattedDetailed;

  const pNat = document.getElementById("p-nationality");
  if (pNat) pNat.textContent = profile.nationality || "ไทย";

  const pEth = document.getElementById("p-ethnicity");
  if (pEth) pEth.textContent = profile.ethnicity || "ไทย";

  const pUni = document.getElementById("p-university");
  if (pUni) pUni.textContent = profile.university;

  const pFac = document.getElementById("p-faculty");
  if (pFac) pFac.textContent = profile.faculty;

  const pMaj = document.getElementById("p-major");
  if (pMaj) pMaj.textContent = profile.major;

  const pPhone = document.getElementById("p-phone");
  if (pPhone) pPhone.textContent = profile.phone;

  const pEmail = document.getElementById("p-email");
  if (pEmail) pEmail.textContent = profile.email;

  const pTalents = document.getElementById("p-talents");
  if (pTalents) pTalents.textContent = profile.talents;

  const pAboutMe = document.getElementById("p-aboutme");
  if (pAboutMe) pAboutMe.textContent = profile.aboutMe;

  // Render Skills
  const skillsList = document.getElementById("skills-list");
  if (skillsList && profile.skills) {
    skillsList.innerHTML = profile.skills.map(s => `
      <span class="badge-pill text-[11px]">
        <span>${s.name}</span>
      </span>
    `).join("");
  }

  // Profile Avatar
  const avatarContainer = document.getElementById("hero-avatar-container");
  if (avatarContainer) {
    if (profile.avatar) {
      const avatarUrl = await portfolioDB.getMediaUrl(profile.avatar);
      if (avatarUrl) {
        avatarContainer.innerHTML = `<img src="${avatarUrl}" alt="${profile.name}" class="w-full h-full object-cover">`;
      }
    } else {
      // Default artistic avatar
      avatarContainer.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center theme-bg-secondary p-4 text-center">
          <div class="w-20 h-20 rounded-full theme-accent-btn flex items-center justify-center font-serif text-2xl font-bold mb-2 shadow-inner">
            กช
          </div>
          <div class="font-bold text-sm theme-text-primary">ชมพู่ • กัญชลิกา</div>
          <div class="text-[11px] theme-text-muted mt-0.5">ครุศาสตร์อุตสาหกรรมไฟฟ้า</div>
        </div>
      `;
    }
  }

  // Footer sync
  const footerName = document.getElementById("footer-name");
  if (footerName) footerName.textContent = `จัดทำโดย ${profile.name}`;

  const footerStudentID = document.getElementById("footer-studentid");
  if (footerStudentID) footerStudentID.textContent = profile.studentId;

  const footerUni = document.getElementById("footer-university");
  if (footerUni) footerUni.textContent = profile.university;

  const footerFac = document.getElementById("footer-faculty");
  if (footerFac) footerFac.textContent = profile.faculty;

  const footerMaj = document.getElementById("footer-major");
  if (footerMaj) footerMaj.textContent = profile.major;
}

// Render Education Timeline
function renderEducation(educationList) {
  const container = document.getElementById("education-timeline");
  if (!container || !educationList) return;

  const heroGpa = document.getElementById("hero-gpa");
  if (heroGpa) {
    const secEdu = educationList.find(e => e.level.includes("มัธยม")) || educationList[1];
    if (secEdu && secEdu.gpa) heroGpa.textContent = secEdu.gpa;
  }

  container.innerHTML = educationList.map((edu, idx) => `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="theme-card p-5 rounded-2xl relative group">
        
        <!-- Admin Edit Button -->
        <button onclick="editEducation('${edu.id}')" class="edit-btn hidden absolute top-4 right-4 p-1.5 rounded-lg border theme-border hover:theme-bg-accent text-xs" title="แก้ไขรายการนี้">
          ✎ แก้ไข
        </button>

        <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span class="badge-pill text-[11px] font-semibold">${edu.badge || 'ประวัติการศึกษา'}</span>
          <span class="text-xs font-semibold theme-text-accent">${edu.year || ''}</span>
        </div>

        <h3 class="text-lg font-bold theme-text-primary">${edu.institution}</h3>
        <div class="text-xs theme-text-secondary mt-0.5 font-medium">
          ${edu.level} ${edu.faculty && edu.faculty !== '-' ? `• ${edu.faculty}` : ''} ${edu.major && edu.major !== '-' ? `(${edu.major})` : ''}
        </div>

        <div class="flex items-center gap-3 mt-3 pt-3 border-t theme-border text-xs">
          <div>
            <span class="theme-text-muted">เกรดเฉลี่ย (GPA):</span>
            <span class="font-bold theme-text-primary ml-1 px-2 py-0.5 rounded-md theme-bg-secondary border theme-border">${edu.gpa || '-'}</span>
          </div>
        </div>

        ${edu.description ? `
          <p class="text-xs theme-text-secondary mt-2.5 leading-relaxed">${edu.description}</p>
        ` : ''}

      </div>
    </div>
  `).join("");
}

// Render Courses and Coursework
function renderCourses(courses) {
  const container = document.getElementById("courses-grid");
  if (!container || !courses) return;

  container.innerHTML = courses.map(c => `
    <div class="theme-card p-6 rounded-2xl flex flex-col justify-between relative group">
      
      <!-- Admin Edit Button -->
      <button onclick="editCourse('${c.id}')" class="edit-btn hidden absolute top-4 right-4 p-1.5 rounded-lg border theme-border hover:theme-bg-accent text-xs" title="แก้ไขวิชานี้">
        ✎ แก้ไข
      </button>

      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md theme-bg-badge border theme-border theme-text-accent">
            ${c.code}
          </span>
          <span class="text-xs theme-text-muted">${c.credits || ''}</span>
        </div>

        <h3 class="text-base font-bold theme-text-primary mt-1">${c.name}</h3>
        <p class="text-xs theme-text-muted mt-0.5">${c.instructor || 'สาขาครุศาสตร์อุตสาหกรรมไฟฟ้า'}</p>

        <p class="text-xs theme-text-secondary mt-3 leading-relaxed">
          ${c.description}
        </p>

        ${c.skillsGained ? `
          <div class="mt-3 pt-3 border-t theme-border">
            <span class="text-[11px] font-semibold theme-text-muted block mb-1">ทักษะที่ฝึกฝน:</span>
            <div class="flex flex-wrap gap-1">
              ${c.skillsGained.split(",").map(sk => `<span class="badge-pill text-[10px]">${sk.trim()}</span>`).join("")}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Coursework Items Section -->
      ${c.items && c.items.length > 0 ? `
        <div class="mt-4 pt-4 border-t theme-border space-y-2">
          <div class="text-xs font-bold theme-text-primary flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 theme-text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <span>ชิ้นงานในรายวิชา (${c.items.length} รายการ)</span>
          </div>
          <div class="space-y-2">
            ${c.items.map(item => `
              <div class="p-3 rounded-xl theme-bg-secondary border theme-border">
                <div class="font-semibold text-xs theme-text-primary">${item.title}</div>
                <div class="text-[11px] theme-text-secondary mt-0.5 leading-relaxed">${item.desc}</div>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ''}

    </div>
  `).join("");
}

// Render Projects / Activities Grid
async function renderProjects(projects, categoryFilter = "all") {
  const container = document.getElementById("projects-grid");
  if (!container || !projects) return;

  const filtered = categoryFilter === "all"
    ? projects
    : projects.filter(p => p.category === categoryFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 theme-text-muted">
        <p class="text-sm">ไม่พบผลงานในหมวดหมู่นี้</p>
      </div>
    `;
    return;
  }

  // Pre-fetch media urls
  const cardsHtml = await Promise.all(filtered.map(async (p) => {
    let imgUrl = null;
    if (p.image) {
      imgUrl = await portfolioDB.getMediaUrl(p.image);
    }

    const categoryIcons = {
      electrical: "⚡",
      creative: "🎨",
      activity: "👥",
      certificate: "📜"
    };

    return `
      <div class="theme-card rounded-2xl overflow-hidden flex flex-col justify-between group relative">
        
        <!-- Admin Edit Button -->
        <button onclick="editProject('${p.id}')" class="edit-btn hidden absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/90 border theme-border shadow-sm text-xs" title="แก้ไขผลงานนี้">
          ✎ แก้ไข
        </button>

        <!-- Image / Cover Box -->
        <div class="relative h-44 theme-bg-secondary overflow-hidden border-b theme-border flex items-center justify-center cursor-pointer" onclick="openProjectLightbox('${p.id}')">
          ${imgUrl ? `
            <img src="${imgUrl}" alt="${p.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
          ` : `
            <div class="flex flex-col items-center justify-center p-4 text-center">
              <span class="text-3xl mb-1">${categoryIcons[p.category] || "📁"}</span>
              <span class="text-xs font-medium theme-text-muted">${p.categoryName || 'ผลงาน'}</span>
            </div>
          `}
          
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            <span>คลิกเพื่อดูรายละเอียด</span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div class="flex items-center justify-between text-[11px] mb-1">
              <span class="badge-pill text-[10px] font-semibold">${p.categoryName || p.category}</span>
              <span class="theme-text-muted">${p.date || ''}</span>
            </div>

            <h3 class="text-sm font-bold theme-text-primary leading-snug mt-2 group-hover:theme-text-accent transition-colors">
              ${p.title}
            </h3>

            <p class="text-xs theme-text-secondary mt-1.5 leading-relaxed line-clamp-3">
              ${p.description}
            </p>
          </div>

          <!-- Tags -->
          ${p.tags && p.tags.length > 0 ? `
            <div class="flex flex-wrap gap-1 pt-2 border-t theme-border">
              ${p.tags.map(t => `<span class="text-[10px] px-2 py-0.5 rounded-full theme-bg-secondary border theme-border theme-text-muted">${t}</span>`).join("")}
            </div>
          ` : ''}

        </div>

      </div>
    `;
  }));

  container.innerHTML = cardsHtml.join("");
}

// Filter Portfolio Category
function filterPortfolio(category) {
  currentCategoryFilter = category;
  
  // Update buttons state
  document.querySelectorAll(".portfolio-filter-btn").forEach(btn => {
    if (btn.getAttribute("data-category") === category) {
      btn.classList.add("active", "theme-accent-btn");
      btn.classList.remove("theme-bg-card");
    } else {
      btn.classList.remove("active", "theme-accent-btn");
      btn.classList.add("theme-bg-card");
    }
  });

  if (currentPortfolioData) {
    renderProjects(currentPortfolioData.projects, category);
  }
}

// Open Lightbox for specific project
async function openProjectLightbox(projectId) {
  if (!currentPortfolioData) return;
  const project = currentPortfolioData.projects.find(p => p.id === projectId);
  if (!project) return;

  const contentBox = document.getElementById("lightbox-content");
  const captionBox = document.getElementById("lightbox-caption");
  if (!contentBox) return;

  let imgUrl = null;
  if (project.image) {
    imgUrl = await portfolioDB.getMediaUrl(project.image);
  }

  contentBox.innerHTML = imgUrl ? `
    <img src="${imgUrl}" alt="${project.title}" class="max-h-[75vh] w-auto max-w-full object-contain">
  ` : `
    <div class="p-12 text-center text-white space-y-2">
      <div class="text-4xl">📁</div>
      <div class="text-base font-bold">${project.title}</div>
      <div class="text-xs text-stone-400">ยังไม่มีไฟล์รูปภาพประกอบ</div>
    </div>
  `;

  captionBox.innerHTML = `
    <div class="font-bold text-sm text-stone-200">${project.title}</div>
    <div class="text-xs text-stone-300 mt-1">${project.description}</div>
    ${project.role ? `<div class="text-[11px] text-amber-400 mt-1">บทบาท: ${project.role}</div>` : ''}
  `;

  document.getElementById("lightbox-modal").classList.add("active");
}

function closeLightbox(e) {
  if (e.target.id === "lightbox-modal" || e.target.closest("button")) {
    document.getElementById("lightbox-modal").classList.remove("active");
  }
}

// Secret Shortcut Listener: Ctrl + Alt + P
function initSecretKeybindings() {
  window.addEventListener("keydown", (e) => {
    // Check for Ctrl + Alt + P (or Cmd + Alt + P on Mac)
    if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "p" || e.key === "P" || e.code === "KeyP")) {
      e.preventDefault();
      openModal("login-modal");
      const userInput = document.getElementById("login-user");
      if (userInput) userInput.focus();
    }
  });

  // Mobile convenience: triple-tap or click on monogram opens secret login
  let tapCount = 0;
  let tapTimer = null;
  const monogram = document.querySelector("header a");
  if (monogram) {
    monogram.addEventListener("click", (e) => {
      tapCount++;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => { tapCount = 0; }, 600);
      if (tapCount >= 3) {
        e.preventDefault();
        openModal("login-modal");
        tapCount = 0;
      }
    });
  }

  // Theme dropdown click toggle
  const themeBtn = document.getElementById("theme-btn");
  const themeMenu = document.getElementById("theme-menu");
  if (themeBtn && themeMenu) {
    themeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", () => {
      themeMenu.classList.add("hidden");
    });
  }

  // Mobile menu toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }
}

// Modal generic open/close
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

// Load and render whole portfolio
async function initApp() {
  currentPortfolioData = portfolioDB.getData();

  // Apply saved theme and font
  if (currentPortfolioData.settings) {
    if (currentPortfolioData.settings.activeTheme) {
      setTheme(currentPortfolioData.settings.activeTheme);
    }
    if (currentPortfolioData.settings.activeFont) {
      changeActiveFont(currentPortfolioData.settings.activeFont);
    }
  }

  // Render sections
  await renderProfile(currentPortfolioData.profile);
  renderEducation(currentPortfolioData.education);
  renderCourses(currentPortfolioData.courses);
  await renderProjects(currentPortfolioData.projects, currentCategoryFilter);

  // Listen for storage changes
  window.addEventListener("portfolioDataChanged", (e) => {
    currentPortfolioData = e.detail;
    renderProfile(currentPortfolioData.profile);
    renderEducation(currentPortfolioData.education);
    renderCourses(currentPortfolioData.courses);
    renderProjects(currentPortfolioData.projects, currentCategoryFilter);
  });

  // Setup secret keyboard shortcuts
  initSecretKeybindings();

  // Handle initial page hash (SPA Tab routing)
  const initialHash = window.location.hash.replace("#", "");
  switchPage(initialHash || "home", false);

  window.addEventListener("hashchange", () => {
    const hashPage = window.location.hash.replace("#", "");
    if (hashPage) switchPage(hashPage, false);
  });

  // Check existing session
  checkAdminSession();
}

document.addEventListener("DOMContentLoaded", initApp);
