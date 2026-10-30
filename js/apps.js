/* ============================================
   MY APPS — renders the application showcase from window.APPS
   (see js/apps-data.js). Loaded before script.js so the scroll
   reveal picks up the generated cards.
============================================ */
(function () {
  "use strict";

  var apps = window.APPS || [];
  var grid = document.getElementById("apps-grid");
  var filtersEl = document.getElementById("apps-filters");
  if (!grid || !apps.length) return;

  var STATUS_LABEL = {
    available: "Available",
    beta: "Beta",
    "coming-soon": "Coming soon",
    "in-development": "In development"
  };
  var KIND_LABEL = { app: "Apps", game: "Games", web: "Web" };

  /* ---------- tiny DOM helper ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v; // only used for trusted strings from apps-data.js
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function badge(text, mod) {
    return el("span", { class: "app-badge" + (mod ? " app-badge-" + mod : ""), text: text });
  }

  function logo(app, cls) {
    var box = el("div", { class: cls || "app-logo" });
    if (app.logo) box.appendChild(el("img", { src: app.logo, alt: app.logoAlt || app.name + " logo", width: "104", height: "104", loading: "lazy", decoding: "async" }));
    else box.textContent = app.logoText || app.name;
    return box;
  }

  /* ---------- download buttons ---------- */
  function downloadButtons(app) {
    var wrap = el("div", { class: "app-actions", "data-app-actions": app.id });
    fillActions(wrap, app);
    return wrap;
  }

  function fillActions(wrap, app) {
    wrap.innerHTML = "";
    var dl = app.resolvedDownload;
    if (dl) {
      wrap.appendChild(
        el("a", {
          class: "btn btn-primary app-download",
          href: dl.url,
          download: dl.fileName || true,
          "aria-label": dl.label + " — " + app.name + (app.resolvedVersion ? " version " + app.resolvedVersion : "") + (dl.size ? " (" + dl.size + ")" : ""),
          text: dl.label.toUpperCase() + " ↓"
        })
      );
    } else if (app.release) {
      wrap.appendChild(el("span", { class: "btn btn-ghost btn-disabled app-soon", "aria-disabled": "true", role: "status", text: app.releaseChecking ? "Checking release…" : "COMING SOON" }));
    }
    (app.downloads || []).forEach(function (d) {
      if (!d.url) {
        wrap.appendChild(el("span", { class: "btn btn-ghost btn-disabled", "aria-disabled": "true", text: d.label }));
        return;
      }
      wrap.appendChild(
        el("a", {
          class: "btn " + (d.primary ? "btn-primary" : "btn-ghost"),
          href: d.url,
          download: true,
          "aria-label": d.label.replace(/[↓]/g, "").trim() + " — " + app.name + (d.size ? " (" + d.size + ")" : ""),
          text: d.label
        })
      );
    });
    if (app.details) {
      wrap.appendChild(el("button", { type: "button", class: "btn btn-ghost app-more", "aria-haspopup": "dialog", onclick: function () { openDetails(app); }, text: "LEARN MORE" }));
    }
  }

  /* ---------- cards ---------- */
  function meta(app) {
    var m = el("div", { class: "app-badges" });
    m.appendChild(badge(app.category, "cat"));
    (app.platforms || []).forEach(function (p) { m.appendChild(badge(p, "os")); });
    if (app.price) m.appendChild(badge(app.price, "free"));
    var st = app.resolvedStatus || app.status;
    var stLabel = st && st !== "available" ? STATUS_LABEL[st] || st : null;
    var ver = app.resolvedVersion || app.version ? versionText(app) : null;
    if (ver && ver !== stLabel) m.appendChild(el("span", { class: "app-badge app-badge-ver", "data-app-version": app.id, text: ver }));
    if (stLabel) m.appendChild(badge(stLabel, "status"));
    return m;
  }

  function versionText(app) {
    var v = app.resolvedVersion || app.version;
    return /^\d/.test(v) ? "v" + v : v;
  }

  function featuredCard(app) {
    var media = !app.preview ? null : el("div", { class: "app-media" }, [
      app.preview ? el("img", { class: "app-preview", src: app.preview, alt: app.previewAlt || app.name + " preview", loading: "lazy", decoding: "async", width: "1600", height: "900" }) : null,
      el("div", { class: "app-media-shade", "aria-hidden": "true" }),
      logo(app, "app-logo app-logo-float")
    ]);
    var body = el("div", { class: "app-body" }, [
      el("p", { class: "app-kicker", text: "$ ./" + app.id + " --featured" }),
      el("div", { class: "app-head" }, [!app.preview ? logo(app, "app-logo app-logo-inline") : null, el("h3", { class: "app-title", text: app.name })]),
      el("p", { class: "app-tagline", text: app.tagline }),
      meta(app),
      el("p", { class: "app-desc", text: app.description }),
      downloadButtons(app)
    ]);
    return el("article", { class: "app-card app-card-featured" + (media ? "" : " no-media") + " reveal", id: "app-" + app.id, "data-kind": app.kind, "aria-labelledby": "app-title-" + app.id }, [media, body]);
  }

  function compactCard(app) {
    var title = el("h3", { class: "app-title", id: "app-title-" + app.id, text: app.name });
    var children = [logo(app), title, el("p", { class: "app-tagline", text: app.tagline }), meta(app)];
    if (app.description) children.push(el("p", { class: "app-desc", text: app.description }));
    children.push(downloadButtons(app));
    if (app.installHtml) {
      children.push(el("details", { class: "game-install" }, [el("summary", { text: "How to install" }), el("div", { html: app.installHtml })]));
    }
    if (app.note) {
      children.push(el("p", { class: "game-note" }, [app.noteLabel ? el("strong", { text: app.noteLabel }) : null, app.noteLabel ? " " : null, app.note]));
    }
    var soon = app.status === "coming-soon" || app.status === "in-development";
    return el("article", { class: "app-card game-card" + (soon ? " game-card-soon" : "") + " reveal", id: "app-" + app.id, "data-kind": app.kind }, children);
  }

  function render() {
    grid.innerHTML = "";
    apps.forEach(function (app) {
      var card = app.featured ? featuredCard(app) : compactCard(app);
      if (app.featured) card.querySelector(".app-title").id = "app-title-" + app.id;
      grid.appendChild(card);
    });
  }

  /* ---------- filters ---------- */
  function renderFilters() {
    if (!filtersEl) return;
    var kinds = [];
    apps.forEach(function (a) { if (kinds.indexOf(a.kind) < 0) kinds.push(a.kind); });
    if (kinds.length < 2) { filtersEl.hidden = true; return; }
    var all = ["all"].concat(kinds);
    all.forEach(function (k, i) {
      filtersEl.appendChild(
        el("button", {
          type: "button",
          class: "app-filter" + (i === 0 ? " active" : ""),
          "aria-pressed": i === 0 ? "true" : "false",
          "data-filter": k,
          text: k === "all" ? "All" : KIND_LABEL[k] || k,
          onclick: function (e) {
            filtersEl.querySelectorAll(".app-filter").forEach(function (b) {
              var on = b === e.currentTarget;
              b.classList.toggle("active", on);
              b.setAttribute("aria-pressed", on ? "true" : "false");
            });
            grid.querySelectorAll(".app-card").forEach(function (c) {
              c.hidden = !(k === "all" || c.getAttribute("data-kind") === k);
            });
          }
        })
      );
    });
  }

  /* ---------- GitHub release detection ---------- */
  function formatSize(bytes) {
    if (!bytes) return "";
    return bytes > 1048576 ? (bytes / 1048576).toFixed(0) + " MB" : Math.round(bytes / 1024) + " KB";
  }

  function checkRelease(app) {
    var r = app.release;
    var key = "apps-release:" + r.repo + ":" + r.asset;
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(key) || "null"); } catch (e) { /* storage unavailable */ }
    if (cached && Date.now() - cached.at < 10 * 60 * 1000) { applyRelease(app, cached.data); return; }
    if (!window.fetch) return;
    app.releaseChecking = true;
    refresh(app);
    fetch("https://api.github.com/repos/" + r.repo + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (rel) {
        var data = null;
        if (rel && rel.assets) {
          var asset = rel.assets.filter(function (a) { return a.name === r.asset && a.state !== "starter"; })[0];
          if (asset) data = { url: asset.browser_download_url, size: asset.size, tag: rel.tag_name, page: rel.html_url, date: rel.published_at };
        }
        try { sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data: data })); } catch (e) { /* ignore */ }
        applyRelease(app, data);
      })
      .catch(function () { applyRelease(app, null); });
  }

  function applyRelease(app, data) {
    app.releaseChecking = false;
    if (data) {
      app.resolvedDownload = { url: data.url, label: app.release.label || "Download", fileName: app.release.asset, size: formatSize(data.size) };
      app.resolvedVersion = String(data.tag || app.version || "").replace(/^v/i, "");
      app.resolvedStatus = "available";
      app.releasePage = data.page;
      app.releaseDate = data.date;
    }
    refresh(app);
  }

  function refresh(app) {
    var card = document.getElementById("app-" + app.id);
    if (!card) return;
    var actions = card.querySelector("[data-app-actions]");
    if (actions) fillActions(actions, app);
    var badges = card.querySelector(".app-badges");
    if (badges) badges.parentNode.replaceChild(meta(app), badges);
    if (dialog && dialog.open && dialog.getAttribute("data-app") === app.id) openDetails(app);
  }

  /* ---------- details dialog ---------- */
  var dialog = document.getElementById("app-dialog");
  var lastFocus = null;

  function section(title, child) {
    return el("section", { class: "app-d-section" }, [el("h4", { class: "app-d-h", text: "# " + title }), child]);
  }

  function openDetails(app) {
    if (!dialog) return;
    var d = app.details || {};
    var content = dialog.querySelector(".app-dialog-body");
    content.innerHTML = "";
    dialog.setAttribute("data-app", app.id);

    content.appendChild(
      el("header", { class: "app-d-head" }, [
        logo(app),
        el("div", null, [el("h3", { id: "app-dialog-title", class: "app-title", text: app.name }), el("p", { class: "app-tagline", text: app.tagline }), meta(app)])
      ])
    );
    if (d.overview) content.appendChild(section("Overview", el("p", { class: "app-desc", text: d.overview })));
    if (d.features && d.features.length) {
      content.appendChild(section("Main features", el("ul", { class: "app-d-list" }, d.features.map(function (f) { return el("li", { text: f }); }))));
    }
    function gallery(items) {
      return el("div", { class: "app-gallery" }, items.map(function (g) {
        return el("figure", null, [
          el("a", { href: g.src, target: "_blank", rel: "noopener" }, [el("img", { src: g.src, alt: g.alt, loading: "lazy", decoding: "async", width: "1600", height: "900" })]),
          g.caption ? el("figcaption", { text: g.caption }) : null
        ]);
      }));
    }
    if (d.gallery && d.gallery.length) content.appendChild(section("Wallpaper gallery", gallery(d.gallery)));
    if (d.screenshots && d.screenshots.length) content.appendChild(section("Screenshots", gallery(d.screenshots)));
    if (d.requirements && d.requirements.length) {
      content.appendChild(
        section("System requirements", el("table", { class: "app-d-table" }, [
          el("tbody", null, d.requirements.map(function (r) { return el("tr", null, [el("th", { scope: "row", text: r[0] }), el("td", { text: r[1] })]); }))
        ]))
      );
    }
    if (d.install && d.install.length) {
      content.appendChild(section("Installation", el("ol", { class: "app-d-list app-d-steps" }, d.install.map(function (s) { return el("li", { html: s }); }))));
    }
    var ver = app.resolvedVersion ? "Latest version: v" + app.resolvedVersion + (app.releaseDate ? " · released " + new Date(app.releaseDate).toLocaleDateString() : "") : (app.status === "available" ? "Latest version: " + versionText(app) : "Version " + versionText(app) + " · release in preparation");
    content.appendChild(section("Download", el("div", null, [el("p", { class: "app-desc", text: ver }), downloadButtons(app)])));
    // the dialog already shows the details, so drop the nested Learn More button
    content.querySelectorAll(".app-more").forEach(function (b) { b.remove(); });

    if (!dialog.open) {
      lastFocus = document.activeElement;
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
      document.documentElement.classList.add("dialog-open");
      if (location.hash !== "#app=" + app.id) history.replaceState(null, "", "#app=" + app.id);
    }
  }

  function closeDetails() {
    if (!dialog) return;
    if (dialog.close) dialog.close();
    else dialog.removeAttribute("open");
  }

  if (dialog) {
    dialog.addEventListener("close", function () {
      document.documentElement.classList.remove("dialog-open");
      if (/^#app=/.test(location.hash)) history.replaceState(null, "", "#apps");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) closeDetails(); // backdrop click
    });
    dialog.querySelector(".app-dialog-close").addEventListener("click", closeDetails);
  }

  /* ---------- boot ---------- */
  render();
  renderFilters();
  apps.forEach(function (app) { if (app.release) checkRelease(app); });

  var m = /^#app=([\w-]+)/.exec(location.hash);
  if (m) {
    var target = apps.filter(function (a) { return a.id === m[1]; })[0];
    if (target && target.details) openDetails(target);
  }
})();
