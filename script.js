// Controla a apresentação do vídeo e a mensagem em caso de falha no carregamento.
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('mainVideo');
  const source = video.querySelector('source');
  const intro = document.getElementById('intro');
  const placeholder = document.getElementById('videoPlaceholder');

  const startLoadingVideo = () => {
    if (source.hasAttribute('src')) return;

    video.preload = 'metadata';
    source.src = source.dataset.src;
    video.load();
  };

  intro.addEventListener('animationend', (event) => {
    if (event.animationName === 'intro-exit') {
      startLoadingVideo();
    }
  });

  video.addEventListener('loadedmetadata', () => {
    placeholder.classList.add('hidden');
  });

  video.addEventListener('error', () => {
    placeholder.querySelector('strong').textContent = 'Não foi possível carregar o vídeo';
    placeholder.querySelector('span').textContent =
      'Confira se o arquivo VID-20261110-WA0062.mp4 está na pasta assets.';
    placeholder.classList.remove('hidden');
  });

  if (video.readyState >= 1 && video.duration) {
    placeholder.classList.add('hidden');
  }
});
