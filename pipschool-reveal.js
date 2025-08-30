
/**
 * Pipschool reveal-on-scroll
 * Usage:
 *  1) Include pipschool-reveal.css in <head>
 *  2) Include this JS before </body>
 *  3) Option A (automatic): it will tag common elements for you.
 *     Option B (manual): add class="reveal-on-scroll" to any element you want to animate.
 */
(function () {
  // OPTIONAL: auto-select common content elements to animate
  var SELECTOR = [
    'section','article','header','footer','main','aside',
    '.card','.tile','.feature','.cta','.hero',
    'h1','h2','h3','h4','h5','h6',
    'p','ul','ol','li','img','picture','video','blockquote','figure'
  ].join(',');

  // Grab manual marks first, then union with auto-picked elements
  var manual = Array.prototype.slice.call(document.querySelectorAll('.reveal-on-scroll'));
  var auto = Array.prototype.slice.call(document.querySelectorAll(SELECTOR))
    .filter(function(el){ return !el.closest('[data-no-reveal]') && manual.indexOf(el) === -1; });

  var elements = manual.concat(auto);

  // Initial setup: ensure hidden + optional stagger
  elements.forEach(function(el, i) {
    if (!el.classList.contains('reveal-on-scroll')) el.classList.add('reveal-on-scroll');
    // Stagger within each parent to avoid huge page-long delays
    var siblings = el.parentElement ? el.parentElement.children.length : 1;
    var indexWithinParent = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    var delayMs = (indexWithinParent % 10) * 60; // 0–540ms within a group of siblings
    el.style.setProperty('--reveal-delay', delayMs + 'ms');
  });

  function reveal(el, observer){
    el.classList.add('is-visible');
    el.setAttribute('data-revealed', 'true');
    if (observer) observer.unobserve(el);
  }

  function inView(el, offset) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= vh * (1 - offset) && rect.bottom >= 0;
  }

  // Use IntersectionObserver when available
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          reveal(entry.target, obs);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

    elements.forEach(function(el){ observer.observe(el); });

    // Watch for dynamically inserted content (SPA/Next/React router changes etc.)
    var mo = new MutationObserver(function(muts){
      muts.forEach(function(m){
        m.addedNodes.forEach(function(node){
          if (node.nodeType !== 1) return;
          if (node.matches && (node.matches('.reveal-on-scroll') || node.matches(SELECTOR))) {
            if (!node.classList.contains('reveal-on-scroll')) node.classList.add('reveal-on-scroll');
            observer.observe(node);
          }
          if (node.querySelectorAll) {
            node.querySelectorAll('.reveal-on-scroll,' + SELECTOR).forEach(function(child){
              if (!child.classList.contains('reveal-on-scroll')) child.classList.add('reveal-on-scroll');
              observer.observe(child);
            });
          }
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } else {
    // Fallback: scroll/resize listeners (very broad support)
    function fallbackCheck(){
      elements.forEach(function(el){
        if (!el.hasAttribute('data-revealed') && inView(el, 0.1)) {
          reveal(el, null);
        }
      });
    }
    document.addEventListener('scroll', fallbackCheck, { passive: true });
    window.addEventListener('resize', fallbackCheck);
    window.addEventListener('load', fallbackCheck);
    fallbackCheck();
  }

  // Tiny console hint to help debug
  if (typeof console !== 'undefined' && console.debug) {
    console.debug('[Pipschool reveal] Initialized. Elements:', elements.length);
  }
})();
