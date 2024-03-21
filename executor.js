import { exec } from "child_process";

/**
 * Executes a shell command and returns the output as a promise.
 * @param {string} command - The shell command to execute.
 * @returns {Promise<string>} - The stdout from the executed command.
 */
export function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`exec error: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      resolve(stdout);
    });
  });
}
