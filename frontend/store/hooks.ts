import {
    useDispatch,
    useSelector,
} from "react-redux";

import type {
    AppDispatch,
    RootState,
} from "@/store/store";


/**
 * =========================================================
 * TYPED REDUX HOOKS
 * =========================================================
 *
 * These hooks provide TypeScript-aware versions of the
 * standard Redux useDispatch and useSelector hooks.
 * =========================================================
 */

export const useAppDispatch =
    useDispatch.withTypes<AppDispatch>();

export const useAppSelector =
    useSelector.withTypes<RootState>();