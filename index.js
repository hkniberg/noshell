import { generateResponse } from "./anthropic.js";
import { executeCommand } from "./executor.js";
import readline from "readline";
import boxen from "boxen"; // Import boxen
import chalk from "chalk"; // Import chalk

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let chatHistory = [];

async function promptAndExecute() {
  rl.question("Enter command: ", async (instruction) => {
    try {
      chatHistory.push({ role: "user", content: instruction });
      console.log(boxen(chalk.blue(instruction), { padding: 1 })); // Box user input with color
      let response = await generateResponse(chatHistory);
      chatHistory.push({ role: "assistant", content: response });

      // Loop to handle consecutive SHELL commands
      while (response.startsWith("SHELL")) {
        // Extract the command(s) after "SHELL"
        const shellCommand = response.replace("SHELL\n", "");
        console.log(chalk.gray(shellCommand + "\n")); // Gray text for shell command
        const output = await executeCommand(shellCommand);
        console.log(chalk.gray(output));

        // Send the output back to anthropic as a new generateResponse
        chatHistory.push({ role: "user", content: output });
        response = await generateResponse(chatHistory);
        chatHistory.push({ role: "assistant", content: response });
      }
      // Box the final response after exiting the while loop
      console.log(boxen(response, { padding: 1 })); // Box the final response
    } catch (error) {
      console.error("Failed to execute command:", error);
    }
    // Prompt for next command after execution
    promptAndExecute();
  });
}

// Start the process
promptAndExecute();
