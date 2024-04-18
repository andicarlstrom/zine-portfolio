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

function handleLastListItemHamburgerHover() {
  const lastLi = document.querySelector('.nav-links ul li:last-child');
  const hamburger = document.querySelector('.nav-hamburger');

  lastLi.addEventListener('mouseover', () => hamburger.classList.add('hovered'));
  lastLi.addEventListener('mouseout', () => hamburger.classList.remove('hovered'));
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

  // Call the function to set up the navigation menu
  setupLinks();

  // Sets up hamburger icon to change color if a user hovers the last nav item.
  handleLastListItemHamburgerHover();
}
