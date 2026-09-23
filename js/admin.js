/**
 * Admin CMS & Visual Editor for Kanchalika Saisud Portfolio
 * Handles Secret Authentication (kanchalika / 250820), Live In-Browser Editing,
 * CRUD Operations for all sections, and Universal File & Font Uploads.
 */

const ADMIN_CREDENTIALS = {
  username: "kanchalika",
  password: "250820"
};

const SESSION_KEY = "kanchalika_portfolio_admin_auth";
let isVisualEditActive = false;

// Check existing admin session
function checkAdminSession() {
  const isAuth = sessionStorage.getItem(SESSION_KEY) === "true";
  if (isAuth) {
    activateAdminMode();
  }
}

// Handle secret login submission
function handleSecretLogin(event) {
  event.preventDefault();
  const user = document.getElementById("login-user").value.trim();
  const pass = document.getElementById("login-pass").value.trim();
  const errorEl = document.getElementById("login-error");

  if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem(SESSION_KEY, "true");
    closeModal("login-modal");
    if (errorEl) errorEl.classList.add("hidden");
    activateAdminMode();
    showToast("เข้าสู่ระบบจัดการสำเร็จ ยินดีต้อนรับคุณกัญชลิกา", true);
  } else {
    if (errorEl) {
      errorEl.classList.remove("hidden");
      errorEl.textContent = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    }
  }
}

// Activate admin interface
function activateAdminMode() {
  const dock = document.getElementById("admin-dock");
  if (dock) dock.classList.remove("hidden");

  // Show edit buttons
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.classList.remove("hidden");
    btn.classList.add("inline-flex");
  });

  // Show photo upload trigger
  const photoBtn = document.getElementById("quick-change-photo-btn");
  if (photoBtn) photoBtn.classList.remove("hidden");

  // Enable inline editing listeners
  setupInlineEditable();
}

// Logout
function handleAdminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  const dock = document.getElementById("admin-dock");
  if (dock) dock.classList.add("hidden");

  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.classList.add("hidden");
    btn.classList.remove("inline-flex");
  });

  const photoBtn = document.getElementById("quick-change-photo-btn");
  if (photoBtn) photoBtn.classList.add("hidden");

  document.body.classList.remove("admin-mode");
  isVisualEditActive = false;
  const indicator = document.getElementById("edit-mode-indicator");
  if (indicator) indicator.textContent = "✏️ แก้ไขสด: ปิด";

  showToast("ออกจากระบบจัดการเรียบร้อยแล้ว", true);
}

// Toggle Live Visual Edit Mode
function toggleVisualEdit() {
  isVisualEditActive = !isVisualEditActive;
  const indicator = document.getElementById("edit-mode-indicator");

  if (isVisualEditActive) {
    document.body.classList.add("admin-mode");
    if (indicator) indicator.textContent = "✏️ แก้ไขสด: เปิดอยู่";
    showToast("เปิดโหมดแก้ไขสด: สามารถคลิกที่ข้อความเพื่อพิมพ์แก้ไขได้ทันที");
  } else {
    document.body.classList.remove("admin-mode");
    if (indicator) indicator.textContent = "✏️ แก้ไขสด: ปิด";
    showToast("ปิดโหมดแก้ไขสดแล้ว");
  }
}

// Setup Inline Editable elements
function setupInlineEditable() {
  document.querySelectorAll("[data-editable]").forEach(el => {
    // Only setup once
    if (el.dataset.listenerAttached) return;
    el.dataset.listenerAttached = "true";

    el.addEventListener("click", function(e) {
      if (!isVisualEditActive) return;
      e.stopPropagation();

      const currentText = this.innerText.trim();
      const path = this.getAttribute("data-editable");
      
      const newText = prompt(`แก้ไขข้อความ (${path}):`, currentText);
      if (newText !== null && newText.trim() !== "") {
        this.innerText = newText;
        setDeepValue(currentPortfolioData, path, newText);
        portfolioDB.saveData(currentPortfolioData);
        showToast("บันทึกการแก้ไขเรียบร้อยแล้ว");
      }
    });
  });
}

// Utility to set deep nested property
function setDeepValue(obj, path, value) {
  const parts = path.split(".");
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]]) curr[parts[i]] = {};
    curr = curr[parts[i]];
  }
  curr[parts[parts.length - 1]] = value;
}

// --------------------------------------------------------------------------
// PROFILE MODAL & EDIT
// --------------------------------------------------------------------------
function openProfileModal() {
  if (!currentPortfolioData) return;
  const p = currentPortfolioData.profile;

  document.getElementById("edit-p-name").value = p.name || "";
  document.getElementById("edit-p-nickname").value = p.nickname || "";
  document.getElementById("edit-p-studentid").value = p.studentId || "";
  document.getElementById("edit-p-birthdate").value = p.birthdate || "2008-11-20";
  document.getElementById("edit-p-phone").value = p.phone || "";
  document.getElementById("edit-p-email").value = p.email || "";
  document.getElementById("edit-p-nationality").value = p.nationality || "ไทย";
  document.getElementById("edit-p-ethnicity").value = p.ethnicity || "ไทย";
  document.getElementById("edit-p-university").value = p.university || "";
  document.getElementById("edit-p-faculty").value = p.faculty || "";
  document.getElementById("edit-p-major").value = p.major || "";
  document.getElementById("edit-p-motto").value = p.motto || "";
  document.getElementById("edit-p-talents").value = p.talents || "";
  document.getElementById("edit-p-aboutme").value = p.aboutMe || "";

  openModal("profile-modal");
}

function saveProfileForm(e) {
  e.preventDefault();
  if (!currentPortfolioData) return;

  currentPortfolioData.profile = {
    ...currentPortfolioData.profile,
    name: document.getElementById("edit-p-name").value.trim(),
    nickname: document.getElementById("edit-p-nickname").value.trim(),
    studentId: document.getElementById("edit-p-studentid").value.trim(),
    birthdate: document.getElementById("edit-p-birthdate").value.trim(),
    phone: document.getElementById("edit-p-phone").value.trim(),
    email: document.getElementById("edit-p-email").value.trim(),
    nationality: document.getElementById("edit-p-nationality").value.trim(),
    ethnicity: document.getElementById("edit-p-ethnicity").value.trim(),
    university: document.getElementById("edit-p-university").value.trim(),
    faculty: document.getElementById("edit-p-faculty").value.trim(),
    major: document.getElementById("edit-p-major").value.trim(),
    motto: document.getElementById("edit-p-motto").value.trim(),
    talents: document.getElementById("edit-p-talents").value.trim(),
    aboutMe: document.getElementById("edit-p-aboutme").value.trim()
  };

  portfolioDB.saveData(currentPortfolioData);
  renderProfile(currentPortfolioData.profile);
  closeModal("profile-modal");
  showToast("บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว");
}

// Quick Photo Uploader Trigger
function openPhotoUploader() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const mediaId = `avatar_${Date.now()}`;
    await portfolioDB.saveMedia(mediaId, file, { name: file.name, type: file.type });
    currentPortfolioData.profile.avatar = mediaId;
    portfolioDB.saveData(currentPortfolioData);
    await renderProfile(currentPortfolioData.profile);
    showToast("เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว");
  };
  input.click();
}

// --------------------------------------------------------------------------
// EDUCATION MODAL & EDIT
// --------------------------------------------------------------------------
function openEducationModal(eduId = null) {
  const modalTitle = document.getElementById("edu-modal-title");
  const deleteBtn = document.getElementById("btn-delete-edu");
  const idInput = document.getElementById("edit-edu-id");

  if (eduId && currentPortfolioData) {
    const edu = currentPortfolioData.education.find(e => e.id === eduId);
    if (!edu) return;
    modalTitle.textContent = "แก้ไขประวัติการศึกษา";
    idInput.value = edu.id;
    document.getElementById("edit-edu-level").value = edu.level || "";
    document.getElementById("edit-edu-institution").value = edu.institution || "";
    document.getElementById("edit-edu-faculty").value = edu.faculty || "";
    document.getElementById("edit-edu-major").value = edu.major || "";
    document.getElementById("edit-edu-year").value = edu.year || "";
    document.getElementById("edit-edu-gpa").value = edu.gpa || "";
    document.getElementById("edit-edu-desc").value = edu.description || "";
    if (deleteBtn) deleteBtn.classList.remove("hidden");
  } else {
    modalTitle.textContent = "เพิ่มประวัติการศึกษา";
    idInput.value = "";
    document.getElementById("education-form").reset();
    if (deleteBtn) deleteBtn.classList.add("hidden");
  }

  openModal("education-modal");
}

function editEducation(eduId) {
  openEducationModal(eduId);
}

function saveEducationForm(e) {
  e.preventDefault();
  if (!currentPortfolioData) return;

  const id = document.getElementById("edit-edu-id").value;
  const newEdu = {
    id: id || `edu-${Date.now()}`,
    level: document.getElementById("edit-edu-level").value.trim(),
    institution: document.getElementById("edit-edu-institution").value.trim(),
    faculty: document.getElementById("edit-edu-faculty").value.trim(),
    major: document.getElementById("edit-edu-major").value.trim(),
    year: document.getElementById("edit-edu-year").value.trim(),
    gpa: document.getElementById("edit-edu-gpa").value.trim(),
    description: document.getElementById("edit-edu-desc").value.trim(),
    badge: "การศึกษา"
  };

  if (id) {
    const idx = currentPortfolioData.education.findIndex(e => e.id === id);
    if (idx !== -1) currentPortfolioData.education[idx] = newEdu;
  } else {
    currentPortfolioData.education.push(newEdu);
  }

  portfolioDB.saveData(currentPortfolioData);
  renderEducation(currentPortfolioData.education);
  closeModal("education-modal");
  showToast("บันทึกประวัติการศึกษาเรียบร้อยแล้ว");
}

function deleteEducation() {
  const id = document.getElementById("edit-edu-id").value;
  if (!id || !confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการการศึกษานี้?")) return;

  currentPortfolioData.education = currentPortfolioData.education.filter(e => e.id !== id);
  portfolioDB.saveData(currentPortfolioData);
  renderEducation(currentPortfolioData.education);
  closeModal("education-modal");
  showToast("ลบรายการการศึกษาเรียบร้อยแล้ว");
}

// --------------------------------------------------------------------------
// COURSE MODAL & EDIT
// --------------------------------------------------------------------------
function openCourseModal(courseId = null) {
  const modalTitle = document.getElementById("course-modal-title");
  const deleteBtn = document.getElementById("btn-delete-course");
  const idInput = document.getElementById("edit-course-id");

  if (courseId && currentPortfolioData) {
    const c = currentPortfolioData.courses.find(x => x.id === courseId);
    if (!c) return;
    modalTitle.textContent = "แก้ไขรายวิชา & ชิ้นงาน";
    idInput.value = c.id;
    document.getElementById("edit-course-code").value = c.code || "";
    document.getElementById("edit-course-name").value = c.name || "";
    document.getElementById("edit-course-credits").value = c.credits || "";
    document.getElementById("edit-course-instructor").value = c.instructor || "";
    document.getElementById("edit-course-desc").value = c.description || "";
    document.getElementById("edit-course-skills").value = c.skillsGained || "";
    
    // First coursework item
    if (c.items && c.items.length > 0) {
      document.getElementById("edit-course-item-title").value = c.items[0].title || "";
      document.getElementById("edit-course-item-desc").value = c.items[0].desc || "";
    } else {
      document.getElementById("edit-course-item-title").value = "";
      document.getElementById("edit-course-item-desc").value = "";
    }

    if (deleteBtn) deleteBtn.classList.remove("hidden");
  } else {
    modalTitle.textContent = "เพิ่มรายวิชา & ชิ้นงานใหม่";
    idInput.value = "";
    document.getElementById("course-form").reset();
    if (deleteBtn) deleteBtn.classList.add("hidden");
  }

  openModal("course-modal");
}

function editCourse(courseId) {
  openCourseModal(courseId);
}

function saveCourseForm(e) {
  e.preventDefault();
  if (!currentPortfolioData) return;

  const id = document.getElementById("edit-course-id").value;
  const itemTitle = document.getElementById("edit-course-item-title").value.trim();
  const itemDesc = document.getElementById("edit-course-item-desc").value.trim();

  const items = [];
  if (itemTitle) {
    items.push({
      title: itemTitle,
      desc: itemDesc,
      image: ""
    });
  }

  const newCourse = {
    id: id || `course-${Date.now()}`,
    code: document.getElementById("edit-course-code").value.trim(),
    name: document.getElementById("edit-course-name").value.trim(),
    credits: document.getElementById("edit-course-credits").value.trim(),
    instructor: document.getElementById("edit-course-instructor").value.trim(),
    description: document.getElementById("edit-course-desc").value.trim(),
    skillsGained: document.getElementById("edit-course-skills").value.trim(),
    items: items
  };

  if (id) {
    const idx = currentPortfolioData.courses.findIndex(c => c.id === id);
    if (idx !== -1) currentPortfolioData.courses[idx] = newCourse;
  } else {
    currentPortfolioData.courses.push(newCourse);
  }

  portfolioDB.saveData(currentPortfolioData);
  renderCourses(currentPortfolioData.courses);
  closeModal("course-modal");
  showToast("บันทึกรายวิชาเรียบร้อยแล้ว");
}

function deleteCourse() {
  const id = document.getElementById("edit-course-id").value;
  if (!id || !confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายวิชานี้?")) return;

  currentPortfolioData.courses = currentPortfolioData.courses.filter(c => c.id !== id);
  portfolioDB.saveData(currentPortfolioData);
  renderCourses(currentPortfolioData.courses);
  closeModal("course-modal");
  showToast("ลบรายวิชาเรียบร้อยแล้ว");
}

// --------------------------------------------------------------------------
// PROJECT & ACTIVITY MODAL & EDIT
// --------------------------------------------------------------------------
async function openProjectModal(projectId = null) {
  const modalTitle = document.getElementById("project-modal-title");
  const deleteBtn = document.getElementById("btn-delete-project");
  const idInput = document.getElementById("edit-project-id");
  const previewDiv = document.getElementById("project-image-preview");
  const previewImg = document.getElementById("project-preview-img");
  const existingImgInput = document.getElementById("edit-project-image-existing");
  const fileInput = document.getElementById("edit-project-image-file");

  fileInput.value = "";

  if (projectId && currentPortfolioData) {
    const p = currentPortfolioData.projects.find(x => x.id === projectId);
    if (!p) return;
    modalTitle.textContent = "แก้ไขผลงาน / กิจกรรม";
    idInput.value = p.id;
    document.getElementById("edit-project-title").value = p.title || "";
    document.getElementById("edit-project-category").value = p.category || "electrical";
    document.getElementById("edit-project-date").value = p.date || "";
    document.getElementById("edit-project-role").value = p.role || "";
    document.getElementById("edit-project-desc").value = p.description || "";
    document.getElementById("edit-project-tags").value = (p.tags || []).join(", ");
    existingImgInput.value = p.image || "";

    if (p.image) {
      const url = await portfolioDB.getMediaUrl(p.image);
      if (url) {
        previewImg.src = url;
        previewDiv.classList.remove("hidden");
      } else {
        previewDiv.classList.add("hidden");
      }
    } else {
      previewDiv.classList.add("hidden");
    }

    if (deleteBtn) deleteBtn.classList.remove("hidden");
  } else {
    modalTitle.textContent = "เพิ่มผลงาน / กิจกรรมใหม่";
    idInput.value = "";
    existingImgInput.value = "";
    previewDiv.classList.add("hidden");
    document.getElementById("project-form").reset();
    if (deleteBtn) deleteBtn.classList.add("hidden");
  }

  openModal("project-modal");
}

function editProject(projectId) {
  openProjectModal(projectId);
}

async function saveProjectForm(e) {
  e.preventDefault();
  if (!currentPortfolioData) return;

  const id = document.getElementById("edit-project-id").value;
  const fileInput = document.getElementById("edit-project-image-file");
  let imageId = document.getElementById("edit-project-image-existing").value;

  // Handle image upload if a file was selected
  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    imageId = `proj_img_${Date.now()}`;
    await portfolioDB.saveMedia(imageId, file, { name: file.name, type: file.type });
  }

  const category = document.getElementById("edit-project-category").value;
  const categoryNames = {
    electrical: "ผลงานทางวิชาการและไฟฟ้า",
    creative: "ผลงานศิลปะและการวาดรูป",
    activity: "กิจกรรมในสถาบัน",
    certificate: "เกียรติบัตรและประกาศนียบัตร"
  };

  const tagsRaw = document.getElementById("edit-project-tags").value;
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()).filter(Boolean) : [];

  const newProject = {
    id: id || `proj-${Date.now()}`,
    title: document.getElementById("edit-project-title").value.trim(),
    category: category,
    categoryName: categoryNames[category] || "ผลงาน",
    date: document.getElementById("edit-project-date").value.trim(),
    role: document.getElementById("edit-project-role").value.trim(),
    description: document.getElementById("edit-project-desc").value.trim(),
    tags: tags,
    image: imageId,
    featured: true
  };

  if (id) {
    const idx = currentPortfolioData.projects.findIndex(p => p.id === id);
    if (idx !== -1) currentPortfolioData.projects[idx] = newProject;
  } else {
    currentPortfolioData.projects.unshift(newProject);
  }

  portfolioDB.saveData(currentPortfolioData);
  await renderProjects(currentPortfolioData.projects, currentCategoryFilter);
  closeModal("project-modal");
  showToast("บันทึกผลงานเรียบร้อยแล้ว");
}

async function deleteProject() {
  const id = document.getElementById("edit-project-id").value;
  if (!id || !confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผลงานนี้?")) return;

  currentPortfolioData.projects = currentPortfolioData.projects.filter(p => p.id !== id);
  portfolioDB.saveData(currentPortfolioData);
  await renderProjects(currentPortfolioData.projects, currentCategoryFilter);
  closeModal("project-modal");
  showToast("ลบผลงานเรียบร้อยแล้ว");
}

// --------------------------------------------------------------------------
// THEME & APPEARANCE MODAL
// --------------------------------------------------------------------------
function openThemeModal() {
  openModal("theme-modal");
}

// --------------------------------------------------------------------------
// UNIVERSAL MEDIA & FONT UPLOADER MODAL
// --------------------------------------------------------------------------
async function openMediaUploaderModal() {
  await refreshStoredMediaList();
  openModal("media-modal");
}

async function handleUniversalFileUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileId = `file_${Date.now()}_${i}`;

    // If it's a custom font (.ttf, .otf, .woff, .woff2)
    if (file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      const fontName = file.name.replace(/\.[^/.]+$/, "");
      const arrayBuffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, arrayBuffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      // Add to select options
      const select = document.getElementById("setting-font-select");
      if (select) {
        const opt = document.createElement("option");
        opt.value = fontName;
        opt.textContent = `${fontName} (ฟอนต์ที่อัปโหลด)`;
        select.appendChild(opt);
        select.value = fontName;
      }
      changeActiveFont(fontName);
      showToast(`โหลดฟอนต์ ${fontName} สำเร็จ`);
    }

    // Save into IndexedDB
    await portfolioDB.saveMedia(fileId, file, { name: file.name, type: file.type });
  }

  showToast(`อัปโหลดไฟล์เรียบร้อยแล้ว (${files.length} รายการ)`);
  await refreshStoredMediaList();
  event.target.value = "";
}

async function refreshStoredMediaList() {
  const listEl = document.getElementById("media-stored-list");
  if (!listEl) return;

  const mediaRecords = await portfolioDB.listAllMedia();
  if (mediaRecords.length === 0) {
    listEl.innerHTML = `<div class="text-xs theme-text-muted text-center py-4">ยังไม่มีไฟล์ในคลังระบบ</div>`;
    return;
  }

  listEl.innerHTML = mediaRecords.map(m => {
    const sizeKB = (m.size / 1024).toFixed(1);
    return `
      <div class="p-2.5 rounded-xl border theme-border theme-bg-card flex items-center justify-between text-xs">
        <div class="flex items-center gap-2 truncate pr-2">
          <span class="text-base">${m.type.includes('image') ? '🖼️' : m.type.includes('video') ? '🎬' : '📄'}</span>
          <div class="truncate">
            <div class="font-medium theme-text-primary truncate">${m.name}</div>
            <div class="text-[10px] theme-text-muted">${sizeKB} KB • ${m.id}</div>
          </div>
        </div>
        <button onclick="deleteStoredMedia('${m.id}')" class="text-red-500 hover:text-red-700 p-1" title="ลบไฟล์">
          🗑️
        </button>
      </div>
    `;
  }).join("");
}

async function deleteStoredMedia(id) {
  if (!confirm("คุณต้องการลบไฟล์นี้หรือไม่?")) return;
  await portfolioDB.deleteMedia(id);
  await refreshStoredMediaList();
  showToast("ลบไฟล์สำเร็จ");
}

// --------------------------------------------------------------------------
// BACKUP & RESTORE MODAL
// --------------------------------------------------------------------------
function openBackupModal() {
  openModal("backup-modal");
}

async function handleImportFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const importedData = await portfolioDB.importBackup(file);
    currentPortfolioData = importedData;
    await renderProfile(currentPortfolioData.profile);
    renderEducation(currentPortfolioData.education);
    renderCourses(currentPortfolioData.courses);
    await renderProjects(currentPortfolioData.projects, currentCategoryFilter);
    closeModal("backup-modal");
    showToast("นำเข้าข้อมูลสำรองสำเร็จ ข้อมูลอัปเดตเรียบร้อยแล้ว");
  } catch (err) {
    alert("เกิดข้อผิดพลาดในการนำเข้าไฟล์: " + err.message);
  }
}

function handleResetData() {
  if (!confirm("คำเตือน: ข้อมูลที่เคยแก้ไขจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้นของคุณกัญชลิกา ต้องการทำต่อหรือไม่?")) return;
  currentPortfolioData = portfolioDB.resetData();
  renderProfile(currentPortfolioData.profile);
  renderEducation(currentPortfolioData.education);
  renderCourses(currentPortfolioData.courses);
  renderProjects(currentPortfolioData.projects, currentCategoryFilter);
  closeModal("backup-modal");
  showToast("รีเซ็ตข้อมูลสู่ค่าเริ่มต้นเรียบร้อยแล้ว");
}
