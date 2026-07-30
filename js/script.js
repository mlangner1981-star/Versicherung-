document.addEventListener("DOMContentLoaded", function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* Mobile navigation drawer */
  var navToggle = document.querySelector(".nav-toggle");
  var navBackdrop = document.querySelector(".nav-backdrop");

  function closeNavDrawer() {
    document.body.classList.remove("nav-drawer-open");
    if (navToggle) {
      navToggle.classList.remove("active");
      navToggle.setAttribute("aria-expanded", "false");
    }
  }

  function openNavDrawer() {
    document.body.classList.add("nav-drawer-open");
    if (navToggle) {
      navToggle.classList.add("active");
      navToggle.setAttribute("aria-expanded", "true");
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      if (document.body.classList.contains("nav-drawer-open")) {
        closeNavDrawer();
      } else {
        openNavDrawer();
      }
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", closeNavDrawer);
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeNavDrawer);
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNavDrawer();
    });
  }

  /* Scroll progress bar */
  var progressBar = document.querySelector(".progress-bar");
  if (progressBar) {
    window.addEventListener("scroll", function () {
      var h = document.documentElement;
      var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      progressBar.style.width = scrolled + "%";
    });
  }

  /* Custom cursor */
  if (!isCoarsePointer && !prefersReducedMotion) {
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");

    if (dot && ring) {
      var ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;

      window.addEventListener("mousemove", function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + "px";
        dot.style.top = mouseY + "px";
        dot.classList.add("is-ready");
        ring.classList.add("is-ready");
      });

      function animateRing() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.left = ringX + "px";
        ring.style.top = ringY + "px";
        requestAnimationFrame(animateRing);
      }
      animateRing();

      document.querySelectorAll("a, button, .quiz-option, input, textarea, select").forEach(function (el) {
        el.addEventListener("mouseenter", function () { ring.classList.add("is-active"); });
        el.addEventListener("mouseleave", function () { ring.classList.remove("is-active"); });
      });
    }
  }

  /* Magnetic buttons */
  if (!isCoarsePointer && !prefersReducedMotion) {
    document.querySelectorAll(".magnetic").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + relX * 0.22 + "px, " + relY * 0.3 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "translate(0, 0)";
      });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* Count-up stats */
  document.querySelectorAll("[data-count-to]").forEach(function (el) {
    var target = parseFloat(el.getAttribute("data-count-to"));
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);

    function render(value) {
      el.textContent = value.toLocaleString("de-DE", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
    }

    if (prefersReducedMotion || isNaN(target) || !("IntersectionObserver" in window)) {
      render(target);
      return;
    }

    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        o.unobserve(el);
        var start = null;
        var duration = 1100;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          render(target * eased);
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    obs.observe(el);
  });

  /* FAQ accordion */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (openItem) {
        if (openItem !== item) openItem.classList.remove("open");
      });
      item.classList.toggle("open", !isOpen);
    });
  });

  /* Back to top */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("visible", window.scrollY > 500);
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* Contact form (client-side only — opens the visitor's email client) */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

  function showStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.className = "form-status " + type;
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.querySelector("#name").value.trim();
      var email = form.querySelector("#email").value.trim();
      var phone = form.querySelector("#phone").value.trim();
      var topic = form.querySelector("#topic").value;
      var message = form.querySelector("#message").value.trim();
      var consent = form.querySelector("#consent").checked;

      if (!name || !email || !message) {
        showStatus("Bitte füllen Sie alle Pflichtfelder aus.", "error");
        return;
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showStatus("Bitte geben Sie eine gültige E-Mail-Adresse ein.", "error");
        return;
      }

      if (!consent) {
        showStatus("Bitte stimmen Sie der Datenschutzerklärung zu.", "error");
        return;
      }

      var subject = encodeURIComponent("Anfrage über die Webseite: " + topic);
      var bodyLines = [
        "Name: " + name,
        "E-Mail: " + email,
        "Telefon: " + (phone || "-"),
        "Thema: " + topic,
        "",
        "Nachricht:",
        message
      ];
      var body = encodeURIComponent(bodyLines.join("\n"));

      window.location.href = "mailto:info@versicherung-viersen.de?subject=" + subject + "&body=" + body;

      showStatus("Ihr E-Mail-Programm wird geöffnet, um die Anfrage zu senden.", "success");
      form.reset();
    });
  }

  /* Kompass-Check quiz */
  var quizState = {};
  var quizCard = document.querySelector(".quiz-card");
  var recommendations = {
    einkommen: {
      title: "Berufsunfähigkeit sichert Ihr Einkommen ab.",
      text: "Ihre Arbeitskraft ist Ihr größtes Kapital. Eine Berufsunfähigkeitsversicherung fängt den Einkommensausfall auf, wenn Sie selbst nicht mehr arbeiten können."
    },
    eigentum: {
      title: "Haftpflicht & Hausrat schützen Ihr Zuhause.",
      text: "Schadensersatzforderungen und Schäden am Hausrat können teuer werden. Eine passende Absicherung schützt Ihr Eigentum zuverlässig."
    },
    vorsorge: {
      title: "Altersvorsorge lohnt sich, je früher desto mehr.",
      text: "Private und betriebliche Vorsorge lassen sich klug kombinieren. Wir zeigen Ihnen, was zu Ihrer Lebensplanung passt."
    },
    fahrzeug: {
      title: "Die richtige Kfz-Versicherung spart bares Geld.",
      text: "Haftpflicht, Teil- oder Vollkasko — wir vergleichen Tarife für PKW, Motorrad oder Wohnmobil und finden das passende Modell."
    }
  };

  if (quizCard) {
    var steps = quizCard.querySelectorAll(".quiz-step");
    var dots = quizCard.querySelectorAll(".quiz-dots span");

    function showStep(n) {
      steps.forEach(function (s) { s.classList.toggle("active", s.getAttribute("data-step") == n); });
      dots.forEach(function (d, i) { d.classList.toggle("done", i < n); });
    }

    quizCard.querySelectorAll('.quiz-step[data-step="1"] .quiz-option').forEach(function (opt) {
      opt.addEventListener("click", function () {
        quizState.situation = opt.getAttribute("data-value");
        showStep(2);
      });
    });

    quizCard.querySelectorAll('.quiz-step[data-step="2"] .quiz-option').forEach(function (opt) {
      opt.addEventListener("click", function () {
        quizState.priority = opt.getAttribute("data-value");
        var rec = recommendations[quizState.priority];
        document.getElementById("quiz-result-title").textContent = rec.title;
        document.getElementById("quiz-result-text").textContent = rec.text;
        showStep(3);
      });
    });

    var restartBtn = document.getElementById("quiz-restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        quizState = {};
        showStep(1);
      });
    }
  }

  /* Constellation canvas */
  var canvas = document.getElementById("constellation");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.closest(".hero");
    var points = [];
    var pointerPos = { x: null, y: null };
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      var rect = hero.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.min(60, Math.floor((rect.width * rect.height) / 22000));
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18
        });
      }
    }

    function draw() {
      var rect = hero.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      points.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > rect.width) p.vx *= -1;
        if (p.y < 0 || p.y > rect.height) p.vy *= -1;

        if (pointerPos.x !== null) {
          var dx = p.x - pointerPos.x, dy = p.y - pointerPos.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0.01) {
            p.x += dx / dist * 0.4;
            p.y += dy / dist * 0.4;
          }
        }
      });

      for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
          var dx = points[i].x - points[j].x, dy = points[i].y - points[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = "rgba(176, 141, 87, " + (0.14 * (1 - dist / 140)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      points.forEach(function (p) {
        ctx.fillStyle = "rgba(216, 179, 120, 0.55)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }

    if (!prefersReducedMotion) {
      resize();
      window.addEventListener("resize", resize);
      hero.addEventListener("mousemove", function (e) {
        var rect = hero.getBoundingClientRect();
        pointerPos.x = e.clientX - rect.left;
        pointerPos.y = e.clientY - rect.top;
      });
      hero.addEventListener("mouseleave", function () { pointerPos.x = null; pointerPos.y = null; });
      requestAnimationFrame(draw);
    } else {
      canvas.style.display = "none";
    }
  }

  /* Highlight active nav link based on section in view */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-links a[href^='#'], .nav-links a[href*='index.html#']");

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (link) {
            var href = link.getAttribute("href") || "";
            link.classList.toggle("active", href.indexOf("#" + id) !== -1);
          });
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px" });

    sections.forEach(function (section) { navObserver.observe(section); });
  }

  /* Current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
