import {ClosedType, CreatedType, DiscussionMetaType, RepliedType, SpokeType,} from "../../types/api";
import {DiscussionBundleType} from "meltos_ts_lib/dist/discussion";

export interface DiscussionData {
    meta: DiscussionMetaType;
    messages: MessageThread[];
}

export interface MessageThread {
    message: MessageData;
    replies?: MessageData[];
}

export interface MessageData {
    id: string;
    user_id: string;
    text: string;
}

export interface DiscussionIo {
    /**
     * サーバとローカルの状態を同期させます。
     *
     * @param discussions 全てのディスカッションのバンドルデータ
     */
    sync(discussions: DiscussionBundleType[]): Promise<void>;


    /**
     * ローカルにディスカッションデータを作成します。
     *
     * @param created
     */
    created(created: CreatedType): Promise<void>;


    spoke(spoke: SpokeType): Promise<void>;

    replied(replied: RepliedType): Promise<void>;

    closed(closed: ClosedType): Promise<void>;

    dispose(): Promise<void>;

    discussionIds(): DiscussionMetaType[];

    discussion(id: string): DiscussionData | undefined;
}

