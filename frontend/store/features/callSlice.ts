import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CallStatus = "Idle" | "Connected" | "Incoming call" | "Calling..." | "Call connected 🎥" | "Call rejected ❌" | "Call ended 📴";

interface CallState {
  myUserId: string;
  targetUserId: string;
  incomingCaller: string | null;
  lkToken: string | null;
  status: CallStatus;
}

const initialState: CallState = {
  myUserId: "",
  targetUserId: "",
  incomingCaller: null,
  lkToken: null,
  status: "Idle",
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    setMyUserId: (state, action: PayloadAction<string>) => {
      state.myUserId = action.payload;
    },
    setTargetUserId: (state, action: PayloadAction<string>) => {
      state.targetUserId = action.payload;
    },
    setIncomingCaller: (state, action: PayloadAction<string | null>) => {
      state.incomingCaller = action.payload;
    },
    setLkToken: (state, action: PayloadAction<string | null>) => {
      state.lkToken = action.payload;
    },
    setStatus: (state, action: PayloadAction<CallStatus>) => {
      state.status = action.payload;
    },
    resetCallState: (state) => {
      state.incomingCaller = null;
      state.lkToken = null;
      state.status = "Idle";
      // We keep myUserId and targetUserId around for convenience
    }
  },
});

export const {
  setMyUserId,
  setTargetUserId,
  setIncomingCaller,
  setLkToken,
  setStatus,
  resetCallState
} = callSlice.actions;

export default callSlice.reducer;
