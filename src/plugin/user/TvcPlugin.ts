import {WasmTvcClient} from "../../../wasm";
import {OwnerResponse, RoomUserPlugin} from "../../RoomPlugin";

export class TvcPlugin implements RoomUserPlugin {
    constructor(private readonly tvc: WasmTvcClient) {
    }

    async onOwnerMessage(response: OwnerResponse): Promise<void> {
        switch (response.name) {
            case "tvc.pushed":
                await this.tvc.sync_bundle(response.message);
                break;
            case "tvc.fetched":
                await this.tvc.sync_bundle(response.message);
                break;
            default:
                break;
        }
    }
}