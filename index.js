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

// Helper function to extract shell command
function extractShellCommand(response) {
  const lines = response.split("\n");
  const shellLineIndex = lines.findIndex((line) => line.startsWith("SHELL"));
  if (shellLineIndex !== -1) {
    // Join back the lines starting from the first occurrence of "SHELL"
    return lines.slice(shellLineIndex).join("\n").replace("SHELL\n", "");
  }
  return null; // Return null if no "SHELL" command is found
}

async function promptAndExecute() {
  rl.question("\n\n>>> ", async (instruction) => {
    try {
      chatHistory.push({ role: "user", content: instruction });
      console.log(boxen(chalk.blue("You: " + instruction), { padding: 1 })); // Box user input with color
      let response = await generateResponse(chatHistory);
      chatHistory.push({ role: "assistant", content: response });

      let shellCommand = extractShellCommand(response);

      // Loop to handle consecutive SHELL commands
      while (shellCommand) {
        console.log(chalk.gray(shellCommand + "\n")); // Gray text for shell command
        const output = await executeCommand(shellCommand);
        console.log(chalk.gray(output));

        // Send the output back to anthropic as a new generateResponse
        chatHistory.push({
          role: "user",
          content: output || "(command executed successfully)",
        });
        response = await generateResponse(chatHistory);
        chatHistory.push({ role: "assistant", content: response });

        shellCommand = extractShellCommand(response);
      }
      // Box the final response after exiting the while loop
      if (!shellCommand) {
        // Check if the final response is not a SHELL command
        console.log(boxen(chalk.green(response), { padding: 1 })); // Box the final response
      }
    } catch (error) {
      console.error("Failed to execute command:", error);
    }
    // Prompt for next command after execution
    promptAndExecute();
  });
}

// Start the process
promptAndExecute();
