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
     Year stamp
     ------------------------------------------------------------------ */
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = year;
  });
})();
