import { useDispatch as useDispatchRedux } from "react-redux";
import { store } from "../store";

type AppDispatch = typeof store.dispatch;

export const useDispatch = () => useDispatchRedux<AppDispatch>();
