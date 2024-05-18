import playingInColor from '../public/playing-in-color.mp3';
import upliftPiano from '../public/inspiring-emotional-uplifting-piano.mp3';
import outfoxing from '../public/outfoxing.mp3';
import theWayHome from '../public/the-way-home.mp3';

type SelectElementChangeEvent = Event & {
  target: EventTarget | null;
}

export default function initSongSelector (cb: Function) {
  const LABEL_TO_AUDIO_URL_MAP = {
    'Playing in Color': playingInColor,
    'Inspirational Emotional Uplifting Piano': upliftPiano,
    'Outfoxing': outfoxing,
    'The Way Home': theWayHome
  };
  const songSelector = document.querySelector('.song-selector') as HTMLSelectElement;
  
  const handlePropogation = (e: TouchEvent) => {
    e.stopPropagation();
  }

  const handleChange = (e: SelectElementChangeEvent) => {
    e.stopPropagation();

    if (!e.target) {
      return;
    }

    // @ts-ignore
    cb(LABEL_TO_AUDIO_URL_MAP[e.target.value])
  }

  Object.keys(LABEL_TO_AUDIO_URL_MAP).forEach((key) => {
    const option = document.createElement('option');

    option.innerText = key;
    option.value = key;

    songSelector.appendChild(option);
  });
  
  songSelector.addEventListener('touchend', handlePropogation);
  songSelector.addEventListener('change', handleChange);
}
