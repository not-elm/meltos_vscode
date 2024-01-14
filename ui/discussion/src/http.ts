export const openRoom = async (userId?: string) => {
    const response = await fetch(`https://localhost:3000/room/open`, {
        method: "POST",
        body: JSON.stringify({
            user_id: userId
        })
    });
    const json = await response.json();
    return json;
}


export const speak = async (
    roomId: string,
    sessionId: string,
    discussionId: string,
    message: string
) => {
    const response = await fetch(`https://localhost:3000/room/${roomId}/discussion/speak`, {
        method: "POST",
        headers: {
            "set-cookie": `session_id=${sessionId}`
        },
        body: JSON.stringify({
            discussion_id: discussionId,
            message
        })
    });
    const json = await response.json();
    return json;
}