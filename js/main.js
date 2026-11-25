(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const railLinks = [...document.querySelectorAll(".rail__link")];
  const sections = [...document.querySelectorAll(".section")];
  const menuButton = document.querySelector(".menu-button");
  const mobileMenu = document.querySelector(".mobile-menu");
  const hero = document.querySelector(".hero");
  const heroTitle = document.querySelector(".hero__title");
  const sectionIconNumbers = Object.freeze({
    home: 12,
    about: 10,
    interests: 1,
    projects: 11,
    experience: 15,
    certifications: 17,
    contact: 18
  });
  const animationIconNumbers = Object.freeze({sawblade: 13});
  const negativeSpaceIconNumbers = new Set([12, 10, 11, 15, 17]);

  async function loadSectionIcons() {
    const iconSources = new Map();
    const fillVariables = new Map([
      ["#000000", "--section-icon-primary"],
      ["#171717", "--section-icon-secondary"]
    ]);

    const iconNumbers = {...sectionIconNumbers, ...animationIconNumbers};
    await Promise.all([...new Set(Object.values(iconNumbers))].map(async number => {
      const response = await fetch(`assets/icons_made_by_josh/dark_grey_icon_${number}.svg`);
      if (!response.ok) {
        throw new Error(`Could not load section icon ${number}: ${response.status}`);
      }

      const documentSvg = new DOMParser().parseFromString(await response.text(), "image/svg+xml");
      const svg = documentSvg.documentElement;
      if (svg.localName !== "svg" || documentSvg.querySelector("parsererror")) {
        throw new Error(`Section icon ${number} is not valid SVG.`);
      }

      const backgroundShape = svg.querySelector("path");
      if (!backgroundShape || backgroundShape.getAttribute("fill")?.toLowerCase() !== "#000000") {
        throw new Error(`Section icon ${number} is missing its expected square background shape.`);
      }
      backgroundShape.remove();
      if (!svg.querySelector("path")) {
        throw new Error(`Section icon ${number} contains no artwork after removing its background.`);
      }

      svg.querySelectorAll("[fill], [stroke]").forEach(shape => {
        ["fill", "stroke"].forEach(attribute => {
          const color = shape.getAttribute(attribute)?.toLowerCase();
          if (!color || color === "none") return;
          if (negativeSpaceIconNumbers.has(number) && attribute === "fill" && color === "#000000") {
            shape.style.setProperty(attribute, "none");
            return;
          }
          const variable = fillVariables.get(color);
          if (!variable) {
            throw new Error(`Unexpected ${attribute} color "${color}" in section icon ${number}.`);
          }
          shape.style.setProperty(attribute, `var(${variable})`);
        });
      });

      if (number === animationIconNumbers.sawblade) {
        const greenUnderlay = svg.querySelector('path[fill="#171717"]');
        if (!greenUnderlay) {
          throw new Error("Sawblade icon is missing its dark green underlay.");
        }
        greenUnderlay.style.setProperty("stroke", "var(--section-icon-secondary)");
        greenUnderlay.style.setProperty("stroke-width", "2");
      }

      iconSources.set(number, svg);
    }));

    function createSectionIcon(section) {
      const iconNumber = iconNumbers[section];
      if (!iconNumber || !iconSources.has(iconNumber)) {
        throw new Error(`No section icon is available for "${section}".`);
      }

      const wrapper = document.createElement("span");
      wrapper.className = "section-icon";
      wrapper.dataset.section = section;
      wrapper.dataset.iconNumber = String(iconNumber);
      wrapper.setAttribute("aria-hidden", "true");

      const svg = document.importNode(iconSources.get(iconNumber), true);
      svg.removeAttribute("id");
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      svg.setAttribute("focusable", "false");
      svg.classList.add("section-icon__art");
      wrapper.append(svg);
      return wrapper;
    }

    document.querySelectorAll(".rail__link[data-section]").forEach(link => {
      link.prepend(createSectionIcon(link.dataset.section));
    });

    mobileMenu.querySelectorAll('a[href^="#"]').forEach(link => {
      const section = link.getAttribute("href").slice(1);
      link.prepend(createSectionIcon(section));
    });

    document.querySelectorAll("main .section[data-section]").forEach(section => {
      const heading = section.querySelector(".hero__title, .section-heading h2, .contact__inner h2");
      if (!heading) return;
      const icon = createSectionIcon(section.dataset.section);
      heading.prepend(icon);
    });

    document.querySelector(".hero__sawblade").append(createSectionIcon("sawblade"));
  }

  const sectionIconsLoaded = loadSectionIcons()
    .then(() => true)
    .catch(error => {
      console.error("Section icons could not be loaded.", error);
      return false;
    });

  function updateHeroTitleOpacity() {
    const progress = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
    heroTitle.style.opacity = String(1 - progress * 0.65);
    heroTitle.style.transform = `translateY(${-70 * progress}px)`;
  }

  window.addEventListener("scroll", updateHeroTitleOpacity, {passive: true});
  window.addEventListener("resize", updateHeroTitleOpacity);
  updateHeroTitleOpacity();

  const grid = document.getElementById("project-grid");
  const projects = window.PORTFOLIO_DATA?.projects || [];
  document.getElementById("project-count").textContent = projects.length;
  if (projects.length) {
    grid.innerHTML = projects.map((project, index) => `
      <article class="project-card ${project.featured ? "project-card--wide" : ""}">
        <a href="projects/${project.slug}/" aria-label="View ${project.title}">
          <div class="project-card__image">
            <div class="project-card__placeholder" aria-hidden="true">
              <span>Project image placeholder</span>
              <b>${String(index + 1).padStart(2, "0")}</b>
            </div>
            <img src="${project.cover}" alt="${project.title} - replaceable project cover" width="1200" height="800" loading="${index ? "lazy" : "eager"}">
          </div>
          <div class="project-card__meta"><span>${project.category}</span><time>${project.date}</time></div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
        </a>
      </article>`).join("");
    grid.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => sessionStorage.setItem("portfolioScrollY", String(window.scrollY)));
    });
    grid.querySelectorAll(".project-card__image img").forEach(image => {
      image.addEventListener("error", () => {
        image.hidden = true;
        image.parentElement.classList.add("has-image-error");
      });
    });
  } else {
    grid.innerHTML = '<p class="project-status">No projects yet. Add entries to <code>js/data.js</code>.</p>';
  }

  function setMenu(open) {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("menu-open", open);
  }
  menuButton.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      sessionStorage.setItem("portfolioScrollY", String(window.scrollY));
      target.scrollIntoView({behavior: reduceMotion ? "auto" : "smooth"});
      history.replaceState(null, "", link.getAttribute("href"));
    });
  });

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      railLinks.forEach(link => link.classList.toggle("is-active", link.dataset.section === entry.target.id));
    });
  }, {rootMargin: "-35% 0px -55%", threshold: 0});
  sections.forEach(section => sectionObserver.observe(section));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.12});
  document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

  window.addEventListener("load", () => {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    sectionIconsLoaded.then(iconsLoaded => {
      if (!iconsLoaded) return;
      gsap.registerPlugin(ScrollTrigger);
      const sawblade = document.querySelector(".hero__sawblade");
      if (!sawblade) throw new Error("Sawblade element could not be found.");
      const sawbladeSvg = sawblade.querySelector("svg");
      if (!sawbladeSvg) throw new Error("Sawblade SVG could not be found.");
      const viewBoxHeight = sawbladeSvg.viewBox.baseVal.height;
      const contentBounds = sawbladeSvg.getBBox();

      if (!viewBoxHeight || !contentBounds.height) {
        throw new Error("Sawblade SVG has no measurable geometry.");
      }

      gsap.to(sawblade, {
        y: () => {
          const scale = sawblade.offsetHeight / viewBoxHeight;
          const visualBottom = (contentBounds.y + contentBounds.height) * scale;
          return Math.max(0, hero.offsetHeight - sawblade.offsetTop - visualBottom - 24);
        },
        rotation: 360,
        transformOrigin: "50% 50%",
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: 0,
          end: () => hero.offsetHeight,
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    }).catch(error => {
      console.error("Hero sawblade animation could not be initialized.", error);
    });
  });

  window.addEventListener("pageshow", () => {
    const y = sessionStorage.getItem("portfolioScrollY");
    if (y && document.referrer.includes("/projects/")) window.scrollTo(0, Number(y));
    requestAnimationFrame(() => {
      updateHeroTitleOpacity();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  });
})();
