import vscode, {Uri} from "vscode";

export const getNonce = () => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(
            Math.floor(Math.random() * possible.length)
        );
    }
    return text;
};


export const codiconsCssDir = (extensionUri: Uri) => vscode.Uri.joinPath(
    extensionUri,
    "node_modules",
    "@vscode/codicons",
    "dist"
);

export const codiconsCssPath = (extensionUri: Uri) => vscode.Uri.joinPath(
    extensionUri,
    "node_modules",
    "@vscode/codicons",
    "dist",
    "codicon.css"
);