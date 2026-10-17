/* ============================================================
   Visionneuse de la section Voyages (refonte "dossier").
   Reprend la logique de assets/js/main.js, adaptee aux tirages
   groupes par pays. Sans JS, chaque photo reste un simple lien
   vers l'image en pleine taille.
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var gallery = document.getElementById("gallery");
  var box = document.getElementById("lightbox");
  if (!gallery || !box) return;

  var toArray = function (list) {
    return Array.prototype.slice.call(list);
  };

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
      // Focus garde dans la visionneuse, controles video compris.
      var focusables = toArray(box.querySelectorAll("video[controls], button"));
      var pos = focusables.indexOf(document.activeElement);
      var next = event.shiftKey ? pos - 1 : pos + 1;
      if (pos === -1 || next < 0 || next >= focusables.length) {
        event.preventDefault();
        focusables[event.shiftKey ? focusables.length - 1 : 0].focus();
      }
    }
  });
})();
