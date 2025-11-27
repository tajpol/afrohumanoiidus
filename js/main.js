// main.js — handles jPlayer playlist, UI interactions, video lightbox, and small utilities.
//
// Requirements: jQuery, jPlayer, jPlayerPlaylist (loaded on index.html).
// Place this file at /js/main.js

(function(){
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

    // wire playlist UI: clicking on list items plays track
    $('#playlist').on('click', 'li', function(){
      var index = $(this).index();
      playlist.play(index);
      $('#playlist li').removeClass('active');
      $(this).addClass('active');
      updateNowPlaying(index);
    });

    // update controls & now playing display
    function updateNowPlaying(index){
      var t = tracks[index] || {};
      $('#jp-now-playing').text(t.title || '');
      $('#jp-artist').text(t.artist || '');
      // track-art could be replaced with cover images if available
    }

    // listen to jPlayer events to update progress and times
    $('#jquery_jplayer_1').on($.jPlayer.event.timeupdate, function(e){
      var current = e.jPlayer.status.currentTime;
      var dur = e.jPlayer.status.duration;
      $('.jp-current-time').text(formatTime(current));
      $('.jp-duration').text(isFinite(dur) ? formatTime(dur) : '0:00');
      var percent = (e.jPlayer.status.currentPercentAbsolute || 0) + '%';
      $('.jp-play-bar').css('width', percent);
    });

    // next / prev UI
    $('.jp-next').on('click', function(){ playlist.next(); setActiveFromPlayer(); });
    $('.jp-prev').on('click', function(){ playlist.previous(); setActiveFromPlayer(); });
    $('.jp-play').on('click', function(){ $('#jquery_jplayer_1').jPlayer('play') });

    // sync active item when player changes
    $('#jquery_jplayer_1').on($.jPlayer.event.play, function(e){
      setActiveFromPlayer();
    });

    function setActiveFromPlayer(){
      var current = playlist.current;
      $('#playlist li').removeClass('active').eq(current).addClass('active');
      updateNowPlaying(current);
    }

    // volume control
    $('#volume-range').on('input change', function(){ $('#jquery_jplayer_1').jPlayer('volume', parseFloat(this.value)); });

    // helper: format seconds
    function formatTime(s){
      if (!isFinite(s)) return '0:00';
      s = Math.floor(s);
      var m = Math.floor(s/60);
      var sec = s%60;
      return m + ':' + (sec<10 ? '0'+sec : sec);
    }

    // Shuffle & Repeat simple toggles
    var shuffled = false;
    $('#shuffle').on('click', function(){
      shuffled = !shuffled;
      $(this).toggleClass('active', shuffled);
      // naive shuffle: randomize playlist order in memory and reinitialize
      if (shuffled){
        // shuffle tracks copy
        tracks = shuffleArray(tracks);
      } else {
        // reload original order by reading DOM again (simple)
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
      $(this).toggleClass('active', repeating);
      $('#jquery_jplayer_1').jPlayer(repeating ? 'option','loop', true : 'option','loop', false);
    });

    $('#download-all').on('click', function(e){
      e.preventDefault();
      alert('Direct downloads available individually. For full-archive requests, use the contact page.');
    });

    function shuffleArray(a){
      var b = a.slice();
      for (var i=b.length-1;i>0;i--){
        var j = Math.floor(Math.random()* (i+1));
        var tmp = b[i]; b[i]=b[j]; b[j]=tmp;
      }
      return b;
    }
  }

  // ---------- Video lightbox (video.html) ----------
  var videoGrid = document.getElementById('video-grid');
  var modal = document.getElementById('video-modal');
  var modalVideo = document.getElementById('modal-video');
  var videoClose = document.getElementById('video-close');

  if (videoGrid && modal && modalVideo) {
    videoGrid.addEventListener('click', function(e){
      var card = e.target.closest('.video-card');
      if (!card) return;
      var src = card.getAttribute('data-src');
      if (!src) return;
      modal.setAttribute('aria-hidden', 'false');
      modalVideo.src = src;
      modalVideo.play().catch(()=>{});
      document.body.style.overflow = 'hidden';
    });
    videoClose && videoClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e){ if (e.target === modal) closeModal(); });

    function closeModal(){
      modal.setAttribute('aria-hidden','true');
      modalVideo.pause();
      modalVideo.src = '';
      document.body.style.overflow = '';
    }
  }

  // small niceties: keyboard close
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') {
      var m = document.getElementById('video-modal');
      if (m && m.getAttribute('aria-hidden') === 'false') {
        m.setAttribute('aria-hidden','true');
        var v = document.getElementById('modal-video');
        if (v){ v.pause(); v.src=''; }
        document.body.style.overflow = '';
      }
    }
  });

})();
