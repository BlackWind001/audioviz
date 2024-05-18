# Audio waveform visualizer

A simple audio visualizer that allows you to view the changes of an audio signal over time.

## Context
I wanted to understand the Web Audio API better so I started exploring projects I could build with it.

An audio visualizer seemed really cool so that is what I built.

## Features

The app can display the time-domain graph of an audio signal in a sine wave and also a circular sine wave fashion.

### Mobile users
Mobile users can play and pause the audio by tapping the screen.
They can also increase or decrease the audio volume by moving their fingers up and down the screen.

### Desktop users
Desktop users can play and pause the audio by pressing `Space` on their keyboard.
They can also control the volume by using the `Up` and `Down` arrow keys.

## Screen recordings

Circular wave              |  Sine wave
:-------------------------:|:-------------------------:
![Circular wave](/public/Circular_wave_2.gif)  |  ![Sine wave](/public/Sine_wave_4.gif)

## Resources:
1. What is a time domain? [Frequency domain article which has the following one-liner](https://en.wikipedia.org/wiki/Frequency_domain)

> Put simply, a time-domain graph shows how a signal changes over time

2. [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
3. [Audio routing graph](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode#the_audio_routing_graph)
4. [Web audio example](https://github.com/mdn/webaudio-examples/blob/main/voice-change-o-matic/scripts/app.js#L108-L193)
5. [Drawing shapes with Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)
6. [Trigonometric method and Polygon method](https://youtu.be/bkY_I4Lo-g8?t=122)


