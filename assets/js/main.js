/* =========================================================
   Nikhil Goud Kalali — portfolio interactions
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("nk-theme", next); } catch (e) {}
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", next === "dark" ? "#08090d" : "#f7f8fc");
    });
  }

  /* ---------- Mobile navigation ---------- */
  var burger = document.getElementById("navBurger");
  var navLinks = document.getElementById("navLinks");

  function closeNav() {
    if (!navLinks || !burger) return;
    navLinks.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }

  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Sticky nav shadow + scroll progress ---------- */
  var nav = document.getElementById("nav");
  var progress = document.getElementById("navProgress");
  var ticking = false;

  function onScroll() {
    if (nav) nav.classList.toggle("is-stuck", window.scrollY > 8);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  reveals.forEach(function (el) {
    var d = parseInt(el.getAttribute("data-delay") || "0", 10);
    el.style.setProperty("--d", d);
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Count-up stats ---------- */
  var stats = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));

  function finalText(el) {
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    return prefix + el.getAttribute("data-count-to") + suffix;
  }

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = reduceMotion ? 0 : 1400;
    var start = performance.now();

    function frame(now) {
      var p = dur === 0 ? 1 : Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(function (el) { statIo.observe(el); });
  } else {
    stats.forEach(animateCount);
  }

  /* Safety net: real numbers are already in the markup, so if the observer
     never fires (odd viewports, blocked JS) restore them and never leave "0". */
  setTimeout(function () {
    stats.forEach(function (el) {
      if (/^0+$/.test(el.textContent.trim())) el.textContent = finalText(el);
    });
  }, 2600);

  /* ---------- Typewriter ---------- */
  var tw = document.getElementById("typewriter");
  if (tw) {
    var phrases = [
      "production agentic AI systems.",
      "multi-agent orchestration engines.",
      "Java / Spring Boot microservices.",
      "RAG pipelines that make agents cheaper.",
      "agent memory that survives a session."
    ];

    if (reduceMotion) {
      tw.textContent = phrases[0];
    } else {
      var p = 0, i = 0, deleting = false;

      var tick = function () {
        var full = phrases[p];
        var text = full.slice(0, i);
        tw.textContent = text;

        if (!deleting && i < full.length) {
          i++;
          setTimeout(tick, 45 + Math.random() * 45);
        } else if (!deleting && i === full.length) {
          deleting = true;
          setTimeout(tick, 1700);
        } else if (deleting && i > 0) {
          i--;
          setTimeout(tick, 26);
        } else {
          deleting = false;
          p = (p + 1) % phrases.length;
          setTimeout(tick, 320);
        }
      };
      setTimeout(tick, 600);
    }
  }

  /* ---------- Project tabs ---------- */
  var tabButtons = Array.prototype.slice.call(document.querySelectorAll('.tab[role="tab"]'));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".panel[role='tabpanel']"));

  function selectTab(id) {
    tabButtons.forEach(function (btn) {
      var on = btn.id === id;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var on = panel.id === "panel-" + id.replace("tab-", "");
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  tabButtons.forEach(function (btn, idx) {
    btn.addEventListener("click", function () { selectTab(btn.id); });

    btn.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabButtons[(idx + 1) % tabButtons.length];
      if (e.key === "ArrowLeft") next = tabButtons[(idx - 1 + tabButtons.length) % tabButtons.length];
      if (e.key === "Home") next = tabButtons[0];
      if (e.key === "End") next = tabButtons[tabButtons.length - 1];
      if (next) {
        e.preventDefault();
        next.focus();
        selectTab(next.id);
      }
    });
  });

  /* ---------- Copy email ---------- */
  var copyBtn = document.getElementById("copyEmail");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      var label = document.getElementById("copyEmailText");
      var done = function () {
        var original = "Copy email";
        label.textContent = "Copied ✓";
        setTimeout(function () { label.textContent = original; }, 1800);
      };
      var fail = function () {
        window.location.href = "mailto:" + email;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(fail);
      } else {
        fail();
      }
    });
  }

  /* ---------- Active section in nav ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav__links > a[href^='#']"));

  function setCurrent(id) {
    navAnchors.forEach(function (a) {
      a.classList.toggle("is-current", a.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window) {
    var secIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { secIo.observe(s); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
