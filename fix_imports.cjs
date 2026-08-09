const fs = require('fs');

let content = fs.readFileSync('src/input/input-controller.js', 'utf8');

const targetStr = `import { ACTIONS, ASSEMBLY_ACTIONS, DEFAULT_BINDINGS, QUICK_MOUNT_BINDINGS } from "./action-bindings.js";

const VALID_ACTIONS = new Set([...Object.values(ACTIONS), ...Object.values(ASSEMBLY_ACTIONS)]);
const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']);
import { createTouchStick } from "./touch-stick.js";
import { TUTORIAL_EVENTS } from "../features/tutorial/tutorial-events.js";`;

const replacementStr = `import { ACTIONS, ASSEMBLY_ACTIONS, DEFAULT_BINDINGS, QUICK_MOUNT_BINDINGS } from "./action-bindings.js";
import { createTouchStick } from "./touch-stick.js";
import { TUTORIAL_EVENTS } from "../features/tutorial/tutorial-events.js";

const VALID_ACTIONS = new Set([...Object.values(ACTIONS), ...Object.values(ASSEMBLY_ACTIONS)]);
const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON']);`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('src/input/input-controller.js', content);
console.log("Imports fixed");
