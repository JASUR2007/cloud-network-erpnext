/* === Clothing System — Luxury Sidebar Controller === */
(function () {
  if (window.__luxurySidebar) return;
  window.__luxurySidebar = true;

  var SIDEBAR_SEL = ".body-sidebar-container, .standard-sidebar, .layout-side-section";
  var COLLAPSED_CLASS = "sidebar-collapsed";
  var STORAGE_KEY = "luxury-sidebar-collapsed";

  /* ── Toggle Button ── */
  function addToggle($sidebar) {
    if ($sidebar.querySelector(".sidebar-toggle-btn")) return;

    var $btn = document.createElement("button");
    $btn.className = "sidebar-toggle-btn";
    var icon =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M15 18l-6-6 6-6"/></svg>';
    $btn.innerHTML = icon;

    $sidebar.style.position = "relative";
    $sidebar.appendChild($btn);

    $btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var collapsed = $sidebar.classList.toggle(COLLAPSED_CLASS);
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
      setIcon($btn, collapsed);
    });

    return $btn;
  }

  function setIcon($btn, collapsed) {
    if (collapsed) {
      $btn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9 18l6-6-6-6"/></svg>';
    } else {
      $btn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M15 18l-6-6 6-6"/></svg>';
    }
  }

  /* ── Glassmorphism User Card ── */
  function addUserCard($sidebar) {
    if ($sidebar.querySelector(".sidebar-user-card")) return;

    // Try to get user info from Frappe boot data
    var userName = "Administrator";
    var userEmail = "";
    var userInitials = "A";

    if (typeof frappe !== "undefined" && frappe.boot && frappe.boot.user) {
      userName = frappe.boot.user.full_name || frappe.boot.user.name || userName;
      userEmail = frappe.boot.user.email || "";
      userInitials = (userName.charAt(0) || "A").toUpperCase();
    }

    var $card = document.createElement("div");
    $card.className = "sidebar-user-card";
    $card.innerHTML =
      '<div class="user-avatar">' +
      userInitials +
      "</div>" +
      '<div class="user-info">' +
      '<div class="user-name">' +
      userName +
      "</div>" +
      '<div class="user-email">' +
      userEmail +
      "</div>" +
      "</div>";

    // Insert before sidebar footer or at the bottom
    var $footer = $sidebar.querySelector(".sidebar-footer");
    if ($footer) {
      $sidebar.insertBefore($card, $footer);
    } else {
      $sidebar.appendChild($card);
    }
  }

  /* ── Section Collapse ── */
  function bindSectionCollapse($sidebar) {
    var sections = $sidebar.querySelectorAll(".standard-sidebar-section");
    sections.forEach(function (section) {
      var label = section.querySelector(".sidebar-label");
      if (!label || label.dataset.bound === "1") return;
      label.dataset.bound = "1";

      label.style.cursor = "pointer";
      label.style.userSelect = "none";
      label.title = "Click to collapse section";

      label.addEventListener("click", function () {
        var menu = section.querySelector(".sidebar-menu, ul");
        if (menu) {
          var hidden = menu.classList.toggle("section-collapsed");
          label.style.opacity = hidden ? "0.4" : "1";
        }
      });
    });
  }

  /* ── Active Item Scroll ── */
  function scrollToActive($sidebar) {
    var active = $sidebar.querySelector(
      ".sidebar-menu-item.active, .sidebar-menu-item.selected, .module-link.active"
    );
    if (active) {
      setTimeout(function () {
        active.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 300);
    }
  }

  /* ── Mobile Overlay ── */
  function addMobile() {
    if (document.querySelector(".mobile-sidebar-toggle")) return;

    var $btn = document.createElement("button");
    $btn.className = "mobile-sidebar-toggle";
    $btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>' +
      "</svg>";

    document.body.appendChild($btn);

    $btn.addEventListener("click", function () {
      var $sidebar = document.querySelector(SIDEBAR_SEL);
      if ($sidebar) $sidebar.classList.toggle("open");
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", function (e) {
      var $sidebar = document.querySelector(SIDEBAR_SEL);
      if (
        $sidebar &&
        $sidebar.classList.contains("open") &&
        !$sidebar.contains(e.target) &&
        e.target !== document.querySelector(".mobile-sidebar-toggle")
      ) {
        $sidebar.classList.remove("open");
      }
    });
  }

  /* ── Init ── */
  function init() {
    var $sidebar = document.querySelector(SIDEBAR_SEL);
    if (!$sidebar) return;

    var $toggle = addToggle($sidebar);
    addUserCard($sidebar);
    bindSectionCollapse($sidebar);
    scrollToActive($sidebar);

    if (localStorage.getItem(STORAGE_KEY) === "1") {
      $sidebar.classList.add(COLLAPSED_CLASS);
      if ($toggle) setIcon($toggle, true);
    }
  }

  /* ── Bootstrap ── */
  setTimeout(init, 100);

  // Handle Frappe AJAX page navigation
  if (typeof frappe !== "undefined" && frappe.router) {
    frappe.router.on("change", function () {
      setTimeout(init, 500);
    });
  }

  /* ── Mobile ── */
  addMobile();

  /* ── Mutation observer as last-resort fallback ── */
  var obs = new MutationObserver(function () {
    var $sidebar = document.querySelector(SIDEBAR_SEL);
    if ($sidebar && !$sidebar.querySelector(".sidebar-toggle-btn")) {
      init();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
