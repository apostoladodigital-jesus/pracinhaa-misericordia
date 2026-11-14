// Controla a apresentação do vídeo e a mensagem em caso de falha no carregamento.
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('mainVideo');
  const videoFrame = video.parentElement;
  const player = videoFrame.parentElement;
  const source = video.querySelector('source');
  const placeholder = document.getElementById('videoPlaceholder');
  const playbackFeedback = document.getElementById('playbackFeedback');
  const title = document.getElementById('videoTitle');
  const description = document.getElementById('videoDescription');
  const playToggle = document.getElementById('playToggle');
  const playIcon = document.getElementById('playIcon');
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  const timeline = document.getElementById('videoTimeline');
  const currentTimeDisplay = document.getElementById('currentTime');
  const totalTimeDisplay = document.getElementById('totalTime');
  const playerStatus = document.getElementById('playerStatus');
  const videoSource = {
    src: 'assets/mensagem_unificada_otimizada.mp4',
    filename: 'mensagem_unificada_otimizada.mp4',
    description: 'Ser sinal de misericórdia em um mundo que clama por misericórdia.'
  };
  let videoEnded = false;
  let playWhenReady = false;
  let pendingSeek = 0;
  let isSeeking = false;
  let feedbackTimeout;

  const hidePlaybackFeedback = () => {
    window.clearTimeout(feedbackTimeout);
    playbackFeedback.classList.remove('visible');
  };

  const showPlaybackFeedback = (isPaused, persist = false) => {
    playbackFeedback.textContent = isPaused ? '▶' : '❚❚';
    playbackFeedback.classList.add('visible');
    window.clearTimeout(feedbackTimeout);
    if (!persist) {
      feedbackTimeout = window.setTimeout(hidePlaybackFeedback, 750);
    }
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const wholeSeconds = Math.floor(seconds);
    const hours = Math.floor(wholeSeconds / 3600);
    const minutes = Math.floor((wholeSeconds % 3600) / 60);
    const remainingSeconds = wholeSeconds % 60;
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');
    return hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
      : `${minutes}:${paddedSeconds}`;
  };

  const getTotalDuration = () => Number.isFinite(video.duration) ? video.duration : null;

  const getElapsedTime = () => video.currentTime || 0;

  const isFullscreen = () =>
    document.fullscreenElement === player ||
    document.webkitFullscreenElement === player ||
    document.documentElement.classList.contains('player-fullscreen');

  const updateFullscreenButton = () => {
    const active = isFullscreen();
    fullscreenToggle.setAttribute('aria-label', active ? 'Sair da tela cheia' : 'Ativar tela cheia');
    fullscreenToggle.title = active ? 'Sair da tela cheia' : 'Tela cheia';
  };

  const updateTimeline = (time = getElapsedTime()) => {
    const totalDuration = getTotalDuration();
    const max = totalDuration || 0;
    timeline.max = String(max);
    timeline.disabled = max <= 0;
    if (!isSeeking) timeline.value = String(Math.min(time, max));
    currentTimeDisplay.textContent = formatTime(isSeeking ? Number(timeline.value) : time);
    totalTimeDisplay.textContent = formatTime(totalDuration);
    timeline.setAttribute(
      'aria-valuetext',
      `${formatTime(isSeeking ? Number(timeline.value) : time)} de ${formatTime(totalDuration)}`
    );
    const progress = max > 0 ? (Number(timeline.value) / max) * 100 : 0;
    timeline.style.setProperty('--timeline-progress', `${progress}%`);
  };

  const seekToElapsed = (time, autoplay = !video.paused) => {
    if (!Number.isFinite(video.duration)) return;
    const target = Math.max(0, Math.min(time, video.duration));
    videoEnded = false;
    video.currentTime = target;
    if (autoplay && video.paused) {
      video.play().catch(() => {
        playerStatus.textContent = 'Não foi possível iniciar a reprodução.';
      });
    }
    updateTimeline(target);
  };

  const seekBy = (seconds) => {
    const currentTime = getElapsedTime();
    const targetTime = Math.max(0, currentTime + seconds);
    const totalDuration = getTotalDuration();
    if (Number.isFinite(totalDuration)) seekToElapsed(Math.min(targetTime, totalDuration));
  };

  const togglePlayback = () => {
    playerStatus.textContent = '';
    if (videoEnded) {
      videoEnded = false;
      video.currentTime = 0;
    }
    if (playWhenReady) {
      playWhenReady = false;
      video.pause();
    } else if (!video.paused) {
      video.pause();
    } else {
      video.play().catch(() => {
        playerStatus.textContent = 'Não foi possível iniciar a reprodução.';
      });
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen()) {
      if (document.fullscreenElement && document.exitFullscreen) {
        Promise.resolve(document.exitFullscreen.call(document))
          .then(updateFullscreenButton)
          .catch(() => {
            playerStatus.textContent = 'Não foi possível sair da tela cheia.';
          });
      } else {
        document.documentElement.classList.remove('player-fullscreen');
        updateFullscreenButton();
      }
      return;
    }

    const requestFullscreen = player.requestFullscreen || player.webkitRequestFullscreen;
    if (requestFullscreen) {
      Promise.resolve(requestFullscreen.call(player))
        .then(updateFullscreenButton)
        .catch(() => {
          playerStatus.textContent = 'Não foi possível ativar a tela cheia.';
        });
    } else {
      document.documentElement.classList.add('player-fullscreen');
      updateFullscreenButton();
    }
  };

  const loadVideo = (autoplay = false, startAt = 0, showPlaceholder = true) => {
    videoEnded = false;
    hidePlaybackFeedback();
    video.pause();
    playWhenReady = autoplay;
    pendingSeek = startAt;
    if (showPlaceholder) {
      placeholder.querySelector('strong').textContent = 'Carregando vídeo...';
      placeholder.querySelector('span').textContent = 'A reprodução começa assim que o vídeo estiver pronto.';
      placeholder.classList.remove('hidden');
    }
    video.preload = 'metadata';
    if (source.getAttribute('src') !== videoSource.src) {
      source.src = videoSource.src;
      video.load();
    }
    title.textContent = 'MENSAGEM ESPECIAL';
    description.textContent = videoSource.description;
    video.setAttribute('aria-label', 'Vídeo da mensagem especial');
    playerStatus.textContent = '';
    updateTimeline(startAt);
  };

  video.addEventListener('loadedmetadata', () => {
    if (pendingSeek > 0) {
      video.currentTime = Math.min(pendingSeek, video.duration);
      pendingSeek = 0;
    }
    updateTimeline();
  });

  video.addEventListener('canplay', () => {
    placeholder.classList.add('hidden');
    if (!playWhenReady) return;
    playWhenReady = false;
    video.play().catch(() => {
      playerStatus.textContent = 'Toque em reproduzir para continuar o vídeo.';
    });
  });

  video.addEventListener('play', () => {
    playIcon.textContent = '❚❚';
    playToggle.setAttribute('aria-label', 'Pausar');
    showPlaybackFeedback(false);
  });

  video.addEventListener('pause', () => {
    playIcon.textContent = '▶';
    playToggle.setAttribute('aria-label', 'Reproduzir');
    showPlaybackFeedback(true);
  });

  video.addEventListener('timeupdate', () => updateTimeline());

  video.addEventListener('ended', () => {
    videoEnded = true;
    playIcon.textContent = '▶';
    playToggle.setAttribute('aria-label', 'Reproduzir desde o início');
    showPlaybackFeedback(true, true);
    updateTimeline(getTotalDuration() || getElapsedTime());
  });

  video.addEventListener('error', () => {
    placeholder.querySelector('strong').textContent = 'Não foi possível carregar o vídeo';
    placeholder.querySelector('span').textContent =
      `Confira se o arquivo ${videoSource.filename} está na pasta assets.`;
    placeholder.classList.remove('hidden');
    playerStatus.textContent = 'Não foi possível carregar o vídeo.';
    playWhenReady = false;
  });

  playToggle.addEventListener('click', togglePlayback);
  fullscreenToggle.addEventListener('click', toggleFullscreen);

  videoFrame.addEventListener('click', (event) => {
    if (event.target.closest('.video-controls')) return;
    togglePlayback();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!isFullscreen()) return;
      event.preventDefault();
      toggleFullscreen();
      return;
    }

    const target = event.target;
    if (target instanceof Element && target.closest('input:not([type="range"]), select, textarea, [contenteditable="true"]')) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    switch (event.key.toLowerCase()) {
      case ' ':
      case 'k':
        event.preventDefault();
        togglePlayback();
        break;
      case 'arrowleft':
      case 'arrowright': {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        seekBy(direction * 5);
        break;
      }
      case 'm':
        video.muted = !video.muted;
        playerStatus.textContent = video.muted ? 'Som desativado.' : 'Som ativado.';
        break;
      case 'f':
        toggleFullscreen();
        break;
      default:
        break;
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenButton);
  document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
  video.addEventListener('webkitbeginfullscreen', updateFullscreenButton);
  video.addEventListener('webkitendfullscreen', updateFullscreenButton);

  timeline.addEventListener('input', () => {
    isSeeking = true;
    updateTimeline(Number(timeline.value));
  });

  timeline.addEventListener('change', () => {
    const targetTime = Number(timeline.value);
    isSeeking = false;
    seekToElapsed(targetTime, !video.paused || playWhenReady);
  });

  loadVideo();
});
