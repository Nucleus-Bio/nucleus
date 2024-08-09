import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  const myViewProvider = new MyViewProvider(context.extensionUri);
    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(MyViewProvider.viewType, myViewProvider)
    );



    let webview = vscode.commands.registerCommand('react-world.namasteworld', async () => {

    let panel = vscode.window.createWebviewPanel("webview", "React", vscode.ViewColumn.One, {
            enableScripts: true,
    });

    const filePath = vscode.Uri.file('/Users/pratikkatte/Desktop/ex3.sam');
    const fileUri = panel.webview.asWebviewUri(filePath);
    console.log("fileuri", fileUri.toString());

    async function getAllFileUris(): Promise<vscode.Uri[]> {
      // Use '**/*' pattern to match all files
      const uris = await vscode.workspace.findFiles('**/*');
      return uris;
  }

  // Example usage: log all file Uris in the workspace
  getAllFileUris().then(uris => {
      uris.forEach(uri => {
          console.log(uri.toString());
      });
  });
    

    let scriptSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "jbrowse-chat", "dist", "index.js"));

    let cssSrc = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "jbrowse-chat", "dist", "index.css"));


    
    
    const files = await vscode.workspace.findFiles('**/*.sam');

    try {
        console.log("files", files[0]);

        panel.webview.html = getWebviewContent(cssSrc, scriptSrc, panel);

        panel.webview.postMessage({ command: 'message', data: "" });

    } catch (error) {
        console.log("Error reading file or sending message:", error);
    }
  });
  
    context.subscriptions.push(webview);
}

function getWebviewContent(cssSrc: vscode.Uri, scriptSrc: vscode.Uri, panel: vscode.WebviewPanel): string {

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <link rel="stylesheet" href="${cssSrc}" />
        <script src="https://biowasm.com/cdn/v3/aioli.js"></script>
      </head>
      <body>
          <div id="root"></div>
          <script>
          const vscode = acquireVsCodeApi();
          </script>
          <script src="${scriptSrc}"></script>
        </body>
      </html>;
  `;
}

class MyViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'myCustomView';
  private readonly _extensionUri: vscode.Uri;

  constructor(extensionUri: vscode.Uri) {
    this._extensionUri = extensionUri;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView, 
    context: vscode.WebviewViewResolveContext, 
    token: vscode.CancellationToken
  ): Thenable<void> | void 
  {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
      };
    
    let scriptSrc = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "llm-chat", "dist", "index.js"));

    let cssSrc = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "llm-chat", "dist", "index.css"));
    
    webviewView.webview.html = this._getHtmlForWebview(cssSrc, scriptSrc, webviewView.webview);
 // Add logging to ensure messages are received
    webviewView.webview.onDidReceiveMessage(message => {
  console.log(`Received message: ${JSON.stringify(message)}`);
  switch (message.command) {
    case 'alert':
    vscode.window.showInformationMessage(message.text);
    return;
  }
  });
}

private _getHtmlForWebview(cssSrc: vscode.Uri, scriptSrc: vscode.Uri, webview: vscode.Webview): string {


  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <link rel="stylesheet" href="${cssSrc}" />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Custom View</title>
  </head>
  <body>
      <h1>How can I help you!</h1>
    <div id="root"></div>
    
    <script src="${scriptSrc}"></script>
  </body>
  </html>`;
}

}
export function deactivate() { }