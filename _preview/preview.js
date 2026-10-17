/* ============================================================
   Apercu de la refonte "dossier" - comportements de la page.
   1. Filtres de projets, construits a partir des cartes.
   2. Section courante dans le menu.
   3. Visionneuse des photos de voyage.
   Sans JavaScript : toutes les cartes restent visibles, le detail
   des cas se deplie quand meme (<details>), et chaque photo reste
   un lien vers l'image en pleine taille.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;

  var toArray = function (list) {
    return list ? Array.prototype.slice.call(list) : [];
  };

  /* --- 1. Filtres de projets ------------------------------ */
  // Chaque carte porte data-cat (cle) et data-cat-name (libelle).
  // Les onglets sont deduits des cartes presentes : une categorie
  // sans projet n'affiche pas d'onglet vide. Ajouter une carte avec
  // une nouvelle categorie suffit a faire apparaitre son onglet.
  var bar = document.getElementById("filters");
  var grid = document.getElementById("projects");

  if (bar && grid) {
    var cards = toArray(grid.querySelectorAll(".card"));
    var cats = [];
    var names = {};
    var counts = {};

    cards.forEach(function (card) {
      var key = card.getAttribute("data-cat");
      if (!key) return;
      if (!names[key]) {
        names[key] = card.getAttribute("data-cat-name") || key;
        cats.push(key);
        counts[key] = 0;
      }
      counts[key]++;
    });

    // Ordre d'affichage fixe, declare sur la barre (data-order) ;
    // une categorie absente de cette liste passe en fin.
    var order = (bar.getAttribute("data-order") || "").split(/\s+/);
    cats.sort(function (a, b) {
      var ia = order.indexOf(a);
      var ib = order.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });

    var buttons = [];
    var makeButton = function (key, label, count) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "filter";
      b.setAttribute("data-filter", key);
      b.setAttribute("aria-pressed", key === "all" ? "true" : "false");
      b.appendChild(document.createTextNode(label));
      var c = document.createElement("span");
      c.className = "count";
      c.textContent = String(count);
      b.appendChild(c);
      bar.appendChild(b);
      buttons.push(b);
    };

    if (cats.length) {
      makeButton("all", bar.getAttribute("data-all-label") || "Tous", cards.length);
      cats.forEach(function (key) {
        makeButton(key, names[key], counts[key]);
      });

      bar.addEventListener("click", function (event) {
        var b = event.target.closest(".filter");
        if (!b) return;
        var key = b.getAttribute("data-filter");
        buttons.forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        cards.forEach(function (card) {
          card.hidden = !(key === "all" || card.getAttribute("data-cat") === key);
        });
      });
    }
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

  /* --- 3. Visionneuse des photos de voyage ---------------- */
  var gallery = document.getElementById("gallery");
  var box = document.getElementById("lightbox");

  if (gallery && box) {
    var tiles = toArray(gallery.querySelectorAll(".photo-link"));
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
      media.innerHTML = "";
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
        var next = event.shiftKey ? pos - 1 : pos + 1;
        if (pos === -1 || next < 0 || next >= focusables.length) {
          event.preventDefault();
          focusables[event.shiftKey ? focusables.length - 1 : 0].focus();
        }
      }
    });
  }
})();
