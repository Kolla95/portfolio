document.addEventListener("DOMContentLoaded", () => {
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

  // Fade-in animation
  const faders = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    },
    { threshold: 0.2 }
  );

  faders.forEach((el) => observer.observe(el));

// Auto-step project slider
const track = document.getElementById("projectsTrack");

if (track) {
  const cards = Array.from(track.querySelectorAll(".project-card"));
  let currentIndex = 0;
  let isPaused = false;

  track.addEventListener("mouseenter", () => {
    isPaused = true;
  });

  track.addEventListener("mouseleave", () => {
    isPaused = false;
  });

  function moveToProject(index) {
    const firstCard = cards[0];
    if (!firstCard) return;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap) || 28;
    const moveAmount = index * (firstCard.offsetWidth + gap);

    track.style.transform = `translateX(-${moveAmount}px)`;
  }

  function nextProject() {
    if (window.innerWidth <= 900 || isPaused) return;

    currentIndex++;

    // If you duplicated your cards, this loops smoothly halfway through
    if (currentIndex >= cards.length / 2) {
      currentIndex = 0;
    }

    moveToProject(currentIndex);
  }

  moveToProject(currentIndex);
  setInterval(nextProject, 6000);
}
  }
);