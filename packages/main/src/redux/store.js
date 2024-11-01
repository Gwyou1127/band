import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import chatUiReducer from '@zio/shared/redux/slices/chat-ui'
import uiReducer from '@zio/shared/redux/slices/ui'
import themeReducer from '@zio/shared/redux/slices/theme'
import sessionReducer from '@zio/shared/redux/slices/session'
import bandReducer from './slices/band'
import channelReducer from './slices/channel'

const persistConfig = {
  key: 'zioject',
  whitelist: [
    'chatUI','theme'
  ],
  blacklist: [
    'ui','session','channel'
  ],
  storage,
}

export const rootReducer = combineReducers({
  chatUI: chatUiReducer,
  ui: uiReducer,
  theme: themeReducer,
  session: sessionReducer,
  band: bandReducer,
  channel: channelReducer
})
const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware)=>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})
export const persistor = persistStore(store)