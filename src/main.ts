import './style.css'
import audioURL from '../public/playing-in-color.mp3';

const audioElement = document.querySelector('audio');
const html = document.querySelector('html');
const canvas = document.querySelector('canvas');
const canvasContext = canvas?.getContext('2d');
const FFT_SIZE = 2048;


let WIDTH = 1280;
let HEIGHT = 320;
let isNotAPlayPauseTouch = false;
let previousTouch: (undefined | Touch);
let audioContext: (undefined | null | AudioContext),
  gainNode: (undefined | GainNode),
  mediaElementNode: (undefined | MediaElementAudioSourceNode),
  analyserNode: (undefined | AnalyserNode);
let logCancelId: (undefined | number),
  animationCancelId: (undefined | number),
  globalSet = new Set();

if (audioElement) {
  audioElement.src = audioURL;
}

const logByteTimeDomainData = () => {
  if (!analyserNode) {
    return;
  }

  /**
   * Explanation of FFT:
   * The FFT size is the number of samples used in the Fast Fourier Transform algorithm, which converts a time-domain
   * signal into its frequency-domain representation.
   * In summary, sample rate determines how frequently the audio signal is sampled, window size determines the size of the chunks
   * of the signal analyzed at a time, and FFT size determines the frequency resolution of the resulting spectrum.
   */
  analyserNode.fftSize = 2048;
  const byteTimeDomainData = new Uint8Array(analyserNode.fftSize);
  analyserNode.getByteTimeDomainData(byteTimeDomainData);

  const newValue = Array.from(new Set(byteTimeDomainData))
  console.log('sample-rate:', audioContext?.sampleRate);
  // @ts-ignore
  console.log('byteTimeDomainData', byteTimeDomainData, globalSet.add(...newValue));


  logCancelId = requestAnimationFrame(logByteTimeDomainData);
};

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
      return;
    }
  }
});

const drawByteTimeDomainData = () => {
  if (!analyserNode || !canvas || !canvasContext) {
    return;
  }

  animationCancelId = requestAnimationFrame(drawByteTimeDomainData);

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

const setupAudioContext = () => {

  if (!audioElement) {
    return null;
  }

  audioContext = new AudioContext();
  mediaElementNode = audioContext.createMediaElementSource(audioElement);
  gainNode = audioContext.createGain();
  analyserNode = audioContext.createAnalyser();

  gainNode.gain.value = 0.2;

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Do not forget to connect the node to a destination
  mediaElementNode.connect(analyserNode);
  analyserNode.connect(gainNode);
  gainNode.connect(audioContext.destination);
};

const playPauseAudio = () => {
  if (!audioElement) {
    return;
  }

  if (!audioContext) {
    setupAudioContext();
  }

  if (audioElement.paused) {
    audioElement.play();
    // logByteTimeDomainData();
    drawByteTimeDomainData();
  }
  else {
    audioElement.pause();
    logCancelId !== undefined && cancelAnimationFrame(logCancelId);
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

  const newValue = gain.value - 0.1;
  (newValue > 0) && (gain.value = newValue);
}

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

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('touchstart', handleTouchStart);
window.addEventListener('touchend', handleTouchEnd);
window.addEventListener('touchmove', handleTouchMove);
resizeObserver.observe(html as HTMLHtmlElement);

