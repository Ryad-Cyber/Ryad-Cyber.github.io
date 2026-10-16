/* ============================================================
   Ryad Boujenan - portfolio
   Deux comportements seulement : le menu mobile et le
   surlignage de la section courante dans la navigation.
   La page reste entierement lisible sans ce fichier.
   ============================================================ */
(function () {
  "use strict";

  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("nav-toggle");
  var links = nav ? nav.querySelectorAll("a[href^='#']") : [];

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

  /* --- Section courante dans la navigation ---------------- */
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};

    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute("href").slice(1);
      var section = id ? document.getElementById(id) : null;
      if (section) byId[id] = link;
    });

    var setActive = function (id) {
      Array.prototype.forEach.call(links, function (link) {
        var active = link === byId[id];
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
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      // La bande active est le haut de la fenetre, sous l'en-tete.
      { rootMargin: "-20% 0px -70% 0px" }
    );

    Object.keys(byId).forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* --- Annee du pied de page ------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
