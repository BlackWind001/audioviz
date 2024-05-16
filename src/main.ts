import './style.css'
import audioURL from '../public/outfoxing.mp3';

const audioElement = document.querySelector('audio');
const buttonElement = document.querySelector('.play-pause') as HTMLButtonElement;
const barDiv = document.querySelector('.bar');
let audioContext: (undefined | null | AudioContext),
  gainNode: (undefined | GainNode),
  mediaElementNode: (undefined | MediaElementAudioSourceNode),
  analyserNode: (undefined | AnalyserNode);
let animationCancelId: (undefined | number),
  globalSet = new Set();

buttonElement && (buttonElement.innerText = 'Play')

if (audioElement) {
  audioElement.src = audioURL;
}

const logByteTimeDomainData = () => {

  if (!analyserNode) {
    return;
  }

  analyserNode.fftSize = 2048;
  const byteTimeDomainData = new Uint8Array(analyserNode.fftSize);
  analyserNode.getByteTimeDomainData(byteTimeDomainData);

  const newValue = Array.from(new Set(byteTimeDomainData))
  console.log('sample-rate:', audioContext?.sampleRate);
  // @ts-ignore
  console.log('byteTimeDomainData', byteTimeDomainData, globalSet.add(...newValue));


  animationCancelId = requestAnimationFrame(logByteTimeDomainData);
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

const handleKeyDown = (e: KeyboardEvent) => {
  const { key } = e;

  if (!audioContext && !(e.metaKey || e.altKey || e.ctrlKey)) {
    setupAudioContext();
  }

  if (!audioElement) {
    return;
  }

  switch (key) {
    case ' ': {
      if (audioElement.paused) {
        audioElement.play();
        buttonElement && (buttonElement.innerText = 'Pause')
        logByteTimeDomainData();
      }
      else {
        audioElement.pause();
        animationCancelId !== undefined && cancelAnimationFrame(animationCancelId);
        buttonElement && (buttonElement.innerText = 'Play')
      }
      
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

