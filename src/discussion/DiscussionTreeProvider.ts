import * as vscode from "vscode";
import { ProviderResult, TreeItem } from "vscode";
import { DiscussionIo } from "./io/DiscussionIo";
import { DiscussionMetaType } from "../types/api";

export class DiscussionTreeProvider
    implements vscode.TreeDataProvider<DiscussionMetaType>
{
    private _onDidChangeTreeData: vscode.EventEmitter<any> =
        new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> =
        this._onDidChangeTreeData.event;

    constructor(private readonly io: DiscussionIo) {}

    getTreeItem(
        element: DiscussionMetaType
    ): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const item = new TreeItem(element.title);
        item.command = {
            title: "show discussion",
            command: "meltos.discussion.show",
            arguments: [element.id],
        };
        return item;
    }

    getChildren(
        element?: DiscussionMetaType
    ): ProviderResult<DiscussionMetaType[]> {
        return [...this.io.discussionIds()];
    }

    notify() {
        this._onDidChangeTreeData.fire(undefined);
    }
}
