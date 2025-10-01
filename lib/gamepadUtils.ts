// Gamepad utility for Xbox One controller support

export interface GamepadState {
  connected: boolean;
  buttons: {
    a: boolean;
    b: boolean;
    x: boolean;
    y: boolean;
    lb: boolean;
    rb: boolean;
    lt: boolean;
    rt: boolean;
    back: boolean;
    start: boolean;
    leftStick: boolean;
    rightStick: boolean;
    dpadUp: boolean;
    dpadDown: boolean;
    dpadLeft: boolean;
    dpadRight: boolean;
  };
  axes: {
    leftStickX: number;
    leftStickY: number;
    rightStickX: number;
    rightStickY: number;
  };
}

// Button mapping for standard gamepad (Xbox layout)
const BUTTON_MAP = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  LEFT_STICK: 10,
  RIGHT_STICK: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15
};

// Axes mapping
const AXES_MAP = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3
};

// Dead zone threshold to avoid drift
const DEAD_ZONE = 0.15;

export function getGamepadState(gamepadIndex = 0): GamepadState | null {
  const gamepads = navigator.getGamepads();
  const gamepad = gamepads[gamepadIndex];

  if (!gamepad) {
    return null;
  }

  const applyDeadZone = (value: number) => {
    return Math.abs(value) < DEAD_ZONE ? 0 : value;
  };

  return {
    connected: gamepad.connected,
    buttons: {
      a: gamepad.buttons[BUTTON_MAP.A]?.pressed || false,
      b: gamepad.buttons[BUTTON_MAP.B]?.pressed || false,
      x: gamepad.buttons[BUTTON_MAP.X]?.pressed || false,
      y: gamepad.buttons[BUTTON_MAP.Y]?.pressed || false,
      lb: gamepad.buttons[BUTTON_MAP.LB]?.pressed || false,
      rb: gamepad.buttons[BUTTON_MAP.RB]?.pressed || false,
      lt: gamepad.buttons[BUTTON_MAP.LT]?.pressed || false,
      rt: gamepad.buttons[BUTTON_MAP.RT]?.pressed || false,
      back: gamepad.buttons[BUTTON_MAP.BACK]?.pressed || false,
      start: gamepad.buttons[BUTTON_MAP.START]?.pressed || false,
      leftStick: gamepad.buttons[BUTTON_MAP.LEFT_STICK]?.pressed || false,
      rightStick: gamepad.buttons[BUTTON_MAP.RIGHT_STICK]?.pressed || false,
      dpadUp: gamepad.buttons[BUTTON_MAP.DPAD_UP]?.pressed || false,
      dpadDown: gamepad.buttons[BUTTON_MAP.DPAD_DOWN]?.pressed || false,
      dpadLeft: gamepad.buttons[BUTTON_MAP.DPAD_LEFT]?.pressed || false,
      dpadRight: gamepad.buttons[BUTTON_MAP.DPAD_RIGHT]?.pressed || false,
    },
    axes: {
      leftStickX: applyDeadZone(gamepad.axes[AXES_MAP.LEFT_STICK_X] || 0),
      leftStickY: applyDeadZone(gamepad.axes[AXES_MAP.LEFT_STICK_Y] || 0),
      rightStickX: applyDeadZone(gamepad.axes[AXES_MAP.RIGHT_STICK_X] || 0),
      rightStickY: applyDeadZone(gamepad.axes[AXES_MAP.RIGHT_STICK_Y] || 0),
    }
  };
}

// Hook to detect gamepad connection
export function useGamepad(callback?: (connected: boolean, gamepad?: Gamepad) => void) {
  if (typeof window === 'undefined') return;

  const handleGamepadConnected = (e: GamepadEvent) => {
    console.log('🎮 Gamepad connected:', e.gamepad.id);
    callback?.(true, e.gamepad);
  };

  const handleGamepadDisconnected = (e: GamepadEvent) => {
    console.log('🎮 Gamepad disconnected:', e.gamepad.id);
    callback?.(false, e.gamepad);
  };

  window.addEventListener('gamepadconnected', handleGamepadConnected);
  window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

  return () => {
    window.removeEventListener('gamepadconnected', handleGamepadConnected);
    window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
  };
}

// Check if any gamepad is connected
export function isGamepadConnected(): boolean {
  const gamepads = navigator.getGamepads();
  return Array.from(gamepads).some(gp => gp?.connected);
}

// Get button press with debounce support
export function isButtonJustPressed(
  buttonName: keyof GamepadState['buttons'],
  previousState: GamepadState | null,
  currentState: GamepadState | null
): boolean {
  if (!previousState || !currentState) return false;
  return !previousState.buttons[buttonName] && currentState.buttons[buttonName];
}
