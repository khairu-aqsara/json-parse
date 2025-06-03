
'use server';
/**
 * @fileOverview An AI flow to analyze and attempt to fix invalid JSON data.
 *
 * - attemptJsonFix - A function that handles the JSON fixing process.
 * - AttemptJsonFixInput - The input type for the attemptJsonFix function.
 * - AttemptJsonFixOutput - The return type for the attemptJsonFix function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const AttemptJsonFixInputSchema = z.object({
  jsonString: z.string().describe('The potentially invalid JSON string.'),
  apiKey: z.string().optional().describe('Optional Gemini API Key to use for this request.'),
});
export type AttemptJsonFixInput = z.infer<typeof AttemptJsonFixInputSchema>;

const AttemptJsonFixOutputSchema = z.object({
  fixedJsonString: z.string().nullable().describe('The corrected JSON string if a fix was successful, otherwise null.'),
  analysisMessage: z.string().describe('A message explaining the fix, or detailing the error if no fix was made.'),
  isFixed: z.boolean().describe('True if the JSON was successfully fixed by the AI.')
});
export type AttemptJsonFixOutput = z.infer<typeof AttemptJsonFixOutputSchema>;

export async function attemptJsonFix(input: AttemptJsonFixInput): Promise<AttemptJsonFixOutput> {
  return fixJsonFlow(input);
}

const PROMPT_TEMPLATE_FIX_JSON = `
You are an expert JSON data parser and debugger.
The user has provided a JSON string that is invalid.
The initial JavaScript parser reported the following error: "{{parserErrorMessage}}"

Invalid JSON string:
\`\`\`json
{{{jsonString}}}
\`\`\`

Your tasks:
1. Analyze the provided JSON string and the parser error message.
2. If you can confidently identify and correct the syntax error(s) to make it valid JSON, provide the *entire* corrected JSON string.
3. If you cannot confidently correct it, or if the JSON is too malformed, explain the primary error(s) you found and, if possible, suggest where the error might be (e.g., "missing comma after property 'xyz' on line A", "unterminated string starting at line B, column C").
4. If the JSON was already valid (though the initial parser might have errored due to a very minor issue you can correct), just return the original JSON as corrected.

Respond with a valid JSON object containing two keys:
- "correctedJSON": A string containing the full corrected JSON data if you were able to fix it. If you could not fix it or if it was already valid and you made no changes, this should be \`null\` or the original string if trivially fixed.
- "explanation": A string explaining the fix you made, or detailing the errors found if no fix was made. If it was already valid, state that.

Example of a fixable error:
Input JSON: '{ "name": "John Doe", "age": 30, "city": "New York" }' (missing a comma)
Parser Error: "Expected ',' or '}' after property value in JSON at position X"
Your JSON Response:
{
  "correctedJSON": "{ \"name\": \"John Doe\", \"age\": 30, \"city\": \"New York\" }",
  "explanation": "Corrected by adding a missing comma after the value for the 'age' property."
}

Example of an unfixable error (or complex error):
Input JSON: '{ "name": "Jane, "occupation": "Developer }' (multiple errors)
Parser Error: "Unexpected string in JSON at position X"
Your JSON Response:
{
  "correctedJSON": null,
  "explanation": "The JSON has multiple errors. There's an unclosed string for the 'name' value and a missing quote for the 'Developer' value."
}

If the input JSON is already valid:
Input JSON: '{ "name": "Valid JSON" }'
Parser Error: (might be none or some benign warning if the initial check was sensitive)
Your JSON Response:
{
  "correctedJSON": "{ \"name\": \"Valid JSON\" }",
  "explanation": "The provided JSON string is already valid."
}
`;

const fixJsonFlow = ai.defineFlow(
  {
    name: 'fixJsonFlow',
    inputSchema: AttemptJsonFixInputSchema,
    outputSchema: AttemptJsonFixOutputSchema,
  },
  async (input) => {
    if (!input.apiKey || input.apiKey.trim() === '') {
      throw new Error("A Gemini API Key is required for AI analysis. Please set it in the API Key Settings.");
    }

    let parserErrorMessage = "No initial parser error detected.";
    let isInitiallyValid = false;
    try {
      JSON.parse(input.jsonString);
      isInitiallyValid = true;
    } catch (e: any) {
      parserErrorMessage = e.message;
    }

    // If it's already valid according to a strict parse, no need to call AI unless we want AI to 'prettify' or something (not the case here).
    // However, the user might click "Attempt AI Fix" even if the client-side parser passes,
    // if they *think* there's an issue or want AI to look at it.
    // So we proceed, but the AI can also determine it's valid.

    const genAI = new GoogleGenerativeAI(input.apiKey.trim());
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    let interpolatedPrompt = PROMPT_TEMPLATE_FIX_JSON
        .replace('{{{jsonString}}}', input.jsonString)
        .replace('{{parserErrorMessage}}', parserErrorMessage);

    try {
      const result = await model.generateContent(interpolatedPrompt);
      const response = result.response;

      if (!response) {
        throw new Error("AI model did not return a valid response object for JSON fixing.");
      }
      const text = response.text();
       if (text === null || text === undefined || text.trim() === "") {
        throw new Error("AI model returned an empty or invalid response text for JSON fixing.");
      }
      
      const parsedLLMOutput = JSON.parse(text);
      
      const { correctedJSON, explanation } = parsedLLMOutput;

      let finalFixedJsonString: string | null = null;
      let finalIsFixed = false;

      if (correctedJSON && typeof correctedJSON === 'string') {
        try {
          // Validate if the AI's correction is actually valid JSON
          JSON.parse(correctedJSON);
          finalFixedJsonString = correctedJSON;
          // If the AI returns the exact same string as input and it was initially invalid, it means it couldn't fix it.
          // Or, if it returns a different string, it means it attempted a fix.
          if (input.jsonString !== correctedJSON || isInitiallyValid) {
             finalIsFixed = true;
          }
        } catch (e) {
          // AI's correction was not valid JSON, so treat as not fixed.
          // The explanation should ideally state why it failed.
          finalIsFixed = false;
           return {
            fixedJsonString: null,
            analysisMessage: `AI attempted a fix, but the result was still invalid. AI's explanation: ${explanation || 'No explanation provided.'}`,
            isFixed: false,
          };
        }
      }
      
      return {
        fixedJsonString: finalFixedJsonString,
        analysisMessage: explanation || "No explanation provided by AI.",
        isFixed: finalIsFixed,
      };

    } catch (e: any) {
      let descriptiveError = `AI JSON fixing failed.`;
      if (e.message?.toLowerCase().includes("api key not valid")) {
           descriptiveError = "The provided API key is not valid for AI JSON fixing. Please check your Gemini API Key in settings.";
      } else if (e.message?.includes("蕗")) { // Often indicates billing/quota issues with Gemini
           descriptiveError = "AI JSON fixing failed, possibly due to API quota limits or billing issues with your Google Cloud project.";
      } else {
          descriptiveError = `AI JSON fixing failed: ${e.message || "An unknown error occurred."}`;
      }
      // console.error("Original AI JSON fixing error:", e);
      throw new Error(descriptiveError);
    }
  }
);

    