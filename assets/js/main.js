/* ============================================================
   Ryad Boujenan - portfolio, comportements des pages.
   1. Filtres de projets (7 onglets fixes, etat vide).
   2. Section courante dans le menu.
   3. Formulaire de contact -> messagerie de l'utilisateur.
   4. Carrousels de la section Voyages.
   5. Visionneuse : photos de voyage et certificats.
   6. Alternance des trois certificats Splunk.
   Sans JavaScript : toutes les cartes restent visibles, le detail
   des cas se deplie (<details>), le formulaire s'envoie en mailto,
   les carrousels defilent au doigt ou a la barre, chaque photo et
   chaque certificat reste un lien vers l'image en pleine taille,
   et le visuel Splunk montre le premier des trois certificats.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toArray = function (list) {
    return list ? Array.prototype.slice.call(list) : [];
  };

  /* --- 1. Filtres de projets ------------------------------ */
  var bar = document.getElementById("filters");
  var grid = document.getElementById("project-cards");
  var empty = document.getElementById("projects-empty");

  if (bar && grid) {
    var cards = toArray(grid.querySelectorAll(".card"));
    var buttons = toArray(bar.querySelectorAll(".filter"));

    // Une carte "en preparation" n'est pas un projet : elle n'apparait
    // que dans sa propre categorie, jamais dans "Tous", et ne compte pas.
    var isPlaceholder = function (card) {
      return card.hasAttribute("data-placeholder");
    };

    var matches = function (card, key) {
      if (key === "all") return !isPlaceholder(card);
      return card.getAttribute("data-cat") === key;
    };

    buttons.forEach(function (b) {
      var key = b.getAttribute("data-filter");
      var n = cards.filter(function (c) {
        return !isPlaceholder(c) && matches(c, key);
      }).length;
      var badge = b.querySelector(".count");
      if (badge) badge.textContent = String(n);
    });

    var apply = function (btn) {
      var key = btn.getAttribute("data-filter");
      var shown = 0;

      buttons.forEach(function (x) {
        x.setAttribute("aria-pressed", x === btn ? "true" : "false");
      });
      cards.forEach(function (c) {
        var on = matches(c, key);
        c.hidden = !on;
        if (on) shown++;
      });

      // Categorie sans projet : la grille cede la place a l'etat vide.
      grid.hidden = shown === 0;
      if (empty) {
        empty.hidden = shown !== 0;
        var label = empty.querySelector("[data-cat-label]");
        if (label) label.textContent = btn.getAttribute("data-label") || "";
      }
    };

    bar.hidden = false;
    bar.addEventListener("click", function (event) {
      var b = event.target.closest(".filter");
      if (b) apply(b);
    });

    // Etat initial : "Tous", donc sans les cartes en preparation.
    apply(buttons[0]);
  }

  /* --- 2. Section courante dans le menu ------------------- */
  var nav = document.querySelector(".site-nav");
  var links = toArray(nav && nav.querySelectorAll("a[href^='#']"));

  if (links.length && "IntersectionObserver" in window) {
    var order = [];
    var visible = {};

    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      if (id && document.getElementById(id)) order.push(id);
    });

    var setActive = function (id) {
      links.forEach(function (link) {
        if (link.getAttribute("href") === "#" + id) {
          link.setAttribute("aria-current", "true");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          visible[e.target.id] = e.isIntersecting;
        });
        for (var i = 0; i < order.length; i++) {
          if (visible[order[i]]) {
            setActive(order[i]);
            return;
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    order.forEach(function (id) {
      observer.observe(document.getElementById(id));
    });
  }

  /* --- 3. Formulaire de contact --------------------------- */
  // Pas de serveur : le message est prepare dans la messagerie du
  // visiteur, qui n'a plus qu'a l'envoyer.
  var form = document.getElementById("contact-form");

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.elements.nom.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var subject = (form.getAttribute("data-subject") || "Contact") + " — " + name;
      var body = message + "\n\n— " + name + "\n" + email;

      window.location.href =
        "mailto:" + form.getAttribute("data-to") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* --- 4. Carrousels --------------------------------------- */
  toArray(document.querySelectorAll("[data-carousel]")).forEach(function (wrap) {
    var track = wrap.querySelector(".track");
    var navBox = wrap.querySelector(".carousel-nav");
    var prev = wrap.querySelector("[data-dir='-1']");
    var next = wrap.querySelector("[data-dir='1']");
    if (!track || !navBox || !prev || !next) return;

    var update = function () {
      var max = track.scrollWidth - track.clientWidth;
      // Pas de fleches quand tout tient a l'ecran.
      navBox.hidden = max <= 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max - 2;
    };

    [prev, next].forEach(function (b) {
      b.addEventListener("click", function () {
        var dir = Number(b.getAttribute("data-dir"));
        track.scrollBy({
          left: dir * track.clientWidth * 0.85,
          behavior: reduced ? "auto" : "smooth"
        });
      });
    });

    var pending = false;
    track.addEventListener(
      "scroll",
      function () {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(function () {
          pending = false;
          update();
        });
      },
      { passive: true }
    );
    window.addEventListener("resize", update);
    toArray(track.querySelectorAll("img")).forEach(function (img) {
      img.addEventListener("load", update);
    });
    update();
  });

  /* --- 5. Visionneuse (photos de voyage + certificats) ------ */
  var box = document.getElementById("lightbox");
  var groups = toArray(document.querySelectorAll("[data-gallery]"));

  if (box && groups.length) {
    var tiles = [];
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

    /* Un groupe = une suite parcourable : les photos d'un pays,
       ou l'ensemble des certificats. */
    var tilesOf = function (group) {
      return toArray(group.querySelectorAll("a.photo, a.cert-visual"));
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

    var open = function (list, i, trigger) {
      tiles = list;
      opener = trigger || null;
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
      media.innerHTML = ""; // arrete la video
      if (opener) opener.focus();
    };

    groups.forEach(function (group) {
      var list = tilesOf(group);
      list.forEach(function (tile, i) {
        tile.addEventListener("click", function (event) {
          event.preventDefault();
          open(list, i, tile);
        });
      });
    });

    /* Bouton « voir tous les certificats » : ouvre le groupe entier.
       Masque dans le HTML, il n'apparait que si le JS repond. */
    toArray(document.querySelectorAll("[data-open-gallery]")).forEach(function (btn) {
      var group = document.getElementById(btn.getAttribute("data-open-gallery"));
      if (!group) return;
      btn.hidden = false;
      btn.addEventListener("click", function () {
        var list = tilesOf(group);
        if (list.length) open(list, 0, btn);
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", function () {
      show(current - 1);
    });
    btnNext.addEventListener("click", function () {
      show(current + 1);
    });

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
        var focusables = toArray(box.querySelectorAll("video[controls], button"));
        var pos = focusables.indexOf(document.activeElement);
        var step = event.shiftKey ? pos - 1 : pos + 1;
        if (pos === -1 || step < 0 || step >= focusables.length) {
          event.preventDefault();
          focusables[event.shiftKey ? focusables.length - 1 : 0].focus();
        }
      }
    });
  }

  /* --- 6. Alternance des trois certificats Splunk ----------- */
  toArray(document.querySelectorAll("[data-rotator]")).forEach(function (rot) {
    var slides = toArray(rot.querySelectorAll(".cert-visual"));
    var holder = rot.parentNode || rot;
    var dots = toArray(holder.querySelectorAll(".cert-dots i"));
    var timer = null;
    var index = 0;

    // Mouvement non souhaite ou rien a faire tourner : on laisse le premier.
    if (reduced || slides.length < 2) return;

    var goTo = function (i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, n) {
        var on = n === index;
        slide.classList.toggle("is-on", on);
        slide.setAttribute("tabindex", on ? "0" : "-1");
        if (on) {
          slide.removeAttribute("aria-hidden");
        } else {
          slide.setAttribute("aria-hidden", "true");
        }
      });
      dots.forEach(function (dot, n) {
        dot.classList.toggle("is-on", n === index);
      });
    };

    var stop = function () {
      window.clearInterval(timer);
      timer = null;
    };

    var start = function () {
      if (timer) return;
      timer = window.setInterval(function () {
        // Ne pas defiler derriere la visionneuse ouverte.
        if (root.classList.contains("is-locked")) return;
        goTo(index + 1);
      }, 4500);
    };

    // La lecture d'un certificat prime sur le defilement.
    rot.addEventListener("mouseenter", stop);
    rot.addEventListener("mouseleave", start);
    rot.addEventListener("focusin", stop);
    rot.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  });
})();
