export interface UserRequest{
    from: string
    message: RequestMessage
}


export interface RequestMessage{
    name: string
    message: string
}


export interface OwnerResponse {
    name: string
    message: string
}

export interface RoomOwnerPlugin {
    onRequest(request: UserRequest): Promise<OwnerResponse | null>
}

export interface RoomUserPlugin {
    onOwnerMessage(message: OwnerResponse): Promise<void>
}


