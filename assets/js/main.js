/* ============================================================
   Ryad Boujenan - portfolio
   Quatre comportements : le menu mobile, la section courante
   (menu + points lateraux), la barre de progression et la
   visionneuse de la galerie voyages.
   La page reste entierement lisible sans ce fichier : les reperes
   de lecture restent masques et les vignettes redeviennent de
   simples liens vers la photo en pleine taille.
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
      if (window.innerWidth > 950) closeNav();
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

  /* --- Visionneuse de la galerie voyages ------------------ */
  // Chaque vignette est un lien vers la photo en pleine taille :
  // sans JS le clic ouvre simplement l'image dans le navigateur.
  var gallery = document.getElementById("gallery");
  var box = document.getElementById("lightbox");

  if (gallery && box) {
    var tiles = toArray(gallery.querySelectorAll(".tile-link"));
    var media = document.getElementById("lightbox-media");
    var caption = document.getElementById("lightbox-caption");
    var counter = document.getElementById("lightbox-count");
    var btnClose = document.getElementById("lightbox-close");
    var btnPrev = document.getElementById("lightbox-prev");
    var btnNext = document.getElementById("lightbox-next");
    var current = 0;
    var opener = null;

    var pad = function (n) {
      return (n < 10 ? "0" : "") + n;
    };

    var show = function (i) {
      current = (i + tiles.length) % tiles.length;

      var tile = tiles[current];
      var text = tile.getAttribute("data-caption") || "";
      var node;

      if (tile.getAttribute("data-type") === "video") {
        node = document.createElement("video");
        node.controls = true;
        node.muted = true;
        node.playsInline = true;
        node.preload = "metadata";
      } else {
        node = document.createElement("img");
        node.alt = text;
        node.decoding = "async";
      }
      node.src = tile.getAttribute("href");

      media.innerHTML = "";
      media.appendChild(node);
      caption.textContent = text;
      counter.textContent = pad(current + 1) + " / " + pad(tiles.length);
    };

    var open = function (i, trigger) {
      opener = trigger || null;
      // Compense la disparition de la barre de defilement.
      var gap = window.innerWidth - root.clientWidth;
      if (gap > 0) document.body.style.paddingRight = gap + "px";
      root.classList.add("is-locked");
      box.hidden = false;
      show(i);
      btnClose.focus();
    };

    var close = function () {
      box.hidden = true;
      root.classList.remove("is-locked");
      document.body.style.paddingRight = "";
      media.innerHTML = ""; // arrete la video et libere le fichier
      if (opener) opener.focus();
    };

    tiles.forEach(function (tile, i) {
      tile.addEventListener("click", function (event) {
        event.preventDefault();
        open(i, tile);
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () {
      show(current - 1);
    });
    btnNext.addEventListener("click", function () {
      show(current + 1);
    });

    // Clic en dehors de l'image : on ferme.
    box.addEventListener("click", function (event) {
      if (event.target === box || event.target === media) close();
    });

    document.addEventListener("keydown", function (event) {
      if (box.hidden) return;

      if (event.key === "Escape") {
        close();
      } else if (event.key === "ArrowLeft") {
        show(current - 1);
      } else if (event.key === "ArrowRight") {
        show(current + 1);
      } else if (event.key === "Tab") {
        // Focus garde dans la visionneuse tant qu'elle est ouverte.
        // Recalcule a chaque fois : les controles video en font partie.
        var focusables = toArray(box.querySelectorAll("video[controls], button"));
        var pos = focusables.indexOf(document.activeElement);
        var next = event.shiftKey ? pos - 1 : pos + 1;
        if (pos === -1 || next < 0 || next >= focusables.length) {
          event.preventDefault();
          focusables[event.shiftKey ? focusables.length - 1 : 0].focus();
        }
      }
    });
  }

  /* --- Annee du pied de page ------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
