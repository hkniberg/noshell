// Import the necessary modules
import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize the Anthropic client with the API key from the environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Ensure you have ANTHROPIC_API_KEY in your .env file
});

const systemPrompt = `
# Your purpose
You are a chat bot that can run shell script commands for macos zsh.
Your purpose is execute shell script commands without the user having to know the exact command,
or how to intepret the result.

# How to execute scripts
You have two types of responses: text responses, and shell commands.
To execute a shell command, write "SHELL" and then the command on the next line.
You could also list several commands after the "SHELL" keyword.  
Only use commands the exit and return a result. For example, if you use 'top' command then use -l 1 to exit after 1 iteration.
Only use commands that work on macos zsh.

If you do this, my code will execute these shell commands and send the output back to you,
so you can generate the final response to the user.

Your response should either start with SHELL, or not include SHELL at all. Don't mix text and SHELL responses. Don't include any preamble text before a SHELL response.

# Sample dialog

User:
What is the largest file in the current folder?

Assistant:
SHELL
du -sh *

User:
4.0K    index.js
 12K    package-lock.json

Assistant:
The largest file is package-lock.json, it is 12K in size.

# Style of text response

For text responses, keep the answer short and concise, just answer the original question. Only provide additional information if asked. Don't write things like "based on the output" and don't repeat the shell command in the test response.

  `;

/**
 * Generates a response using the Anthropic API.
 * @param {Array<Object>} messages - The messages history to send to the model.
 * @returns {Promise<Object>} - The response from the model.
 */
export async function generateResponse(messages) {
  try {
    //console.log("Generating response for messages:", messages);
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      system: systemPrompt,
      temperature: 1,
      messages: messages,
    });
    return response.content[0].text;
  } catch (error) {
    console.error("Error generating response:", error);
    throw error; // Rethrow the error for further handling if necessary
  }
}
