/* ============================================
   PROJECT EXPLORER — #explorer section
   A VS Code style tree of the projects. The content is read from the
   project cards on this page and from js/apps-data.js, so nothing here
   needs to be kept in sync by hand.
============================================ */
(function () {
  "use strict";

  var tree = document.getElementById("px-tree");
  var view = document.getElementById("px-view");
  if (!tree || !view) return;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function clean(label) { return label.replace(/[↓↗→]/g, "").trim(); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  /* ---------- data ---------- */
  function fromCard(card) {
    var name = text($("h3", card));
    var badge = text($(".status-badge", card));
    var isQA = /^STR/i.test(badge);
    var links = $$(".project-links a", card).map(function (a) {
      return { label: clean(text(a)), href: a.getAttribute("href") };
    });
    var files = [
      { id: "overview", label: "README.md", title: "Overview", type: "text", body: text($(".project-body p", card)) },
      { id: "stack", label: isQA ? "testing.md" : "stack.md", title: isQA ? "Testing & tools" : "Technologies", type: "tags", body: $$(".tags span", card).map(text) }
    ];
    if (links.length) files.push({ id: "links", label: isQA ? "reports/" : "links.md", title: isQA ? "Test reports" : "Links", type: "links", body: links });
    return { id: slug(name), name: name, badge: badge, group: isQA ? "qa-projects" : "web-projects", files: files };
  }

  function fromApp(app) {
    var d = app.details || {};
    var files = [{ id: "overview", label: "README.md", title: "Overview", type: "text", body: app.description || app.tagline }];
    if (d.features && d.features.length) files.push({ id: "features", label: "features.md", title: "Features", type: "list", body: d.features });
    else if (app.note) files.push({ id: "features", label: "notes.md", title: "Notes", type: "text", body: (app.noteLabel ? app.noteLabel + " " : "") + app.note });
    files.push({ id: "stack", label: "platforms.md", title: "Platforms", type: "tags", body: [app.category].concat(app.platforms || []) });
    var links = [{ label: app.details ? "Details & download" : "Open on the apps page", href: "/apps/" + (app.details ? "#app=" + app.id : "") }];
    (app.downloads || []).forEach(function (dl) {
      if (dl.url) links.push({ label: dl.platform ? "Download for " + dl.platform : clean(dl.label), href: dl.url, download: true });
    });
    files.push({ id: "links", label: "links.md", title: "Links", type: "links", body: links });
    var status = app.status && app.status !== "available" ? app.status.replace(/-/g, " ") : (app.version ? "v" + String(app.version).replace(/^v/i, "") : "");
    return { id: "app-" + app.id, name: app.name, badge: status.toUpperCase(), group: "apps", files: files };
  }

  var projects = $$("#projects .project-card").map(fromCard).concat((window.APPS || []).map(fromApp));
  var GROUPS = [
    { id: "qa-projects", label: "qa-projects" },
    { id: "web-projects", label: "web-projects" },
    { id: "apps", label: "apps" }
  ].filter(function (g) { return projects.some(function (p) { return p.group === g.id; }); });

  /* ---------- icons (inline, no icon library) ---------- */
  var ICON = {
    folder: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3.5h4.2l1.4 1.6h7.4v7.4H1.5z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>',
    file: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 1.5h6l3 3v10h-9z M9.5 1.5v3h3" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>'
  };

  /* ---------- tree ---------- */
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  function row(level, label, kind, expandable) {
    var r = el("span", "px-row");
    r.style.setProperty("--level", level);
    var chev = el("span", "px-chev" + (expandable ? "" : " px-chev-empty"));
    chev.setAttribute("aria-hidden", "true");
    var icon = el("span", "px-icon px-icon-" + kind);
    icon.innerHTML = ICON[kind === "file" ? "file" : "folder"];
    r.appendChild(chev);
    r.appendChild(icon);
    r.appendChild(el("span", "px-label", label));
    return r;
  }

  function item(level, label, kind, data) {
    var li = el("li", "px-item px-" + kind);
    li.setAttribute("role", "treeitem");
    li.setAttribute("tabindex", "-1");
    li.setAttribute("aria-level", String(level));
    var expandable = kind !== "file";
    if (expandable) li.setAttribute("aria-expanded", "false");
    li.appendChild(row(level, label, kind, expandable));
    Object.keys(data).forEach(function (k) { li.dataset[k] = data[k]; });
    return li;
  }

  GROUPS.forEach(function (g) {
    var gli = item(1, g.label + "/", "group", { group: g.id });
    var gul = el("ul", "px-children");
    gul.setAttribute("role", "group");
    projects.filter(function (p) { return p.group === g.id; }).forEach(function (p) {
      var pli = item(2, p.name, "project", { project: p.id });
      var pul = el("ul", "px-children");
      pul.setAttribute("role", "group");
      p.files.forEach(function (f) {
        pul.appendChild(item(3, f.label, "file", { project: p.id, file: f.id }));
      });
      pli.appendChild(pul);
      gul.appendChild(pli);
    });
    gli.appendChild(gul);
    tree.appendChild(gli);
  });

  function items() { return $$('[role="treeitem"]', tree); }
  function visibleItems() {
    return items().filter(function (li) {
      var p = li.parentElement.closest('[role="treeitem"]');
      while (p) {
        if (p.getAttribute("aria-expanded") !== "true") return false;
        p = p.parentElement.closest('[role="treeitem"]');
      }
      return true;
    });
  }
  function expand(li, open) {
    if (li.hasAttribute("aria-expanded")) li.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function focusItem(li) {
    items().forEach(function (x) { x.setAttribute("tabindex", x === li ? "0" : "-1"); });
    li.focus();
  }

  /* ---------- details view ---------- */
  var current = null;
  var stacked = window.matchMedia("(max-width: 760px)");

  function render(project, fileId, quiet) {
    var group = GROUPS.filter(function (g) { return g.id === project.group; })[0];
    var changed = !current || current.id !== project.id;
    current = project;
    if (changed) {
      view.textContent = "";
      var head = el("header", "px-head");
      head.appendChild(el("p", "px-path", "projects / " + (group ? group.label : "") + " / " + project.id.replace(/^app-/, "")));
      var h = el("h3", "px-title", project.name);
      if (project.badge) h.appendChild(el("span", "status-badge status-pass", project.badge));
      head.appendChild(h);
      view.appendChild(head);

      project.files.forEach(function (f) {
        var s = el("section", "px-section");
        s.dataset.file = f.id;
        s.appendChild(el("h4", "px-h", "# " + f.title));
        if (f.type === "text") s.appendChild(el("p", "px-text", f.body));
        if (f.type === "list") {
          var ul = el("ul", "px-list");
          f.body.forEach(function (t) { ul.appendChild(el("li", null, t)); });
          s.appendChild(ul);
        }
        if (f.type === "tags") {
          var tags = el("div", "tags");
          f.body.forEach(function (t) { tags.appendChild(el("span", null, t)); });
          s.appendChild(tags);
        }
        if (f.type === "links") {
          var wrap = el("div", "px-links");
          f.body.forEach(function (l, i) {
            var a = el("a", "btn " + (i === 0 ? "btn-primary" : "btn-ghost") + " px-btn", l.label + (l.download ? " ↓" : " →"));
            a.href = l.href;
            if (l.download) a.setAttribute("download", "");
            else if (/^https?:/.test(l.href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = l.label + " ↗"; }
            wrap.appendChild(a);
          });
          s.appendChild(wrap);
        }
        view.appendChild(s);
      });
      view.classList.remove("px-enter");
      void view.offsetWidth; // restart the fade
      view.classList.add("px-enter");
    }

    $$(".px-section", view).forEach(function (s) { s.classList.toggle("px-section-active", s.dataset.file === fileId); });
    if (fileId) {
      var target = $('.px-section[data-file="' + fileId + '"]', view);
      if (target) view.scrollTo({ top: target.offsetTop - view.offsetTop - 12, behavior: "smooth" });
    } else {
      view.scrollTop = 0;
    }
    // on phones the details sit under the tree, so bring them into view (not on page load)
    if (!quiet && stacked.matches && (changed || fileId)) view.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function select(li) {
    items().forEach(function (x) { x.setAttribute("aria-selected", x === li ? "true" : "false"); });
    var pid = li.dataset.project;
    if (!pid) return;
    var project = projects.filter(function (p) { return p.id === pid; })[0];
    // keep the project folder highlighted while one of its files is open
    items().forEach(function (x) { x.classList.toggle("px-current", !!x.dataset.project && !x.dataset.file && x.dataset.project === pid); });
    render(project, li.dataset.file || null);
  }

  function activate(li) {
    if (li.classList.contains("px-group")) {
      expand(li, li.getAttribute("aria-expanded") !== "true");
    } else if (li.classList.contains("px-project")) {
      var isOpen = li.getAttribute("aria-expanded") === "true";
      var isSelected = li.getAttribute("aria-selected") === "true";
      expand(li, !(isOpen && isSelected)); // first click opens + selects, a second click closes
      select(li);
    } else {
      select(li);
    }
    focusItem(li);
  }

  tree.addEventListener("click", function (e) {
    var r = e.target.closest(".px-row");
    if (!r) return;
    activate(r.parentElement);
  });

  tree.addEventListener("keydown", function (e) {
    var li = e.target.closest('[role="treeitem"]');
    if (!li) return;
    var vis = visibleItems();
    var i = vis.indexOf(li);
    var expandable = li.hasAttribute("aria-expanded");
    var open = li.getAttribute("aria-expanded") === "true";
    switch (e.key) {
      case "ArrowDown": if (vis[i + 1]) focusItem(vis[i + 1]); break;
      case "ArrowUp": if (vis[i - 1]) focusItem(vis[i - 1]); break;
      case "ArrowRight":
        if (expandable && !open) expand(li, true);
        else if (expandable && open) { var child = $('[role="treeitem"]', li); if (child) focusItem(child); }
        break;
      case "ArrowLeft":
        if (expandable && open) expand(li, false);
        else { var parent = li.parentElement.closest('[role="treeitem"]'); if (parent) focusItem(parent); }
        break;
      case "Home": focusItem(vis[0]); break;
      case "End": focusItem(vis[vis.length - 1]); break;
      case "Enter":
      case " ": activate(li); break;
      default: return;
    }
    e.preventDefault();
  });

  /* ---------- start: first group open, first project selected ---------- */
  var firstGroup = $(".px-group", tree);
  var firstProject = $(".px-project", tree);
  if (firstGroup) expand(firstGroup, true);
  if (firstProject) {
    expand(firstProject, true);
    items().forEach(function (x) { x.setAttribute("aria-selected", "false"); });
    firstProject.setAttribute("aria-selected", "true");
    firstProject.setAttribute("tabindex", "0");
    firstProject.classList.add("px-current");
    render(projects.filter(function (p) { return p.id === firstProject.dataset.project; })[0], null, true);
  }
})();
