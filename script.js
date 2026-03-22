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

  if (!track || !prevBtn || !nextBtn || !dotsWrap) return;

  let currentSlide = 0;
  let totalSlides = window.innerWidth <= 900 ? 4 : 2;

  function updateSlider(index) {
    currentSlide = index;

    if (window.innerWidth <= 900) {
      track.style.transform = `translateX(calc(-${index * 100}% - ${index * 22}px))`;
    } else {
      track.style.transform = `translateX(-${index * 100}%)`;
    }

    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });
  }

  function bindDots() {
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.index);
        updateSlider(index);
      });
    });
  }

  function renderDots() {
    if (window.innerWidth <= 900) {
      dotsWrap.innerHTML = `
        <button class="dot ${currentSlide === 0 ? "active" : ""}" data-index="0" aria-label="Go to slide 1"></button>
        <button class="dot ${currentSlide === 1 ? "active" : ""}" data-index="1" aria-label="Go to slide 2"></button>
        <button class="dot ${currentSlide === 2 ? "active" : ""}" data-index="2" aria-label="Go to slide 3"></button>
        <button class="dot ${currentSlide === 3 ? "active" : ""}" data-index="3" aria-label="Go to slide 4"></button>
      `;
    } else {
      if (currentSlide > 1) currentSlide = 1;

      dotsWrap.innerHTML = `
        <button class="dot ${currentSlide === 0 ? "active" : ""}" data-index="0" aria-label="Go to first slide"></button>
        <button class="dot ${currentSlide === 1 ? "active" : ""}" data-index="1" aria-label="Go to second slide"></button>
      `;
    }

    bindDots();
  }

  function refreshSliderState() {
    totalSlides = window.innerWidth <= 900 ? 4 : 2;
    renderDots();
    updateSlider(currentSlide);
  }

  prevBtn.addEventListener("click", () => {
    const newIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    updateSlider(newIndex);
  });

  nextBtn.addEventListener("click", () => {
    const newIndex = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
    updateSlider(newIndex);
  });

  window.addEventListener("resize", refreshSliderState);

  refreshSliderState();
});