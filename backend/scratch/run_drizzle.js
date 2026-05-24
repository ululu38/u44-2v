process.stdout.isTTY = true;
process.stdin.isTTY = true;
process.stdin.setRawMode = () => {};

// Mock readline or keypress events if it expects user interaction
// For promptColumnsConflicts: it prompts yes/no or select. 
// We want to simulate key presses or inputs.
// Inquirer or prompts package usually listens to keypresses on stdin.
// If it prompts for renames, we want to choose "No" (or default).
// Usually, pressing "Enter" accepts the default.
// Let's write a mechanism to automatically write newlines or arrow keys to stdin
setTimeout(() => {
  // Let's write enter key
  process.stdin.push('\n');
  process.stdin.push('\n');
  process.stdin.push('\n');
}, 2000);

process.argv = ['node', 'drizzle-kit', 'generate'];
require('../node_modules/drizzle-kit/bin.cjs');
