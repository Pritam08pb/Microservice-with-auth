import { configureStore } from '@reduxjs/toolkit';
import callReducer from './features/callSlice';

export const store = configureStore({
  reducer: {
    call: callReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
