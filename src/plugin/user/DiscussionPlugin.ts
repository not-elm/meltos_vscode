import {OwnerResponse, RoomUserPlugin} from "../../RoomPlugin";
import {DiscussionProvider} from "../../discussion/DiscussionProvider";

export class DiscussionPlugin implements RoomUserPlugin {

    constructor(private readonly discussion: DiscussionProvider) {}

    async onOwnerMessage(message: OwnerResponse): Promise<void> {
        switch (message.name) {
            case "discussion.global.created":
                await this.discussion.created(JSON.parse(message.message));
                break;
            case "discussion.global.spoke":
                await this.discussion.spoke(JSON.parse(message.message));
                break;
            case "discussion.global.replied":
                await this.discussion.replied(JSON.parse(message.message));
                break;
            case "discussion.global.closed":
                await this.discussion.closed(JSON.parse(message.message));
                break;
            default:
                break;
        }
    }
}