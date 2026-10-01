/* Snor landing site — progressive enhancement only.
   Everything here is optional: with JS disabled the page still reads correctly,
   because the download card ships with the current release values inline. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Mobile navigation
     ------------------------------------------------------------------ */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");

  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    };
    var isOpen = function () {
      return nav.classList.contains("open");
    };

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    // Any link tap inside the panel closes it.
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Click-away closes the panel. Guarding on the toggle keeps this from
    // fighting the click handler above.
    document.addEventListener("click", function (e) {
      if (!isOpen()) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     Copy buttons
     ------------------------------------------------------------------ */
  function copyFallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy") || "";
      var original = btn.textContent;

      function flash(ok) {
        btn.textContent = ok ? "Copied" : "Failed";
        btn.setAttribute("data-state", ok ? "done" : "error");
        window.setTimeout(function () {
          btn.textContent = original;
          btn.removeAttribute("data-state");
        }, 1400);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { flash(true); },
          function () { flash(copyFallback(text)); }
        );
      } else {
        flash(copyFallback(text));
      }
    });
  });

  /* ------------------------------------------------------------------
     Release metadata — version.json is the single source of truth.
     The inline values in index.html are the fallback, which is what you
     get when the page is opened straight off disk (file:// blocks fetch).
     ------------------------------------------------------------------ */
  function setText(id, value) {
    if (!value) return;
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHref(id, value) {
    if (!value) return;
    var el = document.getElementById(id);
    if (el) el.setAttribute("href", value);
  }

  function applyVersion(v) {
    if (!v) return;
    setText("dlVersion", v.releaseName || v.version);
    setText("dlFile", v.file);
    setText("dlSize", v.sizeHuman);
    setText("dlSha", v.sha256);
    setHref("heroDownload", v.downloadUrl);
    setHref("mainDownload", v.downloadUrl);
    setHref("releaseNotes", v.releaseTag);
  }

  if (window.fetch) {
    fetch("version.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) throw new Error("version.json: " + res.status);
        return res.json();
      })
      .then(applyVersion)
      .catch(function () {
        /* Offline or file:// — inline fallback already on screen. */
      });
  }

  /* ------------------------------------------------------------------
     Scroll reveals
     Elements are only hidden when the html.js class is present (set by an
     inline script before paint), so a script-less load shows everything.
     ------------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll("[data-reveal]");

  if (revealTargets.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ------------------------------------------------------------------
     Custom cursor — a dot that tracks exactly and a ring that trails.
     Fine pointers only, and never under reduced motion.
     ------------------------------------------------------------------ */
  var dot = document.querySelector(".cursor-dot");
  var ring = document.querySelector(".cursor-ring");
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (dot && ring && finePointer && !reducedMotion) {
    document.body.classList.add("cursor-on");

    window.addEventListener("mousemove", function (e) {
      var x = e.clientX + "px";
      var y = e.clientY + "px";
      dot.style.setProperty("--cx", x);
      dot.style.setProperty("--cy", y);
      ring.style.setProperty("--cx", x);
      ring.style.setProperty("--cy", y);
    }, { passive: true });

    // Grow the ring over anything interactive. Delegated, so it survives
    // content added later.
    var HOVER = "a, button, .iso, .stats > div";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(HOVER)) {
        document.body.classList.add("cursor-hover");
      }
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(HOVER)) {
        document.body.classList.remove("cursor-hover");
      }
    });
  }

  /* ------------------------------------------------------------------
     Scroll-driven chrome
     Two jobs on one listener: paint the progress bar and mark the current
     section in the table of contents.

     The contents use a scroll-position lookup rather than an
     IntersectionObserver band. A narrow band leaves gaps where no section
     is "current", which shows up as a contents list with nothing
     highlighted; this always resolves to exactly one entry. Both jobs are
     batched into a frame and run once on load, so the page is correct
     before the user scrolls anything.
     ------------------------------------------------------------------ */
  var progressBar = document.querySelector("[data-scroll-progress]");
  var tocLinks = document.querySelectorAll(".docs-toc a[href^='#']");
  var contents = [];

  tocLinks.forEach(function (link) {
    var id = (link.getAttribute("href") || "").slice(1);
    var section = id ? document.getElementById(id) : null;
    if (section) contents.push({ section: section, link: link });
  });

  if (progressBar || contents.length) {
    var queued = false;
    var offsets = [];

    /* Measured on load and on resize only, so the scroll path never forces
       layout. getBoundingClientRect is viewport-relative, hence the scrollY. */
    var measure = function () {
      offsets = contents.map(function (entry) {
        return entry.section.getBoundingClientRect().top + window.scrollY;
      });
    };

    var update = function () {
      if (progressBar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        var ratio = max > 0 ? window.scrollY / max : 0;
        progressBar.style.transform = "scaleX(" + Math.min(1, Math.max(0, ratio)) + ")";
      }

      if (offsets.length) {
        /* A section counts as current once its heading crosses a line a
           little below the nav. */
        var line = window.scrollY + Math.max(160, window.innerHeight * 0.3);
        var index = 0;
        for (var i = 0; i < offsets.length; i++) {
          if (offsets[i] <= line) index = i;
        }
        contents.forEach(function (entry, n) {
          entry.link.classList.toggle("active", n === index);
        });
      }

      queued = false;
    };

    var request = function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", function () { measure(); request(); });

    measure();
    update();
  }

  /* ------------------------------------------------------------------
     Year stamp
     ------------------------------------------------------------------ */
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });
})();
