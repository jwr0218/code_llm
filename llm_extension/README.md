# My Code LLM Copilot Extension

This VS Code extension sends selected code to a Flask API and inserts AI-generated code completions.

## Features
- Select any code snippet
- Press Ctrl+Alt+G to generate completions
- Inserts generated code at the end of your selection

## Requirements
- VS Code 1.70+
- Flask API running at localhost:5000 or your chosen port

## Installation
1. Clone the repository
2. Run `npm install`
3. Run `vsce package` to create a `.vsix` file
4. Install the `.vsix` in VS Code

## Usage
- Select code → Press `Ctrl+Alt+G` → Wait for AI completion → Inserted automatically
