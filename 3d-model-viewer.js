/*!
 * 3d-model-viewer: turn <div data-glb="model.glb"> into an interactive 3D viewer.
 * Uses Google's model-viewer (Apache 2.0). MIT License.
 */
(function () {
  'use strict';

  var MODEL_VIEWER_URL = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js';

  // data-* attribute on the div  →  model-viewer attribute, with defaults.
  var OPTIONS = {
    alt:           { attr: 'alt',                 fallback: '3D model' },
    orbit:         { attr: 'camera-orbit',        fallback: '35deg 68deg 58%' },
    rotationSpeed: { attr: 'rotation-per-second', fallback: '18deg' },
    shadow:        { attr: 'shadow-intensity',    fallback: '0.6' },
    poster:        { attr: 'poster',              fallback: null },
    exposure:      { attr: 'exposure',            fallback: null }
  };

  function loadLibrary() {
    if (window.customElements && customElements.get('model-viewer')) return;
    if (document.querySelector('script[data-3d-model-viewer-lib]')) return;
    var s = document.createElement('script');
    s.type = 'module';
    s.src = MODEL_VIEWER_URL;
    s.setAttribute('data-3d-model-viewer-lib', '');
    document.head.appendChild(s);
  }

  function isOff(value) {
    return /^(false|no|off|0)$/i.test(String(value || '').trim());
  }

  function render(el) {
    var src = el.getAttribute('data-glb');
    if (!src) return;

    var mv = el.querySelector(':scope > model-viewer');
    if (mv && mv.getAttribute('src') === src) return;

    if (!mv) {
      mv = document.createElement('model-viewer');
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('environment-image', 'neutral');
      // Inside a hidden pop-up, the model downloads only when it becomes visible.
      mv.setAttribute('loading', 'lazy');
      mv.style.cssText = 'display:block;width:100%;height:100%;min-height:inherit;background:transparent;';
      el.appendChild(mv);
      // Give the div a height if the page didn't. Computed style still works while a pop-up is hidden.
      var cs = getComputedStyle(el);
      if ((cs.height === 'auto' || cs.height === '0px') && (cs.minHeight === 'auto' || cs.minHeight === '0px')) {
        el.style.height = '400px';
      }
    }

    Object.keys(OPTIONS).forEach(function (key) {
      var value = el.dataset[key] != null ? el.dataset[key] : OPTIONS[key].fallback;
      if (value == null || value === '') mv.removeAttribute(OPTIONS[key].attr);
      else mv.setAttribute(OPTIONS[key].attr, value);
    });

    if (isOff(el.dataset.autoRotate)) mv.removeAttribute('auto-rotate');
    else mv.setAttribute('auto-rotate', '');

    mv.setAttribute('src', src);
    el.classList.add('model-viewer-embed');
  }

  function renderAll(root) {
    var scope = root && root.querySelectorAll ? root : document;
    if (scope !== document && scope.matches && scope.matches('[data-glb]')) render(scope);
    Array.prototype.forEach.call(scope.querySelectorAll('[data-glb]'), render);
  }

  function start() {
    loadLibrary();
    renderAll(document);

    // Pick up divs added later (pop-up builders, page builders) and src changes.
    new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        if (m.type === 'attributes') render(m.target);
        else Array.prototype.forEach.call(m.addedNodes, function (n) {
          if (n.nodeType === 1) renderAll(n);
        });
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-glb']
    });
  }

  window.ModelViewerEmbed = { render: render, refresh: function () { renderAll(document); } };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
