import { createAudioPlayer, AudioPlayer } from 'expo-audio';

type SoundName = 'click' | 'success' | 'error'; // Example sound names

const sounds: Record<SoundName, AudioPlayer | null> = {
  click: null,
  success: null,
  error: null,
};

let isSfxMuted = false;
let isMusicMuted = false;

export const soundManager = {
  loadSounds() {
    try {
      // Load click sound
      sounds.click = createAudioPlayer(require('../assets/sounds/click.mp3'));

      // Load success sound
      sounds.success = createAudioPlayer(require('../assets/sounds/success.mp3'));

      // Load error sound
      sounds.error = createAudioPlayer(require('../assets/sounds/error.mp3'));

      console.log('All sounds loaded!');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  },

  play(soundName: SoundName) {
    if (isSfxMuted) return;
    const sound = sounds[soundName];
    if (sound) {
      try {
        sound.seekTo(0);
        sound.play();
      } catch (error) {
        console.error(`Error playing ${soundName} sound:`, error);
      }
    } else {
      console.warn(`Sound "${soundName}" not loaded.`);
    }
  },

  toggleSfx() {
    isSfxMuted = !isSfxMuted;
    return isSfxMuted;
  },

  toggleMusic() {
    isMusicMuted = !isMusicMuted;
    // TODO: Add logic to play/pause background music
    return isMusicMuted;
  },

  getSfxMutedState() {
      return isSfxMuted;
  },

  getMusicMutedState() {
      return isMusicMuted;
  },

  unloadSounds() {
    for (const soundName in sounds) {
      const sound = sounds[soundName as SoundName];
      if (sound) {
        sound.release();
        sounds[soundName as SoundName] = null;
      }
    }
    console.log('All sounds unloaded!');
  },
};