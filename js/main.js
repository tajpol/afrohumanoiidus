// main.js — Enhanced Y2K UI with smooth interactions + Dark/Light Mode Toggle
//
// Requirements: jQuery, jPlayer, jPlayerPlaylist (loaded on index.html).
// Place this file at /js/main.js

(function(){
  'use strict';
  
  // Add smooth scroll behavior
  document.documentElement.style.scrollBehavior = 'smooth';

  // ---------- Dark/Light Mode Toggle ----------
  // This runs IMMEDIATELY when the script loads
  (function initTheme() {
    // Get saved theme or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    console.log('Initializing theme:', savedTheme); // Debug log
    
    // Apply theme immediately to prevent flash
    if (savedTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    // Update button when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        updateToggleButton(savedTheme);
        attachToggleListener();
      });
    } else {
      updateToggleButton(savedTheme);
      attachToggleListener();
    }
  })();
  
  function attachToggleListener() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
      console.warn('Theme toggle button not found');
      return;
    }
    
    console.log('Theme toggle button found and listener attached');
    
    themeToggle.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Get current theme
      const isDark = document.body.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      
      console.log('Toggling theme from', isDark ? 'dark' : 'light', 'to', newTheme);
      
      // Apply new theme
      if (newTheme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
      
      // Save to localStorage
      localStorage.setItem('theme', newTheme);
      
      // Update button
      updateToggleButton(newTheme);
      
      // Add visual feedback
      this.style.transform = 'scale(0.9) rotate(180deg)';
      setTimeout(() => {
        this.style.transform = '';
      }, 300);
      
      console.log('Theme changed to:', newTheme);
    });
  }
  
  function updateToggleButton(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    if (theme === 'dark') {
      themeToggle.innerHTML = '☀';
      themeToggle.setAttribute('aria-label', 'Switch to light mode');
      themeToggle.setAttribute('title', 'Switch to light mode');
    } else {
      themeToggle.innerHTML = '☾';
      themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      themeToggle.setAttribute('title', 'Switch to dark mode');
    }
  }

  // Enhanced button feedback helper
  function addButtonFeedback(selector) {
    $(selector).on('mousedown', function(){
      $(this).css('transform', 'scale(0.95)');
    }).on('mouseup mouseleave', function(){
      $(this).css('transform', '');
    });
  }

  // ---------- Audio player (index.html) ----------
  if (window.jQuery && $('#jquery_jplayer_1').length) {
    // build playlist from DOM list
    var tracks = [];
    $('#playlist li').each(function(){
      var $t = $(this);
      tracks.push({
        title: $t.data('title') || $t.text(),
        artist: $t.data('artist') || 'afrohumanoiidus',
        mp3: $t.data('mp3'),
        oga: $t.data('oga') || null
      });
    });

    // create jPlayer playlist
    var playlist = new jPlayerPlaylist({
      jPlayer: "#jquery_jplayer_1",
      cssSelectorAncestor: "#jp_container_1"
    }, tracks.map(function(t){ return { title: t.title, artist: t.artist, mp3: t.mp3 }; }), {
      swfPath: "/js",
      supplied: "mp3",
      wmode: "window",
      useStateClassSkin: true,
      autoBlur: false,
      smoothPlayBar: true,
      keyEnabled: true
    });

    // Enhanced playlist UI with smooth transitions
    $('#playlist').on('click', 'li', function(){
      var $this = $(this);
      var index = $this.index();
      
      // Smooth active state transition
      $('#playlist li').removeClass('active');
      $this.addClass('active');
      
      // Add ripple effect
      createRipple($this[0], event);
      
      // Smooth play transition
      setTimeout(function(){
        playlist.play(index);
        updateNowPlaying(index);
      }, 100);
    });

    // Ripple effect for clicks
    function createRipple(element, e) {
      var $element = $(element);
      var ripple = $('<span class="ripple"></span>');
      var rect = element.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      
      ripple.css({
        position: 'absolute',
        left: x + 'px',
        top: y + 'px',
        width: '0',
        height: '0',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.3)',
        transform: 'translate(-50%, -50%)',
        animation: 'ripple-effect 0.6s ease-out',
        pointerEvents: 'none'
      });
      
      $element.css('position', 'relative').css('overflow', 'hidden').append(ripple);
      setTimeout(function(){ ripple.remove(); }, 600);
    }

    // Add ripple animation to CSS dynamically
    if (!document.getElementById('ripple-style')) {
      var style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple-effect {
          to {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        
        .controls button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .controls button:active {
          transform: translateY(-1px) scale(0.97);
        }
        
        #playlist li {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .jp-play-bar {
          transition: width 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        .panel {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .now-playing, .artist {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }

    // update controls & now playing display with smooth fade
    function updateNowPlaying(index){
      var t = tracks[index] || {};
      var $nowPlaying = $('#jp-now-playing');
      var $artist = $('#jp-artist');
      
      // Fade out
      $nowPlaying.css({opacity: 0, transform: 'translateY(-5px)'});
      $artist.css({opacity: 0, transform: 'translateY(-5px)'});
      
      // Update text and fade in
      setTimeout(function(){
        $nowPlaying.text(t.title || '');
        $artist.text(t.artist || '');
        $nowPlaying.css({opacity: 1, transform: 'translateY(0)'});
        $artist.css({opacity: 1, transform: 'translateY(0)'});
      }, 150);
    }

    // Smooth progress bar updates
    var lastPercent = 0;
    $('#jquery_jplayer_1').on($.jPlayer.event.timeupdate, function(e){
      var current = e.jPlayer.status.currentTime;
      var dur = e.jPlayer.status.duration;
      $('.jp-current-time').text(formatTime(current));
      $('.jp-duration').text(isFinite(dur) ? formatTime(dur) : '0:00');
      
      var percent = e.jPlayer.status.currentPercentAbsolute || 0;
      // Smooth interpolation for progress bar
      if (Math.abs(percent - lastPercent) > 0.1) {
        $('.jp-play-bar').css('width', percent + '%');
        lastPercent = percent;
      }
    });

    // Enhanced control buttons with feedback
    $('.jp-next').on('click', function(){ 
      $(this).addClass('clicked');
      setTimeout(()=> $(this).removeClass('clicked'), 200);
      playlist.next(); 
      setActiveFromPlayer(); 
    });
    
    $('.jp-prev').on('click', function(){ 
      $(this).addClass('clicked');
      setTimeout(()=> $(this).removeClass('clicked'), 200);
      playlist.previous(); 
      setActiveFromPlayer(); 
    });
    
    $('.jp-play').on('click', function(){ 
      $(this).addClass('clicked');
      setTimeout(()=> $(this).removeClass('clicked'), 200);
      $('#jquery_jplayer_1').jPlayer('play');
    });

    // sync active item when player changes with smooth scroll
    $('#jquery_jplayer_1').on($.jPlayer.event.play, function(e){
      setActiveFromPlayer();
    });

    function setActiveFromPlayer(){
      var current = playlist.current;
      var $items = $('#playlist li');
      $items.removeClass('active');
      var $active = $items.eq(current).addClass('active');
      
      // Smooth scroll to active item
      if ($active.length) {
        var container = $('#playlist').parent();
        var scrollTo = $active.position().top + container.scrollTop() - container.height()/2 + $active.height()/2;
        container.animate({scrollTop: scrollTo}, 400, 'swing');
      }
      
      updateNowPlaying(current);
    }

    // Enhanced volume control with visual feedback
    $('#volume-range').on('input change', function(){ 
      var vol = parseFloat(this.value);
      $('#jquery_jplayer_1').jPlayer('volume', vol);
      
      // Visual feedback
      $(this).css('background', 'linear-gradient(to right, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.3) ' + (vol * 100) + '%, rgba(255,255,255,0.05) ' + (vol * 100) + '%, rgba(255,255,255,0.05) 100%)');
    });

    // helper: format seconds
    function formatTime(s){
      if (!isFinite(s)) return '0:00';
      s = Math.floor(s);
      var m = Math.floor(s/60);
      var sec = s%60;
      return m + ':' + (sec<10 ? '0'+sec : sec);
    }

    // Enhanced Shuffle & Repeat with smooth toggles
    var shuffled = false;
    $('#shuffle').on('click', function(){
      shuffled = !shuffled;
      var $this = $(this);
      $this.toggleClass('active', shuffled);
      
      // Visual feedback
      $this.css('transform', 'scale(1.1) rotate(180deg)');
      setTimeout(()=> $this.css('transform', ''), 300);
      
      if (shuffled){
        tracks = shuffleArray(tracks);
      } else {
        tracks = [];
        $('#playlist li').each(function(){
          var $t = $(this);
          tracks.push({
            title: $t.data('title'),
            artist: $t.data('artist'),
            mp3: $t.data('mp3')
          });
        });
      }
      playlist.setPlaylist(tracks.map(function(t){ return {title:t.title, artist:t.artist, mp3:t.mp3}; }));
      playlist.play(0);
      setActiveFromPlayer();
    });

    var repeating = false;
    $('#repeat').on('click', function(){
      repeating = !repeating;
      var $this = $(this);
      $this.toggleClass('active', repeating);
      
      // Visual feedback
      $this.css('transform', 'scale(1.1) rotate(360deg)');
      setTimeout(()=> $this.css('transform', ''), 300);
      
      $('#jquery_jplayer_1').jPlayer(repeating ? 'option','loop', true : 'option','loop', false);
    });

    $('#download-all').on('click', function(e){
      e.preventDefault();
      
      // Better user feedback
      var $this = $(this);
      var originalText = $this.text();
      $this.text('Check contact page for full archives →').css('opacity', '0.7');
      setTimeout(function(){
        $this.text(originalText).css('opacity', '1');
      }, 3000);
    });

    function shuffleArray(a){
      var b = a.slice();
      for (var i=b.length-1;i>0;i--){
        var j = Math.floor(Math.random()* (i+1));
        var tmp = b[i]; b[i]=b[j]; b[j]=tmp;
      }
      return b;
    }

    // Add button feedback to all controls
    addButtonFeedback('.controls button');
  }

  // ---------- Enhanced Video lightbox (video.html) ----------
  var videoGrid = document.getElementById('video-grid');
  var modal = document.getElementById('video-modal');
  var modalVideo = document.getElementById('modal-video');
  var videoClose = document.getElementById('video-close');

  if (videoGrid && modal && modalVideo) {
    // Add smooth fade-in for modal
    modal.style.transition = 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    
    videoGrid.addEventListener('click', function(e){
      var card = e.target.closest('.video-card');
      if (!card) return;
      
      // Add scale effect to clicked card
      card.style.transform = 'scale(0.95)';
      setTimeout(()=> card.style.transform = '', 200);
      
      var src = card.getAttribute('data-src');
      if (!src) return;
      
      // Smooth modal open
      modal.style.opacity = '0';
      modal.setAttribute('aria-hidden', 'false');
      modal.style.display = 'flex';
      
      requestAnimationFrame(function(){
        modal.style.opacity = '1';
      });
      
      // Delay video load slightly for smooth transition
      setTimeout(function(){
        modalVideo.src = src;
        modalVideo.play().catch(()=>{});
      }, 150);
      
      document.body.style.overflow = 'hidden';
    });
    
    videoClose && videoClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ 
      if (e.target === modal) closeModal(); 
    });

    function closeModal(){
      // Smooth modal close
      modal.style.opacity = '0';
      modalVideo.pause();
      
      setTimeout(function(){
        modal.setAttribute('aria-hidden','true');
        modal.style.display = 'none';
        modalVideo.src = '';
        document.body.style.overflow = '';
      }, 300);
    }

    // Enhanced video card hover effects
    var cards = videoGrid.querySelectorAll('.video-card');
    cards.forEach(function(card){
      card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease';
      
      card.addEventListener('mouseenter', function(){
        this.style.transform = 'translateY(-4px) scale(1.02)';
        this.style.boxShadow = '0 12px 40px rgba(255,255,255,0.15)';
      });
      
      card.addEventListener('mouseleave', function(){
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  }

  // Enhanced keyboard controls
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      var m = document.getElementById('video-modal');
      if (m && m.getAttribute('aria-hidden') === 'false') {
        m.style.opacity = '0';
        var v = document.getElementById('modal-video');
        if (v){ v.pause(); }
        
        setTimeout(function(){
          m.setAttribute('aria-hidden','true');
          m.style.display = 'none';
          if (v) v.src='';
          document.body.style.overflow = '';
        }, 300);
      }
    }
  });

  // Add smooth hover effects to nav links
  var navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(function(link){
    link.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
  });

  // Smooth scroll to top on logo click
  var brand = document.querySelector('.brand');
  if (brand) {
    brand.addEventListener('click', function(e){
      if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        e.preventDefault();
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    });
  }

  // Add subtle parallax effect to panels on scroll (optional Y2K enhancement)
  var panels = document.querySelectorAll('.panel');
  var lastScrollTop = 0;
  
  function handleScroll() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var delta = (scrollTop - lastScrollTop) * 0.02;
    
    panels.forEach(function(panel, index){
      var offset = delta * (index % 2 === 0 ? 1 : -1);
      panel.style.transform = 'translateY(' + offset + 'px)';
    });
    
    lastScrollTop = scrollTop;
  }
  
  // Throttle scroll handler for performance
  var scrollTimeout;
  window.addEventListener('scroll', function(){
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(function(){
      handleScroll();
      scrollTimeout = null;
    }, 16); // ~60fps
  });

  // Add loading state for any async operations
  window.showLoader = function() {
    var loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:9999;color:#fff;font-weight:600;';
    loader.textContent = 'Loading...';
    document.body.appendChild(loader);
  };

  window.hideLoader = function() {
    var loader = document.getElementById('global-loader');
    if (loader) loader.remove();
  };

  console.log('✨ Y2K UI Enhanced - Smooth interactions loaded');
})();
