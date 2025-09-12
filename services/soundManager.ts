import { Audio } from 'expo-av';

type SoundName = 'click' | 'success' | 'error'; // Example sound names

const sounds: Record<SoundName, Audio.Sound | null> = {
  click: null,
  success: null,
  error: null,
};

export const soundManager = {
  async loadSounds() {
    try {
      // Load click sound
      const { sound: clickSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/click.mp3') // You'll need to add your sound files here
      );
      sounds.click = clickSound;

      // Load success sound
      const { sound: successSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/success.mp3')
      );
      sounds.success = successSound;

      // Load error sound
      const { sound: errorSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/error.mp3')
      );
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
        await sound.replayAsync(); // Play from the beginning
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
        await sound.unloadAsync();
        sounds[soundName as SoundName] = null;
      }
    }
    console.log('All sounds unloaded!');
  },
};