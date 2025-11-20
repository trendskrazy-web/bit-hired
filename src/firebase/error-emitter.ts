
import { EventEmitter } from 'events';

// This is a simple event emitter that can be used to broadcast errors
// from anywhere in the application. Components can subscribe to these events
// to display error messages or take other actions.

export const errorEmitter = new EventEmitter();
