import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slice/authSlice";
import uiReducer from "@/store/slice/uislice";
import chatReducer from "@/store/slice/chatSlice"; // 추가

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
