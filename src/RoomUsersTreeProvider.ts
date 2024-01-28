import * as vscode from "vscode";

export class RoomUsersTreeProvider implements vscode.TreeDataProvider<string> {
    private users: string[] = [];
    private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

    pushUser(userId: string) {
        this.users.push(userId);
        this._onDidChangeTreeData.fire(undefined);
    }

    deleteUser(userId: string) {
        this.users = this.users.filter(u => u !== userId);
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return new vscode.TreeItem(element);
    }

    getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
        return Promise.resolve([...this.users]);
    }
}