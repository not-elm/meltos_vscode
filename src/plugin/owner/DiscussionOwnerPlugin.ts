import {OwnerResponse, RoomOwnerPlugin, UserRequest} from "../../RoomPlugin";
import {DiscussionProvider} from "../../discussion/DiscussionProvider";

export class DiscussionOwnerPlugin implements RoomOwnerPlugin {
    constructor(private readonly discussion: DiscussionProvider) {
    }
    async onRequest(request: UserRequest): Promise<OwnerResponse | null> {
        switch (request.message.name){
            case "discussion.global.create":

                break;
            default:
                return null;
        }
    }
}