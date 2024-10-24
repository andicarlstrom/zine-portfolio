import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function applyAnimation(expanded, links) {
  links.querySelectorAll('li').forEach((link) => {
    link.className = 'animate';
    link.style.animationDelay = expanded ? `${link.dataset.trueDelay}s` : `${link.dataset.falseDelay}s`;
  });
}

function getFormattedPageName(pn) {
  switch (pn) {
    case 'aboutme':
      return 'about me';
    case 'mywork':
      return 'my work';
    case 'mystudio':
      return 'my studio';
    default:
      return '';
  }
}

function decorateBreadcrumb(isExpanded) {
  const path = window.location.pathname;
  const pathName = path.split('/')[1];
  const nav = document.querySelector('nav');

  const pageName = getFormattedPageName(pathName);
  const shouldDisplayBreadcrumb = !isExpanded && pageName.length > 0;

  let breadcrumb = document.querySelector('.nav-breadcrumb');
  if (!breadcrumb) {
    breadcrumb = document.createElement('div');
    breadcrumb.className = 'section nav-breadcrumb';

    const navLinksDiv = nav.querySelector('.nav-links');
    nav.insertBefore(breadcrumb, navLinksDiv);
  }

  if (shouldDisplayBreadcrumb) {
    breadcrumb.textContent = `/ ${pageName}`;
  } else {
    breadcrumb.textContent = '';
  }
}

function toggleMenu() {
  const nav = document.querySelector('nav');
  const navLinkWrapper = document.querySelector('.nav-links');
  const links = document.querySelector('.nav-links .default-content-wrapper');
  const expanded = nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', expanded);

  applyAnimation(expanded, links);

  const delay = expanded ? 250 : 900;
  setTimeout(() => {
    // if (window.location.pathname === '/') {
    //   window.location.href = '/aboutme';
    // }

    decorateBreadcrumb(expanded);
    navLinkWrapper.setAttribute('aria-expanded', expanded);
  }, delay);
}

function setupLinks() {
  const navBrand = document.querySelector('.nav-brand');
  navBrand.onclick = () => {
    window.location.href = '/aboutme';
  };

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

    item.addEventListener('click', (event) => {
      event.preventDefault();
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
    const ahref = item.querySelectorAll('a');

    ahref[1].style.display = 'none';

    if (isDesktop.matches === true) {
      item.addEventListener('mouseover', () => {
        ahref[0].style.display = 'none';
        ahref[1].style.display = 'inline';
      });

      item.addEventListener('mouseout', () => {
        ahref[0].style.display = 'inline';
        ahref[1].style.display = 'none';
      });
    } else {
      ahref[1].style.display = 'inline';
    }
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
  const isRoot = window.location.pathname === '/' ? 'true' : 'false';

  // decorate nav DOM
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.ariaExpanded = isRoot;

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

  // Setting navLinks aria-expanded property
  const navLinks = document.querySelector('.nav-links');
  navLinks.setAttribute('aria-expanded', isRoot);

  // After nav has been added to the DOM, add breadcrumb
  decorateBreadcrumb();

  // Sets up the navigation menu for onClick and navigation
  setupLinks();

  // Sets up hamburger icon to change color if a user hovers the last nav item.
  handleLastListItemHamburgerHover();

  // Sets up nav art hover styles
  setNavArtHoverStyles();
}
