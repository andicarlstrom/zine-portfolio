import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// // media query match that indicates mobile/tablet width
// const isDesktop = window.matchMedia('(min-width: 900px)');

function applyAnimation(expanded, links) {
  links.querySelectorAll('li').forEach((link) => {
    link.className = 'animate';
    link.style.animationDelay = expanded ? `${link.dataset.trueDelay}s` : `${link.dataset.falseDelay}s`;
  });
}

function toggleMenu() {
  const nav = document.querySelector('nav');
  const links = document.querySelector('.nav-links .default-content-wrapper');
  const expanded = nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', expanded);
  applyAnimation(expanded, links);
}

function setupLinks() {
  // Get all list items in the navigation menu
  const navItems = document.querySelectorAll('.nav-links ul li');

  const duration = 0.5;
  const step = duration / navItems.length;

  // Add click event listener to each list item
  navItems.forEach((item, i) => {
    item.dataset.trueDelay = step * (i + 1);
    item.dataset.falseDelay = duration - (step * i);

    if (window.location.pathname !== '/') {
      item.className = 'hide-menu';
    }

    item.addEventListener('click', () => {
      const link = item.querySelector('a');
      const url = link.getAttribute('href');

      toggleMenu();

      setTimeout(() => {
        window.location.href = url;
        // The timeout is delayed dynamically based on the total number of list items.
      }, ((duration + 0.2) + step) * 1000);
    });
  });
}

function decorateBreadcrumb() {
  const path = window.location.pathname;
  const pageName = path.split('/')[1];
  const nav = document.querySelector('nav');

  const breadcrumb = document.createElement('div');
  breadcrumb.textContent = pageName;
  breadcrumb.className = 'section nav-breadcrumb';

  const navLinksDiv = nav.querySelector('.nav-links');
  nav.insertBefore(breadcrumb, navLinksDiv);
}

function setupLogoFirstLiHoverStyles() {
  const firstLi = document.querySelector('.nav-links ul li:first-child');
  const logo = document.querySelector('.nav-brand');
  const spans = logo.querySelectorAll('span');

  spans[1].style.display = 'none';

  firstLi.addEventListener('mouseover', () => {
    spans[0].style.display = 'none';
    spans[1].style.display = 'inline';
  });
  firstLi.addEventListener('mouseout', () => {
    spans[0].style.display = 'inline';
    spans[1].style.display = 'none';
  });
}

function handleLastListItemHamburgerHover() {
  const lastLi = document.querySelector('.nav-links ul li:last-child');
  const hamburger = document.querySelector('.nav-hamburger');

  lastLi.addEventListener('mouseover', () => hamburger.classList.add('hovered'));
  lastLi.addEventListener('mouseout', () => hamburger.classList.remove('hovered'));
}

function setNavArtHoverStyles() {
  const navItems = document.querySelectorAll('.nav-links ul li');

  // Add event listener to each list item
  navItems.forEach((item) => {
    const spans = item.querySelectorAll('span');
    // Hide second icon span. We only want one icon displaying at a time.
    spans[1].style.display = 'none';

    item.addEventListener('mouseover', () => {
      spans[0].style.display = 'none';
      spans[1].style.display = 'inline';
    });

    item.addEventListener('mouseout', () => {
      spans[0].style.display = 'inline';
      spans[1].style.display = 'none';
    });
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.ariaExpanded = window.location.pathname === '/' ? 'true' : 'false';

  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // The classes for the sections that the user adds to the google doc
  const classes = ['brand', 'links'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // hamburger
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
  </button>`;
  hamburger.addEventListener('click', () => toggleMenu());
  nav.append(hamburger);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // After nav has been added to the DOM, add breadcrumb
  decorateBreadcrumb();

  // Sets up the navigation menu for onClick and navigation
  setupLinks();

  // Sets up hamburger icon to change color if a user hovers the last nav item.
  handleLastListItemHamburgerHover();

  // Sets up nav art hover styles
  setNavArtHoverStyles();

  // Sets up logo color changes on hover of first nav item
  setupLogoFirstLiHoverStyles();
}
