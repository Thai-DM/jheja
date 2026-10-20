/**
 * Interactive Experience Orchestrator for Hồng Ngọc's 20/10 Digital Gift
 * Manages scenes 1-5, typewriter narrations, Web Audio music engine,
 * micro-interactions, and replay loop.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const scenes = {
    1: document.getElementById('scene-1'),
    2: document.getElementById('scene-2'),
    3: document.getElementById('scene-3'),
    4: document.getElementById('scene-4'),
    5: document.getElementById('scene-5')
  };

  const dawnBurst = document.getElementById('dawn-burst');
  const starTriggerContainer = document.getElementById('star-trigger-container');
  const magicStarBtn = document.getElementById('magic-star-btn');
  const btnToGift = document.getElementById('btn-to-gift');
  const giftBox = document.getElementById('gift-box');
  const envelopeItem = document.getElementById('envelope-item');
  const btnToSurprise = document.getElementById('btn-to-surprise');
  const btnReplay = document.getElementById('btn-replay');

  // Audio Control
  const btnAudio = document.getElementById('btn-audio');

  // Typewriter Elements
  const typewriterLine1 = document.getElementById('typewriter-line-1');
  const typewriterLine2 = document.getElementById('typewriter-line-2');

  // Flowers & Toast
  const flowerWrappers = document.querySelectorAll('.flower-wrapper');
  const flowerToast = document.getElementById('flower-toast');
  const toastText = document.getElementById('toast-text');
  let toastTimeout = null;

  // State
  let currentSceneIndex = 1;
  let isBoxOpened = false;

  // ==========================================
  // 1. AUDIO TOGGLE
  // ==========================================
  function updateAudioButton(isPlaying) {
    if (isPlaying) {
      btnAudio.classList.add('active');
    } else {
      btnAudio.classList.remove('active');
    }
  }

  btnAudio.addEventListener('click', () => {
    const isPlaying = window.soundEngine.toggleMusic();
    updateAudioButton(isPlaying);
  });

  function autoStartMusic() {
    if (!window.soundEngine.isPlaying) {
      window.soundEngine.startMusic();
      updateAudioButton(true);
    }
  }

  // ==========================================
  // 2. SCENE NAVIGATION
  // ==========================================
  function switchScene(targetIndex) {
    if (scenes[currentSceneIndex]) {
      scenes[currentSceneIndex].classList.remove('active');
    }

    currentSceneIndex = targetIndex;
    const nextScene = scenes[currentSceneIndex];
    if (nextScene) {
      nextScene.classList.add('active');
    }

    // Inform particle engine
    if (targetIndex === 1) {
      window.particleEngine.setMode('mystery');
    } else if (targetIndex === 2) {
      window.particleEngine.setMode('magic');
    } else if (targetIndex === 3) {
      window.particleEngine.setMode('gift');
    } else if (targetIndex === 4) {
      window.particleEngine.setMode('letter');
      triggerLetterAnimation();
    } else if (targetIndex === 5) {
      window.particleEngine.setMode('climax');
    }
  }

  // ==========================================
  // 3. SCENE 1: TYPEWRITER & CELESTIAL STAR
  // ==========================================
  function typeWriter(element, text, speed = 55, callback) {
    element.textContent = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    const timer = setInterval(() => {
      if (i < text.length) {
        cursor.insertAdjacentText('beforebegin', text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        cursor.remove();
        if (callback) callback();
      }
    }, speed);
  }

  function startScene1() {
    typewriterLine1.textContent = '';
    typewriterLine2.textContent = '';
    starTriggerContainer.classList.remove('visible');

    setTimeout(() => {
      typeWriter(typewriterLine1, 'Hôm nay là một ngày hơi đặc biệt...', 60, () => {
        setTimeout(() => {
          typeWriter(typewriterLine2, 'Tớ có chuẩn bị một thứ nhỏ dành cho cậu.', 55, () => {
            setTimeout(() => {
              starTriggerContainer.classList.add('visible');
            }, 500);
          });
        }, 650);
      });
    }, 450);
  }

  magicStarBtn.addEventListener('click', () => {
    // Sound FX & Start Ambient Music
    window.soundEngine.playStarChime();
    autoStartMusic();

    // Trigger dawn burst transition
    dawnBurst.classList.add('active');

    // Switch to Scene 2 smoothly
    setTimeout(() => {
      switchScene(2);
    }, 950);
  });

  // ==========================================
  // 4. SCENE 2: BLOOMING GARDEN & MICRO-INTERACTIONS
  // ==========================================
  flowerWrappers.forEach((flower, index) => {
    flower.addEventListener('click', (e) => {
      e.stopPropagation();
      window.soundEngine.playFlowerChime(index);

      // Organic floral pulse
      flower.classList.remove('flower-touched');
      void flower.offsetWidth; // trigger reflow
      flower.classList.add('flower-touched');

      // Show secret wish toast
      const wish = flower.getAttribute('data-wish');
      showFlowerToast(wish);
    });
  });

  function showFlowerToast(message) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastText.textContent = message;
    flowerToast.classList.add('visible');

    toastTimeout = setTimeout(() => {
      flowerToast.classList.remove('visible');
    }, 3800);
  }

  btnToGift.addEventListener('click', () => {
    flowerToast.classList.remove('visible');
    switchScene(3);
  });

  // ==========================================
  // 5. SCENE 3: 3D HAUTE-COUTURE VELVET CASKET
  // ==========================================
  giftBox.addEventListener('click', (e) => {
    if (!isBoxOpened) {
      isBoxOpened = true;
      window.soundEngine.playBoxOpen();
      giftBox.classList.add('opened');

      const scene3Content = document.querySelector('.scene-3-content');
      if (scene3Content) {
        scene3Content.classList.add('box-opened');
      }

      const giftHint = document.getElementById('gift-hint');
      if (giftHint) {
        giftHint.innerHTML = 'Bức thư đang chờ Hồng Ngọc mở ra đấy... ✉️';
        giftHint.style.color = '#fde68a';
        giftHint.style.fontWeight = '600';
      }

      // Make envelope clickable once fully emerged
      setTimeout(() => {
        envelopeItem.classList.add('ready');
      }, 700);
    }
  });

  envelopeItem.addEventListener('click', (e) => {
    e.stopPropagation();
    window.soundEngine.playPaperUnfold();
    switchScene(4);
  });

  // ==========================================
  // 6. SCENE 4: LETTER UNFOLD & REVEAL
  // ==========================================
  function triggerLetterAnimation() {
    const lines = [
      document.getElementById('let-line-1'),
      document.getElementById('let-line-2'),
      document.getElementById('let-line-3'),
      document.getElementById('let-line-4')
    ];
    const letterActions = document.getElementById('letter-actions');

    lines.forEach((line) => line.classList.remove('revealed'));
    letterActions.classList.remove('visible');

    // Stagger reveal of the heartfelt message
    setTimeout(() => lines[0].classList.add('revealed'), 400);
    setTimeout(() => lines[1].classList.add('revealed'), 1600);
    setTimeout(() => lines[2].classList.add('revealed'), 3200);
    setTimeout(() => lines[3].classList.add('revealed'), 4800);
    setTimeout(() => letterActions.classList.add('visible'), 5800);
  }

  btnToSurprise.addEventListener('click', () => {
    window.soundEngine.playMagicBurst();
    switchScene(5);
  });

  // ==========================================
  // 7. SCENE 5: FINAL SURPRISE & REPLAY
  // ==========================================
  btnReplay.addEventListener('click', () => {
    // Reset all states
    isBoxOpened = false;
    giftBox.classList.remove('opened');
    envelopeItem.classList.remove('ready');
    dawnBurst.classList.remove('active');

    const scene3Content = document.querySelector('.scene-3-content');
    if (scene3Content) {
      scene3Content.classList.remove('box-opened');
    }

    const giftHint = document.getElementById('gift-hint');
    if (giftHint) {
      giftHint.innerHTML = 'Hãy chạm vào hộp quà để mở điều bất ngờ ✨';
      giftHint.style.color = '';
      giftHint.style.fontWeight = '';
    }

    // Switch back to Scene 1
    switchScene(1);
    startScene1();
  });

  // Start Experience
  startScene1();
});
