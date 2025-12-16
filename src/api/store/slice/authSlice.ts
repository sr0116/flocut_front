// src/store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  memberId?: number;
  accessToken?: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{
        memberId: number;
        accessToken: string;
      }>
    ) {
      //   백엔드에서 처리하니까 엑세스토큰이 필요없을 수 있음 확인 필요
      //   이니셜 -> 로딩이랑 에러 같이 넣는 경우
      state.isAuthenticated = true;
      state.memberId = action.payload.memberId;
      state.accessToken = action.payload.accessToken;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.memberId = undefined;
      state.accessToken = undefined;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
