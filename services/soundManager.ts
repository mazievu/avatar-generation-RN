import { createAudioPlayer, AudioPlayer as OriginalAudioPlayer } from 'expo-audio';

// This is a temporary workaround for what appears to be incorrect type
// definitions in the installed version of expo-audio.
// Based on official examples, these methods should exist.
type PatchedAudioPlayer = OriginalAudioPlayer & {
  loadAsync: () => Promise<void>;
  playAsync: () => Promise<void>;
  pauseAsync: () => Promise<void>;
  stopAsync: () => Promise<void>;
  setPositionAsync: (positionMillis: number) => Promise<void>;
  release: () => Promise<void>;
};

type SoundName = 'click' | 'success' | 'error'; // Example sound names

const sounds: Record<SoundName, PatchedAudioPlayer | null> = {
  click: null,
  success: null,
  error: null,
};

export const soundManager = {
  async loadSounds() {
    try {
      // Load click sound
      const clickSound = createAudioPlayer(require('../assets/sounds/click.mp3')) as PatchedAudioPlayer;
      await clickSound.loadAsync();
      sounds.click = clickSound;

      // Load success sound
      const successSound = createAudioPlayer(require('../assets/sounds/success.mp3')) as PatchedAudioPlayer;
      await successSound.loadAsync();
      sounds.success = successSound;

      // Load error sound
      const errorSound = createAudioPlayer(require('../assets/sounds/error.mp3')) as PatchedAudioPlayer;
      await errorSound.loadAsync();
      sounds.error = errorSound;

      console.log('All sounds loaded!');
    } catch (error) {
      console.error('Error loading sounds:', error);
    }
  },

  async play(soundName: SoundName) {
    const sound = sounds[soundName];
    if (sound) {
      try {
        // Using setPositionAsync(0) to emulate replay
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } catch (error) {
        console.error(`Error playing ${soundName} sound:`, error);
      }
    } else {
      console.warn(`Sound "${soundName}" not loaded.`);
    }
  },

  async unloadSounds() {
    for (const soundName in sounds) {
      const sound = sounds[soundName as SoundName];
      if (sound) {
        await sound.release();
        sounds[soundName as SoundName] = null;
      }
    }
    console.log('All sounds unloaded!');
  },
};