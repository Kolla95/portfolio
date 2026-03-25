document.addEventListener("DOMContentLoaded", () => {
  const cursorLight = document.querySelector(".cursor-light");

  if (cursorLight) {
    document.addEventListener("mousemove", (e) => {
      cursorLight.style.left = `${e.clientX}px`;
      cursorLight.style.top = `${e.clientY}px`;
    });

    document.addEventListener("mouseleave", () => {
      cursorLight.style.opacity = "0";
    });

    document.addEventListener("mouseenter", () => {
      cursorLight.style.opacity = "1";
    });
  }

  const copyBtn = document.getElementById("copyEmailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("kolbrundavis@gmail.com");
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy Email";
        }, 2000);
      } catch (err) {
        copyBtn.textContent = "Failed";
      }
    });
  }

  const track = document.getElementById("projectsTrack");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const dotsWrap = document.querySelector(".slider-dots");
  const viewport = document.querySelector(".projects-viewport");

  const faders = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.2 });

  faders.forEach((el) => observer.observe(el));

  if (!track || !prevBtn || !nextBtn || !viewport) return;

  const cards = Array.from(track.querySelectorAll(".project-card"));
  let currentIndex = 0;

  function isMobileSlider() {
    return window.innerWidth <= 900;
  }

  function getCardsPerView() {
    return isMobileSlider() ? 1 : 2;
  }

  function getMaxIndex() {
    return Math.max(0, cards.length - getCardsPerView());
  }

  function updateDots() {
    if (!dotsWrap) return;

    const dots = dotsWrap.querySelectorAll(".dot");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  }

  function renderDots() {
    if (!dotsWrap) return;

    const maxIndex = getMaxIndex();
    dotsWrap.innerHTML = "";

    if (isMobileSlider()) {
      return;
    }

    for (let i = 0; i <= maxIndex; i += getCardsPerView()) {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.dataset.index = i;

      dot.addEventListener("click", () => {
        currentIndex = Number(dot.dataset.index);
        updateSlider();
      });

      dotsWrap.appendChild(dot);
    }

    updateDots();
  }

  function updateSlider() {
    const firstCard = cards[0];
    if (!firstCard) return;

    if (isMobileSlider()) {
      track.style.transform = "none";
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
      return;
    }

    prevBtn.style.display = "grid";
    nextBtn.style.display = "grid";

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap) || 28;
    const moveAmount = currentIndex * (firstCard.offsetWidth + gap);

    track.style.transform = `translateX(-${moveAmount}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= getMaxIndex();

    updateDots();
  }

  prevBtn.addEventListener("click", () => {
    const cardsPerView = getCardsPerView();
    currentIndex = Math.max(0, currentIndex - cardsPerView);
    updateSlider();
  });

  nextBtn.addEventListener("click", () => {
    const cardsPerView = getCardsPerView();
    currentIndex = Math.min(getMaxIndex(), currentIndex + cardsPerView);
    updateSlider();
  });

  window.addEventListener("resize", () => {
    currentIndex = Math.min(currentIndex, getMaxIndex());
    renderDots();
    updateSlider();
  });

  renderDots();
  updateSlider();
});