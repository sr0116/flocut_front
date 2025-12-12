import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slice/authSlice";
import uiReducer from "@/store/slice/uislice";

/**
 * Redux Store
 * - 전역 상태 컨테이너
 */
export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
    },
});

/**
 * 타입들
 * - useSelector, useDispatch에서 사용
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
