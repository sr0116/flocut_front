"use client";

import { useDispatch, useSelector } from "react-redux";
import { toggleChat } from "@/store/slice/uislice";
import { RootState } from "@/store";
import CharacterAvatar from "./CharacterAvatar";

export default function FloatingChatButton() {
    const dispatch = useDispatch();
    const chatOpen = useSelector(
        (state: RootState) => state.ui.chatOpen
    );

    //  챗봇 열리면 캐릭터 숨김
    if (chatOpen) return null;

    return (
        <button
            onClick={() => dispatch(toggleChat())}
            aria-label="FloCut AI"
            className="
        fixed bottom-6 right-6 z-40
        w-16 h-16
        flex items-center justify-center
        bg-transparent
        transition-transform
        hover:scale-105 active:scale-95
      "
        >
            <CharacterAvatar />
        </button>
    );
}
