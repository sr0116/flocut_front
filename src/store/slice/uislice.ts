import { createSlice } from "@reduxjs/toolkit";

/**
 * UI 상태 슬라이스
 * - 사이드바, 모달 등 UI 토글용
 */
const uiSlice = createSlice({
    name: "ui",
    initialState: {
        sidebarOpen: false,
    },
    reducers: {
        toggleSidebar(state) {
            state.sidebarOpen = !state.sidebarOpen;
        },
    },
});

export const { toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
