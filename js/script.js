(() => {
  "use strict";

  // IMPORTANT: Add the studio's owner-verified WhatsApp number here before launch.
  // Use international digits only, e.g. India: 91XXXXXXXXXX. Do not include +, spaces or dashes.
  const WHATSAPP_NUMBER = "919791230730";

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#primary-nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        nav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  document.querySelectorAll("[data-service-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.serviceFilter;
      document.querySelectorAll("[data-service-filter]").forEach(b => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll(".service-card").forEach(card => {
        const cats = (card.dataset.category || "").split(/\s+/);
        card.hidden = filter !== "all" && !cats.includes(filter);
      });
    });
  });

  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  document.querySelectorAll("[data-gallery-filter]").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.galleryFilter;
      document.querySelectorAll("[data-gallery-filter]").forEach(b => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      galleryItems.forEach(item => item.hidden = filter !== "all" && item.dataset.kind !== filter);
    });
  });

  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxCaption = document.querySelector("#lightbox-caption");
  let visibleItems = [];
  let currentIndex = 0;
  let lastFocused = null;
  function openLightbox(item) {
    visibleItems = galleryItems.filter(g => !g.hidden);
    currentIndex = visibleItems.indexOf(item);
    lastFocused = item;
    showLightboxImage();
    if (typeof lightbox.showModal === "function") lightbox.showModal();
    else lightbox.setAttribute("open", "");
    lightbox.querySelector(".lightbox-close").focus();
  }
  function showLightboxImage() {
    const item = visibleItems[currentIndex];
    if (!item) return;
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = item.querySelector("img").alt;
    lightboxCaption.textContent = item.dataset.caption || "";
  }
  function closeLightbox() {
    if (lightbox.open && typeof lightbox.close === "function") lightbox.close();
    else lightbox.removeAttribute("open");
    if (lastFocused) lastFocused.focus();
  }
  galleryItems.forEach(item => item.addEventListener("click", () => openLightbox(item)));
  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showLightboxImage();
  });
  lightbox.querySelector(".lightbox-next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % visibleItems.length; showLightboxImage();
  });
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showLightboxImage(); }
    if (event.key === "ArrowRight") { currentIndex = (currentIndex + 1) % visibleItems.length; showLightboxImage(); }
  });
  lightbox.addEventListener("close", () => { if (lastFocused) lastFocused.focus(); });

  // Service and package links preselect the enquiry form's service field.
  document.querySelectorAll("[data-prefill]").forEach(link => {
    link.addEventListener("click", () => {
      const service = document.querySelector("#service");
      const requested = link.dataset.prefill;
      const option = [...service.options].find(o => o.text.toLowerCase() === requested.toLowerCase())
        || [...service.options].find(o => o.text.toLowerCase().includes(requested.toLowerCase().split(" ")[0]));
      if (option) service.value = option.value;
      const packageSelect = document.querySelector("#package");
      const packageOption = [...packageSelect.options].find(o => o.text.toLowerCase() === requested.toLowerCase());
      if (packageOption) packageSelect.value = packageOption.value;
    });
  });

  const form = document.querySelector("#booking-form");
  const status = document.querySelector("#form-status");
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const fields = [
      ["Name", data.get("name")],
      ["Phone", data.get("phone") || "Not provided"],
      ["Event date", data.get("eventDate") || "Not specified"],
      ["Event type", data.get("eventType") || "Not specified"],
      ["Preferred service", data.get("service")],
      ["Package preference", data.get("package") || "Not sure yet"],
      ["Event location", data.get("eventLocation") || "Not specified"],
      ["Additional requirements", data.get("requirements") || "None provided"]
    ];
    const message = "Hello Dhanalaxmi Bridal Studio! I'd like to enquire about your services.\n\n"
      + fields.map(([label, value]) => `${label}: ${String(value).trim()}`).join("\n")
      + "\n\nI understand this is an enquiry and not a confirmed booking.";
    if (!WHATSAPP_NUMBER) {
      status.textContent = "Your details are ready, but WhatsApp is not connected yet. The studio owner must add the verified WhatsApp number in js/script.js before launch. No information has been sent.";
      const blob = new Blob([message], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const download = document.createElement("a");
      download.href = url;
      download.download = "dhanalaxmi-bridal-enquiry.txt";
      download.textContent = "Download enquiry text";
      download.className = "text-link";
      download.style.display = "inline-block";
      download.style.marginTop = "10px";
      status.appendChild(document.createElement("br"));
      status.appendChild(download);
      download.addEventListener("click", () => setTimeout(() => URL.revokeObjectURL(url), 1000), { once: true });
      return;
    }
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    status.textContent = "WhatsApp opened with your enquiry draft. Please review and send it there; your appointment is not confirmed until the studio responds.";
  });

  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
