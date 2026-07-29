document.addEventListener("DOMContentLoaded", function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* Back to top button */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function () {
      backToTop.classList.toggle("visible", window.scrollY > 500);
    });
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Contact form handling (client-side only – opens the visitor's email client) */
  var form = document.getElementById("contact-form");
  var status = document.getElementById("form-status");

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

  function showStatus(text, type) {
    if (!status) return;
    status.textContent = text;
    status.className = "form-status " + type;
  }

  /* Highlight active nav link based on section in view */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-links a[href^='#'], .nav-links a[href*='index.html#']");

  if (sections.length && navLinks.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              var href = link.getAttribute("href") || "";
              link.classList.toggle("active", href.indexOf("#" + id) !== -1);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* Set current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* Scroll reveal animations */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* Animated count-up for hero stats */
  var countEls = document.querySelectorAll("[data-count-to]");
  if (countEls.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-suffix") || "";
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);

      if (prefersReducedMotion || isNaN(target)) {
        el.textContent = target.toLocaleString("de-DE", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }) + suffix;
        return;
      }

      var duration = 1100;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = target * eased;
        el.textContent = current.toLocaleString("de-DE", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }

      requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      countEls.forEach(animateCount);
    } else {
      var countObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      countEls.forEach(function (el) {
        countObserver.observe(el);
      });
    }
  }
});
