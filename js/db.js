/**
 * Portfolio Database & Storage Manager
 * Handles LocalStorage (JSON data) and IndexedDB (binary files: photos, clips, fonts)
 */

const DB_NAME = "KanchalikaPortfolioDB";
const DB_VERSION = 1;
const MEDIA_STORE = "media_files";
const STORAGE_KEY = "kanchalika_portfolio_data_v1";

class PortfolioStorage {
  constructor() {
    this.db = null;
    this.initPromise = this.initIndexedDB();
  }

  // Initialize IndexedDB for large media and custom fonts
  initIndexedDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        console.warn("IndexedDB not supported in this browser. Fallback to localStorage.");
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (e) => {
        console.error("IndexedDB error:", e);
        resolve(null);
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(MEDIA_STORE)) {
          db.createObjectStore(MEDIA_STORE, { keyPath: "id" });
        }
      };
    });
  }

  // Get current portfolio data from localStorage or fallback to default
  getData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with DEFAULT_PORTFOLIO_DATA in case new fields were added
        return {
          profile: { ...DEFAULT_PORTFOLIO_DATA.profile, ...(parsed.profile || {}) },
          education: parsed.education || DEFAULT_PORTFOLIO_DATA.education,
          courses: parsed.courses || DEFAULT_PORTFOLIO_DATA.courses,
          projects: parsed.projects || DEFAULT_PORTFOLIO_DATA.projects,
          settings: { ...DEFAULT_PORTFOLIO_DATA.settings, ...(parsed.settings || {}) }
        };
      }
    } catch (e) {
      console.error("Error reading from localStorage:", e);
    }
    // Return deep clone of default data
    return JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
  }

  // Save portfolio structured data
  saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("portfolioDataChanged", { detail: data }));
      return true;
    } catch (e) {
      console.error("Error saving data to localStorage:", e);
      return false;
    }
  }

  // Reset to default
  resetData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const data = JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_DATA));
      this.saveData(data);
      return data;
    } catch (e) {
      console.error("Error resetting data:", e);
      return DEFAULT_PORTFOLIO_DATA;
    }
  }

  // Save binary/media file into IndexedDB
  async saveMedia(id, fileOrBlob, metadata = {}) {
    await this.initPromise;
    if (!this.db) {
      // Fallback: convert to base64 and store in memory or localStorage if small
      return this.blobToBase64(fileOrBlob);
    }
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([MEDIA_STORE], "readwrite");
      const store = transaction.objectStore(MEDIA_STORE);
      const record = {
        id: id,
        blob: fileOrBlob,
        name: metadata.name || id,
        type: fileOrBlob.type || metadata.type || "application/octet-stream",
        size: fileOrBlob.size,
        updatedAt: new Date().toISOString(),
        ...metadata
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(id);
      req.onerror = (e) => reject(e);
    });
  }

  // Retrieve media file from IndexedDB and return an Object URL
  async getMediaUrl(id) {
    if (!id) return null;
    if (id.startsWith("data:") || id.startsWith("http") || id.startsWith("blob:") || id.startsWith("./") || id.startsWith("/")) {
      return id; // already a valid URL
    }
    await this.initPromise;
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([MEDIA_STORE], "readonly");
        const store = transaction.objectStore(MEDIA_STORE);
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            const url = URL.createObjectURL(req.result.blob);
            resolve(url);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  // Get raw media record
  async getMediaRecord(id) {
    await this.initPromise;
    if (!this.db) return null;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([MEDIA_STORE], "readonly");
      const store = transaction.objectStore(MEDIA_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  // Delete media
  async deleteMedia(id) {
    await this.initPromise;
    if (!this.db) return;
    return new Promise((resolve) => {
      const transaction = this.db.transaction([MEDIA_STORE], "readwrite");
      const store = transaction.objectStore(MEDIA_STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  }

  // List all stored media files
  async listAllMedia() {
    await this.initPromise;
    if (!this.db) return [];
    return new Promise((resolve) => {
      const transaction = this.db.transaction([MEDIA_STORE], "readonly");
      const store = transaction.objectStore(MEDIA_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  // Convert File/Blob to Base64
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Export full JSON backup
  exportBackup() {
    const data = this.getData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Portfolio_Backup_Kanchalika_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import JSON backup
  importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed.profile || !parsed.education) {
            throw new Error("ไฟล์ JSON ไม่ถูกต้องสำหรับ Portfolio");
          }
          this.saveData(parsed);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

// Global storage singleton
window.portfolioDB = new PortfolioStorage();
