
# JSON Parser with AI-Powered Insights

This is a Next.js web application that allows users to parse, view, analyze, and understand JSON data. It features a clean, interactive tree view for exploring JSON structures and leverages AI (via Genkit and Gemini) to automatically generate Zod schema suggestions and human-readable insights about the data.

## Key Features

*   **JSON Input**: Paste raw JSON data or upload a `.json` file.
*   **Interactive Tree View**: Explore complex JSON structures with an expandable/collapsible tree.
*   **Syntax Highlighting**: Clear and readable display of JSON keys and values.
*   **Search**: Quickly find specific keys or values within the JSON.
*   **Copy Formatted JSON**: Easily copy the pretty-printed JSON to your clipboard.
*   **AI-Powered Analysis (Gemini)**:
    *   **Suggested Zod Schema**: Automatically generates a TypeScript Zod schema based on the input JSON structure.
    *   **Data Insights**: Provides a concise, human-readable summary of what the JSON data might represent.
*   **API Key Management**: Securely store your Gemini API key in local storage for AI features.
*   **Responsive Design**: Usable across different screen sizes.
*   **Light/Dark Mode**: Adapts to your system's theme preference.

## Tech Stack

*   **Next.js**: React framework for server-side rendering and static site generation.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Superset of JavaScript that adds static typing.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **ShadCN UI**: Re-usable UI components built with Radix UI and Tailwind CSS.
*   **Genkit**: Framework for building AI-powered applications, integrated with Google's Gemini models.
*   **Lucide Icons**: Collection of beautiful and consistent icons.

## Getting Started

### Prerequisites

*   Node.js (version 20 or higher recommended)
*   npm or yarn

### Setup

1.  **Clone the repository (if applicable) or download the project files.**

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up your Gemini API Key:**
    *   This application uses the Gemini API for its AI-powered analysis features. You'll need a valid Gemini API key from Google Cloud.
    *   Once you have your key, run the application (see next step).
    *   In the application's UI (top-right of the right panel), click the "Settings" (gear) icon.
    *   Enter your Gemini API key in the dialog and click "Save Key". The key will be stored in your browser's local storage.

### Running the Development Server

The application consists of two main parts: the Next.js frontend and the Genkit AI flows.

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```
    This will typically start the application on `http://localhost:9002`.

2.  **Start the Genkit development server (in a separate terminal):**
    ```bash
    npm run genkit:dev
    ```
    This starts the Genkit flows, which are necessary for the AI analysis features. By default, it runs on `http://localhost:3400` (Genkit UI) and exposes the flows for the Next.js app to call.

    *Optional: For automatic reloading of Genkit flows on code changes:*
    ```bash
    npm run genkit:watch
    ```

Once both servers are running, you can open `http://localhost:9002` in your browser to use the JSON Parser.

## How to Use

1.  **Input JSON**:
    *   Paste your JSON data directly into the left-hand textarea.
    *   Or, click "Upload JSON" to select a `.json` file from your computer.
2.  **View & Navigate**:
    *   The right-hand panel will display the formatted JSON in an interactive tree view.
    *   Click on chevrons (`>` or `v`) to expand or collapse nodes.
    *   Use the search bar to filter keys and values.
3.  **AI Analysis**:
    *   Ensure you have set your Gemini API key via the "Settings" (gear) icon.
    *   Click the "Analyze" (sparkles) button.
    *   The AI will process the JSON and display:
        *   A suggested Zod schema string.
        *   Human-readable insights about the data.
4.  **Controls**:
    *   **Clear**: Clears the input textarea.
    *   **Copy**: Copies the pretty-printed JSON from the output view to your clipboard.
    *   **Settings**: Opens the dialog to manage your Gemini API Key.

## Project Structure

*   `src/app/`: Main Next.js application pages and layout.
*   `src/components/`: Reusable React components.
    *   `src/components/ui/`: ShadCN UI components.
*   `src/ai/`: Genkit related code.
    *   `src/ai/flows/`: Genkit flows for AI functionalities (e.g., `analyze-json-flow.ts`).
    *   `src/ai/genkit.ts`: Genkit AI instance configuration.
    *   `src/ai/dev.ts`: Development server entry point for Genkit flows.
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions.
*   `public/`: Static assets.

## Contributing

Contributions are welcome! If you have suggestions or find issues, please open an issue or submit a pull request.
```