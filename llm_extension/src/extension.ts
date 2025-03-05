import * as vscode from 'vscode';
// node-fetch는 Node 18 이상에서는 내장 fetch를 사용할 수 있으나, 
// 이전 버전을 사용 중이면 npm install node-fetch@2 (혹은 3, ESM 방식으로) 해야 합니다.
const fetch = require('node-fetch');


interface ChangeRecord {
    range: vscode.Range;
    timestamp: number;
};

let recentChanges: ChangeRecord[] = [];

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "code-llm-copilot" is now active!');


    let hellowWord = vscode.commands.registerCommand("extension.hellowWorld", () => {
        vscode.window.showInformationMessage("Hello VS code extension")        
    }); 

    vscode.workspace.onDidChangeTextDocument(event => {
        const timestamp = Date.now();
        for (const change of event.contentChanges) {
            recentChanges.push({ range: change.range, timestamp });
        }
        const config = vscode.workspace.getConfiguration('extension');
        const recentEditWindow: number = config.get('recentEditWindow', 10);
        recentChanges = recentChanges.filter(change => (timestamp - change.timestamp) <= recentEditWindow * 1000);
    });


    const provider = vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, {
        provideInlineCompletionItems: async (document, position, context, token) => {
            const now = Date.now();
            const config = vscode.workspace.getConfiguration('extension');
            const recentEditWindow: number = config.get('recentEditWindow', 10);
            const contextLines: number = config.get('contextLines', 2);

            // 최근 변경사항 필터링
            const filteredChanges = recentChanges.filter(change => (now - change.timestamp) <= recentEditWindow * 1000);
            if (filteredChanges.length === 0) {
                return { items: [] };
            }

            // 변경된 영역들의 union(합집합) 계산 후 앞뒤 contextLines 만큼 확장
            let startLine = Number.MAX_VALUE;
            let endLine = -1;
            filteredChanges.forEach(change => {
                if (change.range.start.line < startLine) {
                    startLine = change.range.start.line;
                }
                if (change.range.end.line > endLine) {
                    endLine = change.range.end.line;
                }
            });
            startLine = Math.max(startLine - contextLines, 0);
            endLine = Math.min(endLine + contextLines, document.lineCount - 1);
            const unionRange = new vscode.Range(
                new vscode.Position(startLine, 0),
                new vscode.Position(endLine, document.lineAt(endLine).text.length)
            );
            const codeContext = document.getText(unionRange);

            // LLM API 호출 (비동기)
            try {
                const response = await fetch('http://0.0.0.0:5000/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ codeContext })
                });
                if (!response.ok) {
                    console.error(`API error: ${response.statusText}`);
                    return { items: [] };
                }
                const data = await response.json();
                const generatedCode = data.completion;
                if (!generatedCode) {
                    return { items: [] };
                }
                // 제안은 unionRange.end 위치에서 시작
                const inlineCompletion = new vscode.InlineCompletionItem(generatedCode,new vscode.Range(unionRange.end, unionRange.end));
                return { items: [ inlineCompletion ] };
            } catch (error) {
                console.error('Error generating code: ', error);
                return { items: [] };
            }
        }
    });
    let disposable = vscode.commands.registerCommand("extension.generateCode", async () => {
        vscode.commands.executeCommand("editor.action.inlineSuggest.trigger");
    });
    context.subscriptions.push(disposable);
    context.subscriptions.push(hellowWord);
    
}

    // let disposable = vscode.commands.registerCommand("extension.generateCode", async () => {
    //     const editor = vscode.window.activeTextEditor;
    //     if (!editor) {
    //         vscode.window.showErrorMessage('No active editor found.');
    //         return;
    //     }

    //     const selection = editor.selection;
    //     const selectedText = editor.document.getText(selection);
    //     if (!selectedText) {
    //         vscode.window.showErrorMessage('Please select some code to generate from.');
    //         return;
    //     }

    //     // const prompt = `${selectedText}`;

    //     try {
    //         const response = await fetch('http://0.0.0.0:5000/generate', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ selectedText })
    //         });

    //         if (!response.ok) {
    //             throw new Error(`API error: ${response.statusText}`);
    //         }

    //         const data = await response.json();
    //         const generatedCode = data.completion;
    //         if (!generatedCode) {
    //             vscode.window.showErrorMessage('No code was generated.');
    //             return;
    //         }

    //         editor.edit(editBuilder => {
    //             editBuilder.insert(selection.end, "\n" + generatedCode);
    //         });
    //     } catch (error: any) {
    //         vscode.window.showErrorMessage('Error generating code: ' + error.message);
    //     }
    // });

//     context.subscriptions.push(disposable);
//     context.subscriptions.push(hellowWord);
// }



export function deactivate() {}
