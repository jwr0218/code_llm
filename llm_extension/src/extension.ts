import * as vscode from 'vscode';
// node-fetch는 Node 18 이상에서는 내장 fetch를 사용할 수 있으나, 
// 이전 버전을 사용 중이면 npm install node-fetch@2 (혹은 3, ESM 방식으로) 해야 합니다.
const fetch = require('node-fetch');

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "code-llm-copilot" is now active!');


    let hellowWord = vscode.commands.registerCommand("extension.hellowWorld", () => {
        vscode.window.showInformationMessage("Hello VS code extension")        
    }); 

    let disposable = vscode.commands.registerCommand("extension.generateCode", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showErrorMessage('Please select some code to generate from.');
            return;
        }

        // const prompt = `${selectedText}`;

        try {
            const response = await fetch('http://0.0.0.0:5000/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedText })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const data = await response.json();
            const generatedCode = data.completion;
            if (!generatedCode) {
                vscode.window.showErrorMessage('No code was generated.');
                return;
            }

            editor.edit(editBuilder => {
                editBuilder.insert(selection.end, "\n" + generatedCode);
            });
        } catch (error: any) {
            vscode.window.showErrorMessage('Error generating code: ' + error.message);
        }
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(hellowWord);
}



export function deactivate() {}
