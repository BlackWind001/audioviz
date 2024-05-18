type SelectElementChangeEvent = Event & {
  target: EventTarget | null;
}

export default function initWaveformSelector (cb: Function) {
  const waveformSelector = document.querySelector('.waveform-selector') as HTMLSelectElement;

  const handleChange = (e: SelectElementChangeEvent) => {
    e.stopPropagation();

    // @ts-ignore
    cb(e.target?.value);
  };

  waveformSelector.addEventListener('change', handleChange);
}