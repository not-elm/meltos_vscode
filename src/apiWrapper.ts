import vscode from "vscode";

export const openDiffCommand = async (lhs: vscode.Uri, rhs: vscode.Uri, title: string) => {
    await vscode.commands.executeCommand(
        "vscode.diff",
        lhs,
        rhs,
        title
    );
};