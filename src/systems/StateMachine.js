/**
 * StateMachine - Manages entity behavior states
 * Follows State pattern from phaser-design-patterns skill
 */
export class StateMachine {
  constructor(context) {
    this.context = context;
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
  }

  register(name, state) {
    state.machine = this;
    state.context = this.context;
    this.states.set(name, state);
    return this;
  }

  transition(name, data = {}) {
    const nextState = this.states.get(name);
    if (!nextState) {
      console.warn(`State "${name}" not found`);
      return;
    }

    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    this.previousState = this.currentState;
    this.currentState = nextState;

    if (this.currentState.enter) {
      this.currentState.enter(data);
    }

    return this;
  }

  update(delta) {
    if (this.currentState && this.currentState.update) {
      this.currentState.update(delta);
    }
  }

  getState() {
    return this.currentState ? this.currentState.name : null;
  }

  isInState(name) {
    return this.currentState && this.currentState.name === name;
  }
}

/**
 * Base State class to extend
 */
export class State {
  constructor(name) {
    this.name = name;
    this.machine = null;
    this.context = null;
  }

  enter(data) {}
  update(delta) {}
  exit() {}
}
