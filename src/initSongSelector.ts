import playingInColor from '../public/playing-in-color.mp3';
import upliftPiano from '../public/inspiring-emotional-uplifting-piano.mp3';
import outfoxing from '../public/outfoxing.mp3';
import theWayHome from '../public/the-way-home.mp3';

export default function initSongSelector (cb: Function) {
  const LABEL_TO_AUDIO_URL_MAP = {
    'Playing in Color': playingInColor,
    'Inspirational Emotional Uplifting Piano': upliftPiano,
    'Outfoxing': outfoxing,
    'The Way Home': theWayHome
  };
  const songSelector = document.querySelector('.song-selector') as HTMLSelectElement;

  Object.keys(LABEL_TO_AUDIO_URL_MAP).forEach((key) => {
    const option = document.createElement('option');

    option.innerText = key;
    option.value = key;

    songSelector.appendChild(option);
  });
  
  songSelector.addEventListener('change', function (e) {
    e.stopPropagation();

    if (!e.target) {
      return;
    }

    this.blur();

    // @ts-ignore
    cb(LABEL_TO_AUDIO_URL_MAP[e.target.value])
  });
}
