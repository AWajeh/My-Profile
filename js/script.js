(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- navbar scroll state ---------- */
  var navbar = document.getElementById("navbar");
  var backToTop = document.getElementById("back-to-top");

  function onScroll() {
    var y = window.scrollY;
    if (navbar) navbar.classList.toggle("scrolled", y > 10);
    if (backToTop) backToTop.classList.toggle("visible", y > 500);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- mobile nav toggle ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- scroll-spy active nav link ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section, .hero"));
  var navMap = {};
  document.querySelectorAll("[data-nav]").forEach(function (a) {
    navMap[a.getAttribute("href").slice(1)] = a;
  });

  if ("IntersectionObserver" in window && sections.length) {
    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.id;
            Object.keys(navMap).forEach(function (key) {
              navMap[key].classList.toggle("active", key === id);
            });
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach(function (s) { spyObserver.observe(s); });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- hero role typing effect ---------- */
  var roles = ["QA Engineer", "Bug Hunter", "Test Automation Enthusiast", "Quality Advocate"];
  var typedEl = document.getElementById("typed-role");

  function typeLoop() {
    if (!typedEl) return;
    var roleIndex = 0;
    var charIndex = 0;
    var deleting = false;

    function tick() {
      var current = roles[roleIndex];

      if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1400);
          return;
        }
      } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  if (reducedMotion) {
    if (typedEl) typedEl.textContent = roles[0];
  } else {
    typeLoop();
  }

  /* ---------- terminal test-run simulation ---------- */
  var terminalBody = document.getElementById("terminal-body");
  var terminalLines = [
    { text: "$ npm run test:regression", pause: 500 },
    { text: "\n✓ Login & Authentication ... PASS", pause: 350 },
    { text: "\n✓ Cart & Checkout Flow ..... PASS", pause: 350 },
    { text: "\n✓ API Response Validation .. PASS", pause: 350 },
    { text: "\n✓ Cross-Browser Suite ...... PASS", pause: 350 },
    { text: "\n\nTest Suites: 4 passed, 4 total", pause: 250 },
    { text: "\nCoverage: 96.4%", pause: 250 },
    { text: "\nStatus: BUILD SUCCESSFUL ✔", pause: 3200 }
  ];

  function runTerminal() {
    if (!terminalBody) return;
    terminalBody.textContent = "";
    var i = 0;

    function typeNext() {
      if (i >= terminalLines.length) {
        setTimeout(function () {
          runTerminal();
        }, 1500);
        return;
      }
      var line = terminalLines[i];
      var chars = line.text.split("");
      var c = 0;

      function typeChar() {
        if (c < chars.length) {
          terminalBody.textContent += chars[c];
          c++;
          setTimeout(typeChar, 12);
        } else {
          i++;
          setTimeout(typeNext, line.pause);
        }
      }
      typeChar();
    }
    typeNext();
  }

  if (terminalBody) {
    if (reducedMotion) {
      terminalBody.textContent = terminalLines.map(function (l) { return l.text; }).join("");
    } else {
      var terminalStarted = false;
      if ("IntersectionObserver" in window) {
        var termObserver = new IntersectionObserver(function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting && !terminalStarted) {
              terminalStarted = true;
              runTerminal();
              obs.disconnect();
            }
          });
        }, { threshold: 0.3 });
        termObserver.observe(terminalBody);
      } else {
        runTerminal();
      }
    }
  }

  /* ---------- matrix rain background ---------- */
  var canvas = document.getElementById("matrix-canvas");
  if (canvas && !reducedMotion) {
    var ctx = canvas.getContext("2d");
    var glyphs = "01アイウエオカキクケコサシスセソABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var fontSize = 15;
    var columns, drops;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      columns = Math.floor(window.innerWidth / fontSize);
      drops = new Array(columns).fill(0).map(function () {
        return Math.random() * -50;
      });
    }
    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx.fillStyle = "rgba(6, 10, 8, 0.08)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.font = fontSize + "px monospace";

      for (var i = 0; i < drops.length; i++) {
        var char = glyphs[Math.floor(Math.random() * glyphs.length)];
        var x = i * fontSize;
        var y = drops[i] * fontSize;

        ctx.fillStyle = "#39ff88";
        ctx.fillText(char, x, y);

        if (y > window.innerHeight && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
})();
