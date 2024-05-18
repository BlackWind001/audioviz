import initHelpButton from './initHelpButton';
import initSongSelector from './initSongSelector';
import initWaveformSelector from './initWaveformSelector';
import './style.css'

type ValidFFTSizeStringType = '2048' | '1024' | '512';

const audioElement = document.querySelector('audio');
const html = document.querySelector('html');
const canvas = document.querySelector('canvas');
const overlayControls = document.querySelector('.overlay-controls');
const canvasContext = canvas?.getContext('2d');
const FFT_SIZE_TO_RADIUS_MAP = {
  '2048': Math.floor(((2048 / 2) / Math.PI) - 80),
  '1024': Math.floor(((1024 / 2) / Math.PI) - 80),
  '512': Math.floor(((512 / 2) / Math.PI) - 80)
};
const FFT_SIZE_TO_WAVE_HEIGHT_MAP = {
  '2048': 0.5,
  '1024': 0.4,
  '512': 0.3
}
const MIN_FFT_SIZE = 512;

let WIDTH = 1280;
let HEIGHT = 320;
let FFT_SIZE = 2048;
let isNotAPlayPauseTouch = false;
let currentAudioURL = '';
let currentWaveform = 'sinewave'
let previousTouch: (undefined | Touch);
let audioContext: (undefined | null | AudioContext),
  gainNode: (undefined | GainNode),
  mediaElementNode: (undefined | MediaElementAudioSourceNode),
  analyserNode: (undefined | AnalyserNode),
  animationCancelId: (undefined | number);

if (audioElement) {
  audioElement.src = currentAudioURL;
}

/* SETUP */
const setupAudioContext = () => {

  if (!audioElement) {
    return null;
  }

  audioContext = new AudioContext();
  mediaElementNode = audioContext.createMediaElementSource(audioElement);
  gainNode = audioContext.createGain();
  analyserNode = audioContext.createAnalyser();

  gainNode.gain.value = 1;

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Do not forget to connect the node to a destination
  mediaElementNode.connect(analyserNode);
  analyserNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
};

/* ANIMATION OPERATIONS */

const drawSineWave = () => {
  if (!analyserNode || !canvas || !canvasContext) {
    return;
  }

  animationCancelId = requestAnimationFrame(drawSineWave);

  analyserNode.fftSize = FFT_SIZE;
  const byteTimeDomainData = new Uint8Array(analyserNode.fftSize);
  analyserNode.getByteTimeDomainData(byteTimeDomainData);

  canvasContext.fillStyle = 'black';
  canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
  canvasContext.strokeStyle = 'white';

  const xAxisSeparation = WIDTH / (analyserNode.fftSize);
  const START_Y = HEIGHT / 2 + 128;

  canvasContext.beginPath();
  // canvasContext.moveTo(0, START_Y);

  byteTimeDomainData.forEach((value, index) => {
    const x = index * xAxisSeparation;
    const y = START_Y - value;

    canvasContext.lineTo(x, y);
  });

  canvasContext.stroke();
};

// Parts of this code are from ChatGPT
// Specifically the logic to calculate the angle inside the for loop
// was AI generated. I was trying to use the Mid point circle algorithm
// but the AI used trigonometric method (this is supposed to be slower
// but I was blocked in my approach).
const drawCircle = () => {
  if (!canvas || !canvasContext || !analyserNode) {
    return;
  }

  animationCancelId = requestAnimationFrame(drawCircle);

  const numPoints = FFT_SIZE;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = FFT_SIZE_TO_RADIUS_MAP[('' + numPoints) as ValidFFTSizeStringType];
  const points = [];

  // Clear the screen for the current animation frame
  canvasContext.fillStyle = 'black';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Set the stroke style
  canvasContext.strokeStyle = 'white';

  analyserNode.fftSize = FFT_SIZE;
  const byteTimeDomainData = new Uint8Array(analyserNode.fftSize);
  analyserNode.getByteTimeDomainData(byteTimeDomainData);

  for (let i = 0; i < numPoints; i++) {
    // Calculating the angle of a given point by using formula:
    // (index/total) * 360
    // When index/total is 1 i.e index === total, then angle will be
    // 360 degrees.
    let angle = (i / numPoints) * 2 * Math.PI;

    // x = r * cos(theta)
    // Adding byteTimeDomainData[i] to r because we want the point to
    // represent the amplitude of the wave.
    let x = centerX + (radius + byteTimeDomainData[i]) * Math.cos(angle);
    // y = r * sin(theta)
    let y = centerY + (radius + byteTimeDomainData[i]) * Math.sin(angle);
    
    // Store the points in an array for later access
    points.push({x: x, y: y});
  }

  canvasContext.beginPath();
  for (let i = 0; i < points.length; i++) {
    canvasContext.lineTo(points[i].x, points[i].y);
  }
  canvasContext.stroke();
}

/* AUDIO OPERATIONS */

const playPauseAudio = () => {
  if (!audioElement) {
    return;
  }

  if (!audioContext) {
    setupAudioContext();
  }

  if (audioElement.paused) {
    audioElement.play();
    currentWaveform === 'sinewave' ? drawSineWave() : drawCircle();
  }
  else {
    audioElement.pause();
    animationCancelId !== undefined && cancelAnimationFrame(animationCancelId);
  }
}

const increaseVolume = (delta = 0.1) => {
  const gain = gainNode?.gain;

  if (gain === undefined) {
    return;
  }

  const newValue = gain.value + delta;
  (newValue < 2) && (gain.value = newValue);
}

const decreaseVolume = (delta = 0.1) => {
  const gain = gainNode?.gain;

  if (gain === undefined) {
    return;
  }

  const newValue = gain.value - delta;
  (newValue > 0) && (gain.value = newValue);
}

/* RESIZE HANDLER */
const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    if (entry.borderBoxSize) {
      WIDTH = entry.borderBoxSize[0].inlineSize;
      HEIGHT = entry.borderBoxSize[0].blockSize;

      if (canvas && canvasContext) {
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
      
        canvasContext.fillStyle = "black";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      }

      const bestFFTSizeBasedOnWidth = Object.entries(FFT_SIZE_TO_RADIUS_MAP).sort((a, b) => b[1] - a[1]).find(([key, value]) => {
        // @ts-ignore
        return 2 * (value + FFT_SIZE_TO_WAVE_HEIGHT_MAP[key] * 500) < WIDTH
      });

      console.log(bestFFTSizeBasedOnWidth)
      FFT_SIZE = bestFFTSizeBasedOnWidth ? Number.parseInt(bestFFTSizeBasedOnWidth[0]) : MIN_FFT_SIZE;

      currentWaveform === 'sinewave' ? drawSineWave() : drawCircle();

      return;
    }
  }
});


/* EVENT HANDLERS */
const handleKeyDown = (e: KeyboardEvent) => {
  const { key } = e;

  if (!audioContext && !(e.metaKey || e.altKey || e.ctrlKey)) {
    setupAudioContext();
  }

  switch (key) {
    case ' ': {
      playPauseAudio();
      break;
    }
    
    case 'ArrowUp': {
      increaseVolume();
      break;
    }

    case 'ArrowDown': {
      decreaseVolume();
      break;
    }
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  if (isNotAPlayPauseTouch) {

    // Cleanup
    isNotAPlayPauseTouch = false;
    previousTouch = undefined;
    return;
  }

  playPauseAudio();
}

const handleTouchMove = (e: TouchEvent) => {
  // This is a touch move and not just a touch.
  // i.e. the user wants to increase or decrease their volume.
  // Setting isNotAPlayPauseTouch will ensure that the music does not
  // stop/start playing.
  isNotAPlayPauseTouch = true;

  // There was no previous touch
  // The user has not indicated whether they want to increase or decrease
  // volume. So, we retun.
  if (!previousTouch) {
    return;
  }

  const currentTouch = e.changedTouches[0];
  
  if (currentTouch.clientY > previousTouch.clientY) {
    decreaseVolume();
  }
  else {
    increaseVolume();
  }

  previousTouch = currentTouch;
}

const handleTouchStart = (e: TouchEvent) => {
  previousTouch = e.changedTouches[0];
}

const songSelectorCallback = (url: string) => {
  if (!audioElement) {
    return;
  }

  audioElement.src = url;
  playPauseAudio();
}

const waveformSelectorCallback = (option: string) => {
  if (!audioElement) {
    return;
  }

  currentWaveform = option;

  typeof animationCancelId === 'number'  && cancelAnimationFrame(animationCancelId);
  
  currentWaveform === 'sinewave' ? drawSineWave() : drawCircle();
}

/* INITIALIZE OTHER UI ELEMENTS */
initSongSelector(songSelectorCallback);
initWaveformSelector(waveformSelectorCallback);
initHelpButton();

/* REGISTER EVENT LISTENERS */
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('touchstart', handleTouchStart);
window.addEventListener('touchend', handleTouchEnd);
window.addEventListener('touchmove', handleTouchMove);
overlayControls && overlayControls.addEventListener('touchend', (e) => { e.stopPropagation(); });
overlayControls && overlayControls.addEventListener('touchmove', (e) => { e.stopPropagation(); });
resizeObserver.observe(html as HTMLHtmlElement);


