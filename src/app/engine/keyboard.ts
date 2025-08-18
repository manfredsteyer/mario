export type KeyboardState = {
    up: boolean;
    left: boolean;
    right: boolean;
};

export const keyboard: KeyboardState = {
    up: false,
    left: false,
    right: false
};

window.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'ArrowLeft':
      keyboard.left = true;
      break;
    case 'ArrowRight':
      keyboard.right = true;
      break;
    case 'ArrowUp':
      keyboard.up = true;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'ArrowLeft':
      keyboard.left = false;
      break;
    case 'ArrowRight':
      keyboard.right = false;
      break;
    case 'ArrowUp':
      keyboard.up = false;
      break;
  }
});
