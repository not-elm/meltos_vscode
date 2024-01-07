import {ScmFromWebMessage} from "meltos_ts_lib/src/scm/changes/ScmFromWebMessage.ts";


export interface MessageSendable {
    /**
     *  ソースコントロールの操作をホスト側に送信します。
     *  Vscodeの拡張機能上で動作している場合、`activate`によって開始されているプロセスに送信されます。
     */
    send(message: ScmFromWebMessage): void;
}

