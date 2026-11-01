/* ============================================
   INTERACTIVE TERMINAL — #terminal section
   Every answer is read from the page itself (about, skills, education,
   projects, contact) and from js/apps-data.js, so the terminal never
   says anything the site does not already say.
============================================ */
(function () {
  "use strict";

  var root = document.getElementById("dev-terminal");
  if (!root) return;

  var screen = document.getElementById("dt-screen");
  var out = document.getElementById("dt-output");
  var form = document.getElementById("dt-form");
  var input = document.getElementById("dt-input");
  var PROMPT = "wajeh@awajeh:~$";

  /* ---------- read the site content ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function clean(label) { return label.replace(/[↓↗→]/g, "").trim(); }

  var site = {
    about: $$("#about .about-text p").map(text),
    skills: $$("#skills .skills-grid > .skill-card").map(function (c) {
      return { title: text($(".skill-cat", c)).replace(/^#\s*/, ""), items: $$("li", c).map(text) };
    }),
    education: $$("#education .skill-card").map(function (c) {
      return { title: text($(".skill-cat", c)).replace(/^#\s*/, ""), items: $$("li", c).map(text) };
    }),
    projects: $$("#projects .project-card").map(function (c) {
      return {
        name: text($("h3", c)),
        badge: text($(".status-badge", c)),
        desc: text($(".project-body p", c)),
        tags: $$(".tags span", c).map(text),
        links: $$(".project-links a", c).map(function (a) { return { label: clean(text(a)), href: a.getAttribute("href") }; })
      };
    }),
    contact: $$("#contact .contact-card").map(function (a) {
      return { label: text($(".contact-label", a)), value: clean(text($(".contact-value", a))), href: a.getAttribute("href") };
    }),
    cv: $$("#home .hero-actions a[download]").map(function (a) { return { label: clean(text(a)), href: a.getAttribute("href") }; }),
    apps: window.APPS || []
  };

  /* ---------- output helpers ---------- */
  function line(parts, cls) {
    var p = document.createElement("p");
    p.className = "dt-line" + (cls ? " " + cls : "");
    (Array.isArray(parts) ? parts : [parts]).forEach(function (part) {
      if (part == null) return;
      p.appendChild(typeof part === "string" ? document.createTextNode(part) : part);
    });
    out.appendChild(p);
    return p;
  }
  function span(t, cls) {
    var s = document.createElement("span");
    s.className = cls;
    s.textContent = t;
    return s;
  }
  function link(label, href) {
    var a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    a.className = "dt-link";
    if (/^https?:/.test(href)) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    return a;
  }
  function gap() { line("", "dt-gap"); }
  function heading(t) { line(span("# " + t, "dt-accent")); }
  function pad(s, n) { while (s.length < n) s += " "; return s; }
  function echo(cmd) { line([span(PROMPT, "dt-prompt-echo"), " " + cmd]); }

  /* ---------- commands ---------- */
  var COMMANDS = {
    help: { desc: "list commands, or help <command>", more: "Shows every command. Add a command name for details, e.g. help skills.", run: help },
    whoami: { desc: "who I am, in short", more: "Name, role and focus.", run: whoami },
    about: { desc: "about me", more: "The About section of this site, as text.", run: about },
    skills: { desc: "skills and tools", more: "Every skill card from the Skills section: manual testing, tools and programming.", run: skills },
    projects: { desc: "projects and apps", more: "The QA and web projects on this page, plus the apps on /apps. The Project Explorer has the details.", run: projects },
    qa: { desc: "how I work as a QA", more: "The loop I follow for every bug, from requirement to retest.", run: qa },
    experience: { desc: "QA projects and education", more: "The QA projects I delivered and my studies. The full work history is in the CV.", run: experience },
    contact: { desc: "ways to reach me", more: "Every contact channel on the site, as clickable links.", run: contact },
    cv: { desc: "download my CV", more: "Links to the English and Hebrew CV (PDF).", run: cv },
    clear: { desc: "clear the screen", more: "Clears the terminal. Ctrl+L does the same.", run: clear }
  };
  // not listed in help
  var HIDDEN = {
    "sudo hire-wajeh": hire, "sudo hire-wajih": hire, "sudo hire wajeh": hire,
    "rm -rf bugs": function () { line("rm: refusing to delete bugs. They get reproduced, documented and retested.", "dt-warn"); },
    "rm -rf /": function () { line("rm: permission denied. Nice try.", "dt-warn"); },
    exit: function () { line("There is no exit. Only regression testing.", "dt-muted"); },
    ls: function () { line(Object.keys(COMMANDS).filter(function (c) { return c !== "help" && c !== "clear"; }).join("   ")); },
    pwd: function () { line("/home/wajeh/portfolio"); },
    date: function () { line(new Date().toString()); }
  };

  function help(args) {
    var topic = (args[0] || "").toLowerCase();
    if (topic) {
      var c = COMMANDS[topic];
      if (!c) { line("help: no help for '" + topic + "'. Type help to see all commands.", "dt-err"); return; }
      line([span(topic, "dt-accent"), " - " + c.desc]);
      line(c.more, "dt-muted");
      return;
    }
    line("Available commands:");
    Object.keys(COMMANDS).forEach(function (name) {
      line(["  ", span(pad(name, 12), "dt-accent"), span(COMMANDS[name].desc, "dt-muted")]);
    });
    gap();
    line("Tip: Tab completes a command, ↑ / ↓ go through history.", "dt-muted");
  }

  function whoami() {
    line(span("Wajeh Amash", "dt-strong"));
    line("Junior QA Engineer");
    line("Manual Testing • Bug Reporting • Jira & TestRail", "dt-muted");
  }

  function about() {
    if (!site.about.length) { line("about: nothing found.", "dt-err"); return; }
    site.about.forEach(function (p, i) { if (i) gap(); line(p); });
  }

  function skills() {
    site.skills.forEach(function (s, i) {
      if (i) gap();
      heading(s.title);
      s.items.forEach(function (it) { line(["  ", span("✓ ", "dt-accent"), it]); });
    });
  }

  function projects() {
    heading("Projects (this page)");
    site.projects.forEach(function (p) {
      line(["  ", span(pad(p.name, 38), "dt-strong"), span(p.badge, "dt-muted")]);
    });
    if (site.apps.length) {
      gap();
      heading("Apps (/apps)");
      site.apps.forEach(function (a) {
        line(["  ", span(pad(a.name, 38), "dt-strong"), span(a.category + (a.status && a.status !== "available" ? " · " + a.status.replace(/-/g, " ") : ""), "dt-muted")]);
      });
    }
    gap();
    line(["Details: ", link("Project Explorer", "#explorer"), "   All apps: ", link("/apps", "/apps/")]);
  }

  function qa() {
    var steps = [
      ["Requirement", "understand what the feature should do"],
      ["Test", "write and run test cases, including negative and edge cases"],
      ["Reproduce", "find the exact steps that make the bug happen again"],
      ["Document", "steps, actual vs. expected result, screenshots"],
      ["Report", "log it in Jira with severity and priority"],
      ["Retest", "verify the fix and run regression around it"]
    ];
    steps.forEach(function (s, i) {
      line([i ? span("→ ", "dt-accent") : "  ", span(pad(s[0], 13), "dt-strong"), span(s[1], "dt-muted")]);
    });
  }

  function experience() {
    var qaProjects = site.projects.filter(function (p) { return /^STR/i.test(p.badge); });
    if (qaProjects.length) {
      heading("QA projects");
      qaProjects.forEach(function (p) {
        line(["  ", span(p.name, "dt-strong"), span("  " + p.badge, "dt-muted")]);
        line("  " + p.desc, "dt-muted");
      });
      gap();
    }
    if (site.education.length) {
      heading("Education");
      site.education.forEach(function (e) {
        line(["  ", span(e.title, "dt-strong"), span("  " + e.items.join(" · "), "dt-muted")]);
      });
      gap();
    }
    if (site.cv.length) {
      line(["Full work history in my CV: "].concat(cvLinks()));
    }
  }

  function contact() {
    site.contact.forEach(function (c) {
      line(["  ", span(pad(c.label, 11), "dt-accent"), link(c.value, c.href)]);
    });
  }

  function cvLinks() {
    var parts = [];
    site.cv.forEach(function (c, i) {
      if (i) parts.push("  ");
      parts.push(link(i === 0 ? "English (PDF)" : "Hebrew (PDF)", c.href));
    });
    return parts;
  }

  function cv() {
    if (!site.cv.length) { line("cv: not found.", "dt-err"); return; }
    line(["CV: "].concat(cvLinks()));
  }

  function clear() { out.textContent = ""; }

  function hire() {
    line("[sudo] password for recruiter: ********", "dt-muted");
    line("Permission granted.", "dt-ok");
    var email = site.contact.filter(function (c) { return /^mailto:/.test(c.href); })[0];
    line(["> Good choice. ", email ? link("Let's talk", email.href) : "Let's talk."]);
  }

  /* ---------- run ---------- */
  var history = [];
  var hIndex = 0;

  function run(raw) {
    var cmd = raw.trim().replace(/\s+/g, " ");
    echo(raw);
    if (!cmd) return scroll();
    history.push(cmd);
    if (history.length > 50) history.shift();
    hIndex = history.length;

    var lower = cmd.toLowerCase();
    var parts = lower.split(" ");
    if (HIDDEN[lower]) HIDDEN[lower]();
    else if (COMMANDS[parts[0]]) COMMANDS[parts[0]].run(parts.slice(1));
    else line([span("command not found: ", "dt-err"), parts[0], span("  (type help)", "dt-muted")]);
    if (parts[0] !== "clear") gap();
    scroll();
  }

  function scroll() { screen.scrollTop = screen.scrollHeight; }

  function complete() {
    var v = input.value.toLowerCase();
    if (!v) return;
    var words = v.split(" ");
    var pool = Object.keys(COMMANDS);
    var last = words[words.length - 1];
    var hits = pool.filter(function (c) { return c.indexOf(last) === 0; });
    if (hits.length === 1) {
      words[words.length - 1] = hits[0];
      input.value = words.join(" ") + (words.length === 1 && hits[0] === "help" ? " " : "");
    } else if (hits.length > 1) {
      echo(input.value);
      line(hits.join("   "), "dt-muted");
      scroll();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    run(v);
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault();
      hIndex = Math.max(0, hIndex - 1);
      input.value = history[hIndex];
      setTimeout(function () { input.setSelectionRange(input.value.length, input.value.length); }, 0);
    } else if (e.key === "ArrowDown") {
      if (!history.length) return;
      e.preventDefault();
      hIndex = Math.min(history.length, hIndex + 1);
      input.value = history[hIndex] || "";
    } else if (e.key === "Tab" && input.value) {
      e.preventDefault(); // only when there is something to complete, so Tab still moves focus out
      complete();
    } else if (e.key === "Escape") {
      input.value = "";
    } else if ((e.key === "l" || e.key === "L") && e.ctrlKey) {
      e.preventDefault();
      clear();
    }
  });

  // click anywhere on the screen to type (but keep text selection and links working)
  screen.addEventListener("click", function (e) {
    if (e.target.closest("a") || String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });

  $$(".dt-chip", root).forEach(function (b) {
    b.addEventListener("click", function () {
      run(b.getAttribute("data-cmd"));
    });
  });

  /* ---------- welcome ---------- */
  echo("whoami");
  whoami();
  gap();
  line(["Type ", span("help", "dt-accent"), " to see the commands."], "dt-muted");
  gap();
})();
