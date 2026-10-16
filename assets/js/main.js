/* ============================================================
   Ryad Boujenan - portfolio
   Trois comportements : le menu mobile, la section courante
   (menu + points lateraux) et la barre de progression.
   La page reste entierement lisible sans ce fichier : les deux
   reperes de lecture restent simplement masques.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;

  // Revele les reperes de lecture : ils n'ont aucun sens sans JS.
  root.classList.add("has-js");

  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("nav-toggle");
  var dots = document.getElementById("dot-nav");

  function toArray(list) {
    return list ? Array.prototype.slice.call(list) : [];
  }

  /* --- Menu mobile ---------------------------------------- */
  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Fermer apres un clic sur une ancre, a l'echap, ou en passant en desktop.
    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 880) closeNav();
    });
  }

  /* --- Section courante : menu du haut + points lateraux --- */
  // Les deux navigations pointent sur les memes ancres : un seul
  // observateur les met a jour ensemble.
  var links = toArray(nav && nav.querySelectorAll("a[href^='#']")).concat(
    toArray(dots && dots.querySelectorAll("a[href^='#']"))
  );

  if (links.length && "IntersectionObserver" in window) {
    var sections = []; // ids des sections, dans l'ordre de la page
    var visible = {};

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      if (id && document.getElementById(id) && sections.indexOf(id) === -1) {
        sections.push(id);
      }
    });

    var setActive = function (id) {
      links.forEach(function (link) {
        var active = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", active);
        if (active) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });

        // Si plusieurs sections traversent la bande, la premiere
        // dans l'ordre de la page gagne : le repere ne saute pas.
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i]]) {
            setActive(sections[i]);
            return;
          }
        }
      },
      // Bande de detection : le haut de la fenetre, sous l'en-tete.
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sections.forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* --- Barre de progression de lecture -------------------- */
  // Seul endroit ou un listener de scroll est necessaire : il est
  // passif et cale sur requestAnimationFrame, donc sans cout notable.
  var bar = document.getElementById("progress-bar");

  if (bar) {
    var ticking = false;

    var draw = function () {
      ticking = false;
      var scrollable = root.scrollHeight - window.innerHeight;
      var ratio = scrollable > 0 ? window.pageYOffset / scrollable : 0;
      if (ratio < 0) ratio = 0;
      if (ratio > 1) ratio = 1;
      bar.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    };

    var request = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(draw);
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    draw();
  }

  /* --- Annee du pied de page ------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
