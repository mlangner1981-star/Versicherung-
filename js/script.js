document.addEventListener("DOMContentLoaded", function () {
  /* Mobile navigation toggle */
  var navToggle = document.querySelector(".nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
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
});
