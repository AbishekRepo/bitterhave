export interface LiveCopilotSession {
    id: string;
    user_id: string;
    api_key: string;
    session_key: string;
    hotkey: string;
    is_active: boolean;
    last_ping: string | null;
    created_at: string;
    expires_at: string | null;
}

export interface LiveCopilotScreenshot {
    id: string;
    session_id: string;
    image_id: string;
    filename: string;
    storage_path: string | null;
    ai_response: string | null;
    created_at: string;
}