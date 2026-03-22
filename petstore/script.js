const storeProducts = [
  {
    name: "Feather Wand Teaser",
    category: "Cat Toys",
    animal: "Cats",
    type: "Interactive",
    price: "$8.99",
    page: "cat-toys.html"
  },
  {
    name: "Mini Catnip Mouse",
    category: "Cat Toys",
    animal: "Cats",
    type: "Catnip",
    price: "$5.99",
    page: "cat-toys.html"
  },
  {
    name: "Cloud Plush Kicker",
    category: "Cat Toys",
    animal: "Cats",
    type: "Plush",
    price: "$10.99",
    page: "cat-toys.html"
  },
  {
    name: "Crinkle Butterfly Set",
    category: "Cat Toys",
    animal: "Cats",
    type: "Crinkle",
    price: "$7.99",
    page: "cat-toys.html"
  },
  {
    name: "Chicken Dinner Wet Food",
    category: "Cat Food",
    animal: "Cats",
    type: "Wet Food",
    price: "$3.49",
    page: "cat-food.html"
  },
  {
    name: "Indoor Crunch Dry Food",
    category: "Cat Food",
    animal: "Cats",
    type: "Dry Food",
    price: "$18.99",
    page: "cat-food.html"
  },
  {
    name: "Fresh Clump Litter",
    category: "Cat Litter",
    animal: "Cats",
    type: "Clumping",
    price: "$14.99",
    page: "cat-litter.html"
  },
  {
    name: "Cloud Cat Bed",
    category: "Cat Beds",
    animal: "Cats",
    type: "Bed",
    price: "$29.99",
    page: "cat-bed.html"
  },
  {
    name: "Soft Rope Tug Toy",
    category: "Dog Toys",
    animal: "Dogs",
    type: "Toy",
    price: "$9.99",
    page: "dog-toys.html"
  },
  {
    name: "Squeaky Bone Plush",
    category: "Dog Toys",
    animal: "Dogs",
    type: "Toy",
    price: "$11.99",
    page: "dog-toys.html"
  },
  {
    name: "Chicken Recipe Dog Food",
    category: "Dog Food",
    animal: "Dogs",
    type: "Dry Food",
    price: "$24.99",
    page: "dog-food.html"
  },
  {
    name: "Cozy Pup Bed",
    category: "Dog Beds",
    animal: "Dogs",
    type: "Bed",
    price: "$34.99",
    page: "dog-bed.html"
  }
];

function runSearch(formId, inputId, resultsId, animalFilter = null) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);

  if (!form || !input || !results) return;

  const renderResults = (query) => {
    const q = query.trim().toLowerCase();

    if (!q) {
      results.innerHTML = "";
      return;
    }

    const matches = storeProducts.filter((product) => {
      const haystack = `
        ${product.name}
        ${product.category}
        ${product.animal}
        ${product.type}
      `.toLowerCase();

      const animalMatches = animalFilter ? product.animal === animalFilter : true;
      return animalMatches && haystack.includes(q);
    });

    if (matches.length === 0) {
      results.innerHTML = `
        <div class="search-results-box">
          <p class="search-empty">No products found for "<strong>${query}</strong>".</p>
        </div>
      `;
      return;
    }

    results.innerHTML = `
      <div class="search-results-box">
        <h3>Search results</h3>
        <div class="search-results-list">
          ${matches
            .map(
              (product) => `
            <a class="search-result-item" href="${product.page}">
              <div>
                <strong>${product.name}</strong>
                <p>${product.category} • ${product.type}</p>
              </div>
              <span>${product.price}</span>
            </a>
          `
            )
            .join("")}
        </div>
      </div>
    `;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    renderResults(input.value);
  });

  input.addEventListener("input", () => {
    renderResults(input.value);
  });
}

function getPriceFromCard(card) {
  const raw = card.dataset.price || "0";
  return parseFloat(raw) || 0;
}

function getDateFromCard(card) {
  const raw = card.dataset.date || "1970-01-01";
  return new Date(raw).getTime();
}

function getVisibleCards(container, cardSelector) {
  return Array.from(container.querySelectorAll(cardSelector)).filter(
    (card) => card.style.display !== "none"
  );
}

function updateVisibleCount(container, cardSelector, countSelector) {
  const countElement = document.querySelector(countSelector);
  if (!countElement) return;

  const visibleCards = getVisibleCards(container, cardSelector);
  const visibleCount = visibleCards.length;

  countElement.textContent = `${visibleCount} item${visibleCount === 1 ? "" : "s"}`;

  let noResultsMessage = container.querySelector(".no-results-message");

  if (visibleCount === 0) {
    if (!noResultsMessage) {
      noResultsMessage = document.createElement("div");
      noResultsMessage.className = "no-results-message";
      noResultsMessage.innerHTML = `
        <h3>No products found</h3>
        <p>Try changing or clearing your filters to see more products.</p>
        <button type="button" class="no-results-clear">Clear Filters</button>
      `;

      container.appendChild(noResultsMessage);

      const inlineClearButton = noResultsMessage.querySelector(".no-results-clear");

      inlineClearButton.addEventListener("click", () => {
        const sidebar = container.closest(".catalog-grid")?.querySelector(".catalog-sidebar");
        if (!sidebar) return;

        const realClearButton = sidebar.querySelector(".clear-filters-btn");
        if (realClearButton) {
          realClearButton.click();
        }
      });
    }
  } else if (noResultsMessage) {
    noResultsMessage.remove();
  }
}

function applyFilters(container, cardSelector, countSelector) {
  const cards = Array.from(container.querySelectorAll(cardSelector));
  const sidebar = container.closest(".catalog-grid")?.querySelector(".catalog-sidebar");
  if (!sidebar) return;

  const filterGroups = Array.from(sidebar.querySelectorAll(".filter-group"));
  const activeFilters = {};

  filterGroups.forEach((group) => {
    const groupName = group.dataset.filterGroup;
    const activeButton = group.querySelector(".filter-btn.active-chip");
    if (!groupName || !activeButton) return;

    const value = activeButton.dataset.filter;
    if (value !== "all") {
      activeFilters[groupName] = value;
    }
  });

  cards.forEach((card) => {
    let shouldShow = true;

    Object.entries(activeFilters).forEach(([groupName, filterValue]) => {
      if (!shouldShow) return;

      if (groupName === "price") {
        const price = getPriceFromCard(card);

        if (filterValue === "under-10" && !(price < 10)) shouldShow = false;
        if (filterValue === "10-20" && !(price >= 10 && price <= 20)) shouldShow = false;
        if (filterValue === "over-20" && !(price > 20)) shouldShow = false;
      } else {
        const cardValue = card.dataset[groupName];
        if (cardValue !== filterValue) shouldShow = false;
      }
    });

    card.style.display = shouldShow ? "" : "none";
  });

  updateVisibleCount(container, cardSelector, countSelector);
}

function setupMultiFilters(containerSelector, cardSelector, countSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const sidebar = container.closest(".catalog-grid")?.querySelector(".catalog-sidebar");
  if (!sidebar) return;

  const buttons = sidebar.querySelectorAll(".filter-group .filter-btn");
  if (!buttons.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const group = button.closest(".filter-group");
      if (!group) return;

      const groupButtons = group.querySelectorAll(".filter-btn");
      groupButtons.forEach((btn) => btn.classList.remove("active-chip"));
      button.classList.add("active-chip");

      applyFilters(container, cardSelector, countSelector);
    });
  });

  applyFilters(container, cardSelector, countSelector);
}

function setupProductSort(sortSelector, cardSelector, containerSelector, countSelector) {
  const sortSelect = document.querySelector(sortSelector);
  const container = document.querySelector(containerSelector);

  if (!sortSelect || !container) return;

  const cards = Array.from(container.querySelectorAll(cardSelector));

  cards.forEach((card, index) => {
    card.dataset.originalOrder = index;
  });

  sortSelect.addEventListener("change", () => {
    const value = sortSelect.value;
    const sortedCards = Array.from(container.querySelectorAll(cardSelector));

    if (value === "Price: Low to High") {
      sortedCards.sort((a, b) => getPriceFromCard(a) - getPriceFromCard(b));
    } else if (value === "Price: High to Low") {
      sortedCards.sort((a, b) => getPriceFromCard(b) - getPriceFromCard(a));
    } else if (value === "Newest") {
      sortedCards.sort((a, b) => getDateFromCard(b) - getDateFromCard(a));
    } else {
      sortedCards.sort(
        (a, b) => Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder)
      );
    }

    sortedCards.forEach((card) => container.appendChild(card));
    updateVisibleCount(container, cardSelector, countSelector);
  });
}

function resetFilterGroup(group) {
  const buttons = group.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => btn.classList.remove("active-chip"));

  const allButton = group.querySelector('.filter-btn[data-filter="all"]');
  if (allButton) {
    allButton.classList.add("active-chip");
  }
}

function setupClearFilters(buttonSelector, containerSelector, cardSelector, countSelector, sortSelector) {
  const clearButton = document.querySelector(buttonSelector);
  const container = document.querySelector(containerSelector);
  const sortSelect = document.querySelector(sortSelector);

  if (!clearButton || !container) return;

  clearButton.addEventListener("click", () => {
    const sidebar = clearButton.closest(".catalog-sidebar");
    if (!sidebar) return;

    const groups = sidebar.querySelectorAll(".filter-group");
    groups.forEach((group) => resetFilterGroup(group));

    const cards = Array.from(container.querySelectorAll(cardSelector));
    cards
      .sort((a, b) => Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder))
      .forEach((card) => {
        card.style.display = "";
        container.appendChild(card);
      });

    if (sortSelect) {
      sortSelect.value = "Featured";
    }

    updateVisibleCount(container, cardSelector, countSelector);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  runSearch("cat-search-form", "cat-search-input", "cat-search-results", "Cats");
  runSearch("dog-search-form", "dog-search-input", "dog-search-results", "Dogs");
  runSearch("global-search-form", "global-search-input", "global-search-results", null);

  setupMultiFilters("#cat-toy-products", ".catalog-card", "#cat-toy-count");
  setupProductSort("#sort", ".catalog-card", "#cat-toy-products", "#cat-toy-count");

  setupMultiFilters("#cat-food-products", ".catalog-card", "#cat-food-count");
  setupProductSort("#sort-food", ".catalog-card", "#cat-food-products", "#cat-food-count");

  setupMultiFilters("#cat-litter-products", ".catalog-card", "#cat-litter-count");
  setupProductSort("#sort-litter", ".catalog-card", "#cat-litter-products", "#cat-litter-count");

  setupMultiFilters("#cat-bed-products", ".catalog-card", "#cat-bed-count");
  setupProductSort("#sort-bed", ".catalog-card", "#cat-bed-products", "#cat-bed-count");

  setupMultiFilters("#dog-toy-products", ".catalog-card", "#dog-toy-count");
  setupProductSort("#sort-dog-toys", ".catalog-card", "#dog-toy-products", "#dog-toy-count");

  setupMultiFilters("#dog-food-products", ".catalog-card", "#dog-food-count");
  setupProductSort("#sort-dog-food", ".catalog-card", "#dog-food-products", "#dog-food-count");

  setupMultiFilters("#dog-bed-products", ".catalog-card", "#dog-bed-count");
  setupProductSort("#sort-dog-bed", ".catalog-card", "#dog-bed-products", "#dog-bed-count");

  setupClearFilters("#clear-cat-toy-filters", "#cat-toy-products", ".catalog-card", "#cat-toy-count", "#sort");
  setupClearFilters("#clear-cat-food-filters", "#cat-food-products", ".catalog-card", "#cat-food-count", "#sort-food");
  setupClearFilters("#clear-cat-litter-filters", "#cat-litter-products", ".catalog-card", "#cat-litter-count", "#sort-litter");
  setupClearFilters("#clear-cat-bed-filters", "#cat-bed-products", ".catalog-card", "#cat-bed-count", "#sort-bed");

  setupClearFilters("#clear-dog-toy-filters", "#dog-toy-products", ".catalog-card", "#dog-toy-count", "#sort-dog-toys");
  setupClearFilters("#clear-dog-food-filters", "#dog-food-products", ".catalog-card", "#dog-food-count", "#sort-dog-food");
  setupClearFilters("#clear-dog-bed-filters", "#dog-bed-products", ".catalog-card", "#dog-bed-count", "#sort-dog-bed");
});