export default function initWaveformSelector (cb: Function) {
  const waveformSelector = document.querySelector('.waveform-selector') as HTMLSelectElement;

  waveformSelector.addEventListener('change', function (event) {
    event.stopPropagation();
    this.blur();

    // @ts-ignore
    cb(event.target.value);
  });
}