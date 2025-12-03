import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Breakpoint = "base" | "tablet" | "mobile";
export type EditorMode = "select" | "move" | "preview";

export interface EditorState {
	activeBreakpoint: Breakpoint;
	isSidebarOpen: boolean;
	isGridVisible: boolean;
	selectedNodeId: string | null;
	mode: EditorMode;
}

const initialState: EditorState = {
	activeBreakpoint: "base",
	isSidebarOpen: true,
	isGridVisible: false,
	selectedNodeId: null,
	mode: "select",
};

const editorSlice = createSlice({
	name: "editor",
	initialState,
	reducers: {
		setBreakpoint(state, action: PayloadAction<Breakpoint>) {
			state.activeBreakpoint = action.payload;
		},
		toggleSidebar(state) {
			state.isSidebarOpen = !state.isSidebarOpen;
		},
		setGridVisibility(state, action: PayloadAction<boolean | undefined>) {
			state.isGridVisible =
				typeof action.payload === "boolean" ? action.payload : !state.isGridVisible;
		},
		selectNode(state, action: PayloadAction<string | null>) {
			state.selectedNodeId = action.payload;
		},
		setMode(state, action: PayloadAction<EditorMode>) {
			state.mode = action.payload;
		},
		resetEditorState() {
			return initialState;
		},
	},
});

export const {
	setBreakpoint,
	toggleSidebar,
	setGridVisibility,
	selectNode,
	setMode,
	resetEditorState,
} = editorSlice.actions;

export default editorSlice.reducer;

