// js/theme-toggle.js
// Site-wide theme toggle module. Include on every page (before </body>).

(function(){
  'use strict';

  function safeGet(key){
    try { return localStorage.getItem(key); } catch(e){ return null; }
  }
  function safeSet(key, val){
    try { localStorage.setItem(key, val); } catch(e){}
  }

  function applyTheme(theme){
    document.documentElement.classList.remove('theme-light','theme-dark');
    document.documentElement.classList.add('theme-' + theme);
  }

  function getStoredOrSystem(){
    var stored = safeGet('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch(e){
      return 'light';
    }
  }

  function updateToggleButton(theme){
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.innerHTML = (theme === 'dark') ? '<span class="icon">☀︎</span> Light' : '<span class="icon">☾</span> Dark';
  }

  function toggleTheme(){
    var current = document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light';
    var next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    safeSet('theme', next);
    updateToggleButton(next);
  }

  function init(){
    var initial = getStoredOrSystem();
    applyTheme(initial);
    updateToggleButton(initial);

    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', function(e){ e.preventDefault(); toggleTheme(); });

    try {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', function(ev){
        var stored = safeGet('theme');
        if (stored !== 'light' && stored !== 'dark') {
          var newTheme = ev.matches ? 'dark' : 'light';
          applyTheme(newTheme);
          updateToggleButton(newTheme);
        }
      });
    } catch(e){}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
