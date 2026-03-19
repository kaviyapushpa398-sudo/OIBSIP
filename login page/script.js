/* ================================================================
   NEXUS AUTH — script.js
   Handles: page routing · email auth · Google OAuth
            form validation · password strength · dashboard
   ================================================================ */

"use strict";

// ──────────────────────────────────────────────────────────────────
// SECTION 1: CONFIGURATION
// ──────────────────────────────────────────────────────────────────

/**
 * Replace with your actual Google OAuth Client ID from
 * https://console.cloud.google.com/apis/credentials
 * After replacing, the "Continue with Google" button will trigger
 * a real OAuth popup.
 */
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// Key used to persist session in localStorage
const SESSION_KEY = "nexus_user";


// ──────────────────────────────────────────────────────────────────
// SECTION 2: SESSION HELPERS
// ──────────────────────────────────────────────────────────────────

/**
 * Save a user object to localStorage so the session persists
 * across page refreshes.
 * @param {Object} user - { name, email, picture, method }
 */
function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Read the persisted session object, or null if none exists.
 * @returns {Object|null}
 */
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
  } catch {
    return null;
  }
}

/** Remove session data from storage. */
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}


// ──────────────────────────────────────────────────────────────────
// SECTION 3: PAGE ROUTING
// ──────────────────────────────────────────────────────────────────

/**
 * Show a named page ("login" | "register" | "dashboard") by
 * toggling the .active class and running a brief transition.
 * @param {string} name
 * @param {Event} [e] - optional event to preventDefault on
 */
function showPage(name, e) {
  if (e) e.preventDefault();

  const pages = document.querySelectorAll(".page");
  pages.forEach(p => {
    p.classList.remove("active");
    // Reset inline opacity so CSS animation re-triggers
    p.style.opacity = "";
    p.style.transform = "";
  });

  const target = document.getElementById(`page-${name}`);
  if (!target) return;

  // Brief delay allows the browser to repaint (so animations replay)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      target.classList.add("active");
      window.scrollTo(0, 0);
    });
  });
}

/**
 * Bootstrap: on first load check for an existing session.
 * If one exists, go straight to dashboard; otherwise show login.
 */
function initApp() {
  const user = getSession();
  if (user) {
    populateDashboard(user);
    showPage("dashboard");
  } else {
    showPage("login");
  }
}


// ──────────────────────────────────────────────────────────────────
// SECTION 4: GOOGLE OAUTH
// ──────────────────────────────────────────────────────────────────

/**
 * Trigger the Google One Tap / popup sign-in flow.
 * After the user chooses an account Google calls onGoogleCredential().
 */
function handleGoogleLogin() {
  if (GOOGLE_CLIENT_ID.startsWith("YOUR_GOOGLE")) {
    // Demo mode: show a mock user so you can preview the dashboard
    showToast("⚠️ Using demo Google user — set your Client ID in script.js");
    const mockUser = {
      name:    "Alex Demo",
      email:   "alex.demo@gmail.com",
      picture: `https://ui-avatars.com/api/?name=Alex+Demo&background=00d4ff&color=000&bold=true`,
      method:  "Google (demo)",
      loginAt: new Date().toLocaleTimeString()
    };
    saveSession(mockUser);
    populateDashboard(mockUser);
    showPage("dashboard");
    return;
  }

  // Real Google OAuth — initialize the library and prompt the user
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback:  onGoogleCredential
  });
  google.accounts.id.prompt();
}

/**
 * Callback invoked by Google Identity Services after the user
 * selects their account.  The JWT credential is decoded here
 * to extract profile information.
 * @param {Object} response - { credential: "<JWT>" }
 */
function onGoogleCredential(response) {
  // Decode the JWT payload (base64url → JSON)
  const payload = JSON.parse(atob(response.credential.split(".")[1]));

  const user = {
    name:    payload.name,
    email:   payload.email,
    picture: payload.picture,
    method:  "Google OAuth",
    loginAt: new Date().toLocaleTimeString()
  };

  saveSession(user);
  populateDashboard(user);
  showPage("dashboard");
  showToast(`👋 Welcome, ${user.name}!`);
}


// ──────────────────────────────────────────────────────────────────
// SECTION 5: EMAIL / PASSWORD LOGIN
// ──────────────────────────────────────────────────────────────────

/**
 * Handle the login form submission.
 * Validates fields, shows a loading state, then checks credentials
 * against the mock "database" (localStorage registered accounts).
 * @param {SubmitEvent} e
 */
function handleEmailLogin(e) {
  e.preventDefault();
  clearFormErrors("login");

  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const remember = document.getElementById("remember-me").checked;

  // Client-side validation
  let valid = true;
  if (!isValidEmail(email)) {
    showFieldError("login-email-err", "Please enter a valid email address.");
    valid = false;
  }
  if (password.length < 6) {
    showFieldError("login-pw-err", "Password must be at least 6 characters.");
    valid = false;
  }
  if (!valid) return;

  // Show loading spinner
  setButtonLoading("login-btn", true);

  // Simulate async network request (300–700 ms)
  setTimeout(() => {
    const accounts = getRegisteredAccounts();
    const match    = accounts.find(a => a.email === email && a.password === password);

    setButtonLoading("login-btn", false);

    if (match) {
      // Optionally persist remember-me preference
      if (!remember) {
        // In a real app you'd use a session cookie instead of localStorage
      }

      const user = {
        name:    match.name,
        email:   match.email,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name)}&background=00d4ff&color=000&bold=true`,
        method:  "Email / Password",
        loginAt: new Date().toLocaleTimeString()
      };

      saveSession(user);
      populateDashboard(user);
      showPage("dashboard");
      showToast(`👋 Welcome back, ${user.name}!`);
    } else {
      showAlert("login-error", "Incorrect email or password. Please try again.");
    }
  }, 500 + Math.random() * 400);
}


// ──────────────────────────────────────────────────────────────────
// SECTION 6: REGISTRATION
// ──────────────────────────────────────────────────────────────────

/**
 * Handle the register form submission.
 * Validates all fields, saves the new account to localStorage
 * (mock DB), then redirects to the dashboard.
 * @param {SubmitEvent} e
 */
function handleRegister(e) {
  e.preventDefault();
  clearFormErrors("register");
  hideAlert("register-error");
  hideAlert("register-success");

  const name     = document.getElementById("reg-name").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm  = document.getElementById("reg-confirm").value;

  // Validate
  let valid = true;
  if (name.length < 2) {
    showFieldError("reg-name-err", "Please enter your full name.");
    valid = false;
  }
  if (!isValidEmail(email)) {
    showFieldError("reg-email-err", "Please enter a valid email address.");
    valid = false;
  }
  if (password.length < 8) {
    showFieldError("reg-pw-err", "Password must be at least 8 characters.");
    valid = false;
  }
  if (password !== confirm) {
    showFieldError("reg-confirm-err", "Passwords do not match.");
    valid = false;
  }
  if (!valid) return;

  // Check for duplicate account
  const accounts = getRegisteredAccounts();
  if (accounts.find(a => a.email === email)) {
    showAlert("register-error", "An account with this email already exists.");
    return;
  }

  setButtonLoading("register-btn", true);

  setTimeout(() => {
    // Save new account to mock DB
    accounts.push({ name, email, password });
    localStorage.setItem("nexus_accounts", JSON.stringify(accounts));

    setButtonLoading("register-btn", false);
    showAlert("register-success", "Account created! Signing you in…", "success");

    // Auto sign-in after short delay
    setTimeout(() => {
      const user = {
        name,
        email,
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7b61ff&color=fff&bold=true`,
        method:  "Email / Password",
        loginAt: new Date().toLocaleTimeString()
      };
      saveSession(user);
      populateDashboard(user);
      showPage("dashboard");
      showToast(`🎉 Account created — welcome, ${name}!`);
    }, 1200);

  }, 600);
}

/** Retrieve all registered email accounts from mock DB. */
function getRegisteredAccounts() {
  try {
    return JSON.parse(localStorage.getItem("nexus_accounts")) || [];
  } catch {
    return [];
  }
}


// ──────────────────────────────────────────────────────────────────
// SECTION 7: LOGOUT
// ──────────────────────────────────────────────────────────────────

/**
 * Sign out: clear session, close dropdown, navigate to login.
 */
function handleLogout() {
  clearSession();
  closeDropdown();
  showPage("login");
  showToast("You've been signed out.");
}


// ──────────────────────────────────────────────────────────────────
// SECTION 8: DASHBOARD POPULATION
// ──────────────────────────────────────────────────────────────────

/**
 * Fill all dashboard elements with the logged-in user's data.
 * @param {Object} user
 */
function populateDashboard(user) {
  const fallback = "https://ui-avatars.com/api/?name=User&background=00d4ff&color=000";
  const pic = user.picture || fallback;

  // Main welcome card
  setEl("dash-avatar",     { src: pic, alt: user.name });
  setEl("dash-name",       { text: `Hello, ${user.name}` });
  setEl("dash-email",      { text: user.email });

  // Nav bar
  setEl("dash-avatar-nav", { src: pic, alt: user.name });
  setEl("dash-name-nav",   { text: user.name });

  // Dropdown
  setEl("dropdown-avatar", { src: pic, alt: user.name });
  setEl("dropdown-name",   { text: user.name });
  setEl("dropdown-email",  { text: user.email });

  // Stats
  setEl("stat-method", { text: user.method  || "—" });
  setEl("stat-time",   { text: user.loginAt || "—" });
}

/** Utility: set multiple properties on an element by ID. */
function setEl(id, props) {
  const el = document.getElementById(id);
  if (!el) return;
  if (props.text !== undefined) el.textContent = props.text;
  if (props.src  !== undefined) el.src          = props.src;
  if (props.alt  !== undefined) el.alt          = props.alt;
}


// ──────────────────────────────────────────────────────────────────
// SECTION 9: UI HELPERS
// ──────────────────────────────────────────────────────────────────

/** Show a field-level validation error message. */
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

/** Clear all field errors within a named form context. */
function clearFormErrors(ctx) {
  document.querySelectorAll(`#${ctx}-form .field-error, #page-${ctx} .field-error`)
    .forEach(el => { el.textContent = ""; });
}

/**
 * Show/hide an alert banner.
 * @param {string} id   - element id
 * @param {string} msg  - text to show
 * @param {"error"|"success"} type
 */
function showAlert(id, msg, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add("visible");
}

function hideAlert(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("visible");
  el.textContent = "";
}

/** Toggle loading state on a submit button. */
function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle("loading", loading);
  btn.disabled = loading;
}

/** Show/hide password in an input field. Updates the toggle button icon. */
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";

  // Swap between eye open / eye-off icon
  btn.innerHTML = isHidden
    ? `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`
    : `<svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
         <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
         <circle cx="12" cy="12" r="3"/>
       </svg>`;
}

/**
 * Toast notification system.
 * @param {string} msg   - message text
 * @param {number} duration - ms before auto-hide
 */
let toastTimer = null;
function showToast(msg, duration = 3000) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}

/** Placeholder for "Forgot password" link. */
function showForgot(e) {
  e.preventDefault();
  showToast("🔑 Password reset link sent! (demo — check console)");
  console.info("In production, send a reset email to:", document.getElementById("login-email").value);
}


// ──────────────────────────────────────────────────────────────────
// SECTION 10: PASSWORD STRENGTH METER
// ──────────────────────────────────────────────────────────────────

/**
 * Compute and display password strength for the register form.
 * Criteria: length ≥ 8, has uppercase, has number, has symbol.
 * @param {string} value
 */
function updateStrength(value) {
  const wrap  = document.getElementById("strength-wrap");
  const fill  = document.getElementById("strength-fill");
  const label = document.getElementById("strength-label");

  if (!wrap) return;

  if (!value) {
    wrap.classList.remove("visible");
    fill.removeAttribute("data-level");
    return;
  }

  wrap.classList.add("visible");

  let score = 0;
  if (value.length >= 8)              score++;
  if (/[A-Z]/.test(value))            score++;
  if (/[0-9]/.test(value))            score++;
  if (/[^A-Za-z0-9]/.test(value))     score++;

  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  fill.setAttribute("data-level", score);
  label.textContent = levels[score] || "Weak";

  // Colour the label to match the bar
  const colours = ["", "#ff4d6d", "#ffb830", "#00c9a7", "#00e5a0"];
  label.style.color = colours[score] || "var(--text-muted)";
}


// ──────────────────────────────────────────────────────────────────
// SECTION 11: PROFILE DROPDOWN
// ──────────────────────────────────────────────────────────────────

function toggleDropdown() {
  const menu = document.getElementById("profile-menu");
  if (menu) menu.classList.toggle("open");
}

function closeDropdown() {
  const menu = document.getElementById("profile-menu");
  if (menu) menu.classList.remove("open");
}

// Close dropdown when clicking outside of it
document.addEventListener("click", (e) => {
  const menu = document.getElementById("profile-menu");
  if (menu && !menu.contains(e.target)) {
    closeDropdown();
  }
});


// ──────────────────────────────────────────────────────────────────
// SECTION 12: VALIDATION UTILITIES
// ──────────────────────────────────────────────────────────────────

/** Basic email format check. */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


// ──────────────────────────────────────────────────────────────────
// SECTION 13: REAL-TIME INPUT FEEDBACK
// ──────────────────────────────────────────────────────────────────

// Clear field-level error when the user starts typing
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      // Find the sibling .field-error element
      const group = input.closest(".field-group");
      if (group) {
        const err = group.querySelector(".field-error");
        if (err) err.textContent = "";
      }
      // Also hide the form-level alert when user modifies any field
      const form = input.closest("form");
      if (form) {
        const alertEl = form.querySelector(".alert-error");
        if (alertEl) alertEl.classList.remove("visible");
      }
    });
  });

  // ── ROUTE GUARD ──────────────────────────────────────────────────
  // Bootstrap the app; if a session exists jump straight to dashboard
  initApp();
});
