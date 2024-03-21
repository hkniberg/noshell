import { generateResponse } from "./anthropic.js";
import { executeCommand } from "./executor.js";
import readline from "readline";

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
      let response = await generateResponse(chatHistory);
      console.log(response);
      chatHistory.push({ role: "assistant", content: response });

      // Loop to handle consecutive SHELL commands
      while (response.startsWith("SHELL")) {
        // Extract the command(s) after "SHELL"
        const shellCommand = response.replace("SHELL\n", "");
        console.log(`Executing command: ${shellCommand}`);
        const output = await executeCommand(shellCommand);
        console.log(output);

        // Send the output back to anthropic as a new generateResponse
        chatHistory.push({ role: "user", content: output });
        response = await generateResponse(chatHistory);
        console.log(response);
        chatHistory.push({ role: "assistant", content: response });
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
