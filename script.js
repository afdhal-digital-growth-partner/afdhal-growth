'use strict';
const pages = [...document.querySelectorAll('.page')];
const labels = ['The introduction', 'The opportunity', 'The services', 'The work', 'Your partner', 'Let’s talk'];
const book = document.getElementById('book');
const previous = document.getElementById('previous');
const next = document.getElementById('next');
const dots = document.querySelector('.dots');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let current = Math.max(0, pages.findIndex(page => '#' + page.id === location.hash));
let turning = false;
pages.forEach((page, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', 'Page ' + (index + 1) + ', ' + labels[index]);
  dot.addEventListener('click', () => turnTo(index));
  dots.append(dot);
});
function render() {
  pages.forEach((page, index) => {
    page.hidden = index !== current;
    page.inert = index !== current;
  });
  [...dots.children].forEach((dot, index) => dot.setAttribute('aria-current', String(index === current)));
  previous.disabled = current === 0;
  next.disabled = current === pages.length - 1;
  document.getElementById('page-label').textContent = labels[current] + ' · ' + (current + 1) + ' / ' + pages.length;
}
async function turnTo(index) {
  if (turning || index === current || index < 0 || index >= pages.length) return;
  turning = true;
  const outgoing = pages[current];
  const forward = index > current;
  const focusWasInside = outgoing.contains(document.activeElement);
  if (!reducedMotion.matches) {
    outgoing.style.transformOrigin = forward ? 'left center' : 'right center';
    await outgoing.animate([
      { transform: 'rotateY(0deg)', opacity: 1 },
      { transform: 'rotateY(' + (forward ? '-80' : '80') + 'deg)', opacity: .2 }
    ], { duration: 300, easing: 'ease-in' }).finished;
  }
  current = index;
  render();
  const incoming = pages[current];
  incoming.scrollTop = 0;
  if (!reducedMotion.matches) {
    incoming.style.transformOrigin = forward ? 'right center' : 'left center';
    await incoming.animate([
      { transform: 'rotateY(' + (forward ? '65' : '-65') + 'deg)', opacity: .2 },
      { transform: 'rotateY(0deg)', opacity: 1 }
    ], { duration: 350, easing: 'ease-out' }).finished;
  }
  if (focusWasInside) {
    const heading = incoming.querySelector('h1, h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  history.replaceState(null, '', '#' + incoming.id);
  turning = false;
}
previous.addEventListener('click', () => turnTo(current - 1));
next.addEventListener('click', () => turnTo(current + 1));
document.querySelector('[data-next]').addEventListener('click', () => turnTo(1));
document.querySelector('.wordmark').addEventListener('click', event => { event.preventDefault(); turnTo(0); });
document.addEventListener('keydown', event => {
  if (event.target.closest('a, button, input, textarea, select')) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); turnTo(current + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); turnTo(current - 1); }
});
let startX = 0;
let startY = 0;
book.addEventListener('touchstart', event => {
  startX = event.changedTouches[0].clientX;
  startY = event.changedTouches[0].clientY;
}, { passive: true });
book.addEventListener('touchend', event => {
  const x = event.changedTouches[0].clientX - startX;
  const y = event.changedTouches[0].clientY - startY;
  if (Math.abs(x) > 70 && Math.abs(x) > Math.abs(y) * 1.5) turnTo(current + (x < 0 ? 1 : -1));
}, { passive: true });
const services = {
  meta: ['FACEBOOK & INSTAGRAM', 'Introduce your work to potential clients.', 'Campaigns built around your studio’s location, project preferences and portfolio, with enquiry tracking and ongoing review.', 'Meta Ads'],
  google: ['GOOGLE SEARCH', 'Be there when someone searches.', 'Reach people searching for relevant interior design or architectural services. Align search themes, locations and ad copy with your studio, then track enquiries.', 'Google Ads'],
  website: ['YOUR OWN PORTFOLIO WEBSITE', 'Give your work a home online.', 'For studios without a website, I build a mobile-friendly portfolio with clear services, project information and simple enquiry options.', 'a website'],
  presence: ['VISIBILITY & CREDIBILITY', 'Make your studio easier to discover.', 'Review your digital presence and agree on useful improvements, including business information, Google Business Profile and clearer contact paths.', 'digital presence']
};
const serviceTabs = [...document.querySelectorAll('[data-service]')];
function selectService(button) {
  const value = services[button.dataset.service];
  serviceTabs.forEach(tab => { tab.setAttribute('aria-selected', String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
  document.getElementById('service-panel').setAttribute('aria-labelledby', button.id);
  document.getElementById('service-kicker').textContent = value[0];
  document.getElementById('service-title').textContent = value[1];
  document.getElementById('service-description').textContent = value[2];
  const link = document.getElementById('service-contact');
  link.textContent = 'Discuss ' + value[3] + ' →';
  link.href = 'https://wa.me/919380058735?text=' + encodeURIComponent('Hi Afdhal, I explored your brochure and would like to discuss ' + value[3] + ' for my studio.');
}
serviceTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectService(button));
  button.addEventListener('keydown', event => {
    let target = index;
    if (event.key === 'ArrowRight') target = (index + 1) % serviceTabs.length;
    else if (event.key === 'ArrowLeft') target = (index + serviceTabs.length - 1) % serviceTabs.length;
    else return;
    event.preventDefault();
    serviceTabs[target].focus();
    selectService(serviceTabs[target]);
  });
});
selectService(serviceTabs[0]);
render();
