/* === Clothing System — Collapsible Sidebar Navigation === */
(function () {
    if (window.__sidebarCollapse) return;
    window.__sidebarCollapse = true;

    var TOGGLE_SELECTOR = ".standard-sidebar, .layout-side-section";
    var SIDEBAR_CLASS = "sidebar-collapsed";
    var STORAGE_KEY = "clothing-sidebar-collapsed";

    function addToggle($sidebar) {
        if ($sidebar.querySelector(".sidebar-toggle-btn")) return;

        var $toggle = document.createElement("button");
        $toggle.className = "sidebar-toggle-btn";
        $toggle.innerHTML =
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>' +
            "</svg>";
        $toggle.title = "Toggle sidebar";
        $toggle.style.cssText =
            "position:absolute;top:8px;right:-14px;width:28px;height:28px;" +
            "border-radius:50%;border:1px solid #e5e7eb;background:#fff;" +
            "cursor:pointer;display:flex;align-items:center;justify-content:center;" +
            "z-index:200;color:#6b7280;box-shadow:0 1px 4px rgba(0,0,0,0.08);" +
            "transition:all 0.15s;padding:0;";

        $sidebar.style.position = "relative";
        $sidebar.appendChild($toggle);

        $toggle.addEventListener("click", function (e) {
            e.stopPropagation();
            var collapsed = $sidebar.classList.toggle(SIDEBAR_CLASS);
            localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
            updateToggleIcon($toggle, collapsed);
        });
    }

    function updateToggleIcon($toggle, collapsed) {
        if (collapsed) {
            $toggle.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<polyline points="9 18 15 12 9 6"/>' +
                "</svg>";
        } else {
            $toggle.innerHTML =
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
                '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>' +
                "</svg>";
        }
    }

    function initSidebar() {
        var $sidebar = document.querySelector(TOGGLE_SELECTOR);
        if (!$sidebar) return;

        // Position sidebar for the toggle
        $sidebar.style.position = "relative";

        // Add toggle button
        addToggle($sidebar);

        // Restore collapsed state
        if (localStorage.getItem(STORAGE_KEY) === "1") {
            $sidebar.classList.add(SIDEBAR_CLASS);
            var $toggle = $sidebar.querySelector(".sidebar-toggle-btn");
            if ($toggle) updateToggleIcon($toggle, true);
        }

        // Section collapse
        var sections = $sidebar.querySelectorAll(".standard-sidebar-section");
        sections.forEach(function (section) {
            var label = section.querySelector(".sidebar-label");
            if (!label) return;

            label.style.cursor = "pointer";
            label.style.userSelect = "none";

            label.addEventListener("click", function () {
                var menu = section.querySelector(".sidebar-menu, ul");
                if (menu) {
                    var collapsed = menu.classList.toggle("section-collapsed");
                    label.style.opacity = collapsed ? "0.5" : "1";
                }
            });
        });

        // Scroll active item into view
        var activeItem = $sidebar.querySelector(
            ".sidebar-menu-item.active, .sidebar-menu-item.selected, .module-link.active"
        );
        if (activeItem) {
            setTimeout(function () {
                activeItem.scrollIntoView({ block: "center" });
            }, 200);
        }
    }

    // Mobile hamburger toggle (add menu button for mobile)
    function addMobileToggle() {
        if (document.querySelector(".mobile-sidebar-toggle")) return;

        var $btn = document.createElement("button");
        $btn.className = "mobile-sidebar-toggle";
        $btn.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>' +
            "</svg>";
        $btn.style.cssText =
            "display:none;position:fixed;top:8px;left:8px;z-index:10001;" +
            "width:36px;height:36px;border-radius:8px;border:1px solid #e5e7eb;" +
            "background:#fff;cursor:pointer;align-items:center;justify-content:center;" +
            "box-shadow:0 2px 6px rgba(0,0,0,0.1);";

        document.body.appendChild($btn);

        $btn.addEventListener("click", function () {
            var $sidebar = document.querySelector(TOGGLE_SELECTOR);
            if ($sidebar) {
                $sidebar.classList.toggle("open");
            }
        });

        // Show on mobile
        var style = document.createElement("style");
        style.textContent =
            "@media (max-width: 768px) { .mobile-sidebar-toggle { display: flex !important; } }";
        document.head.appendChild(style);
    }

    // Initialize
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", function () {
            initSidebar();
            addMobileToggle();
        });
    } else {
        initSidebar();
        addMobileToggle();
    }

    // Handle Frappe AJAX page changes
    if (typeof frappe !== "undefined" && frappe.router) {
        frappe.router.on("change", function () {
            setTimeout(function () {
                initSidebar();
                addMobileToggle();
            }, 400);
        });
    }

    // Monitor DOM for sidebar changes (fallback)
    var observer = new MutationObserver(function () {
        var $sidebar = document.querySelector(TOGGLE_SELECTOR);
        if ($sidebar && !$sidebar.querySelector(".sidebar-toggle-btn")) {
            initSidebar();
            addMobileToggle();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
