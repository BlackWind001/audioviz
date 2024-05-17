import './style.css'
import audioURL from '../public/outfoxing.mp3';

const audioElement = document.querySelector('audio');
const buttonElement = document.querySelector('.play-pause') as HTMLButtonElement;
const canvas = document.querySelector('canvas');
const canvasContext = canvas?.getContext('2d');
let WIDTH = 1280;
let HEIGHT = 320;
let audioContext: (undefined | null | AudioContext),
  gainNode: (undefined | GainNode),
  mediaElementNode: (undefined | MediaElementAudioSourceNode),
  analyserNode: (undefined | AnalyserNode);
let logCancelId: (undefined | number),
  animationCancelId: (undefined | number),
  globalSet = new Set();

buttonElement && (buttonElement.innerText = 'Play')

if (audioElement) {
  audioElement.src = audioURL;
}

if (canvas && canvasContext) {
  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  canvasContext.fillStyle = "black";
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
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

const drawByteTimeDomainData = () => {
  if (!analyserNode || !canvas || !canvasContext) {
    return;
  }

  animationCancelId = requestAnimationFrame(drawByteTimeDomainData);

  analyserNode.fftSize = 1024;
  const byteTimeDomainData = new Uint8Array(analyserNode.fftSize);
  analyserNode.getByteTimeDomainData(byteTimeDomainData);

  canvasContext.fillStyle = 'black';
  canvasContext.fillRect(0, 0, WIDTH, HEIGHT);
  canvasContext.strokeStyle = 'white';

  canvasContext.beginPath();
  canvasContext.moveTo(0, 0);

  const xAxisSeparation = WIDTH / (analyserNode.fftSize)

  byteTimeDomainData.forEach((value, index) => {
    const x = index * xAxisSeparation;
    const y = value;

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
    buttonElement && (buttonElement.innerText = 'Pause')
    // logByteTimeDomainData();
    drawByteTimeDomainData();
  }
  else {
    audioElement.pause();
    logCancelId !== undefined && cancelAnimationFrame(logCancelId);
    animationCancelId !== undefined && cancelAnimationFrame(animationCancelId);
    buttonElement && (buttonElement.innerText = 'Play')
  }
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
      const gain = gainNode?.gain;

      if (gain === undefined) {
        return;
      }

      const newValue = gain.value + 0.1;
      (newValue < 2) && (gain.value = newValue)
      break;
    }

    case 'ArrowDown': {
      const gain = gainNode?.gain;

      if (gain === undefined) {
        return;
      }

      const newValue = gain.value - 0.1;
      (newValue > 0) && (gain.value = newValue)
      break;
    }
  }
}

window.addEventListener('keydown', handleKeyDown);
buttonElement.addEventListener('click', playPauseAudio)

