export interface DiscussionIo {
    speak(text: string): void;

    reply(to: string, text: string): void;
}


