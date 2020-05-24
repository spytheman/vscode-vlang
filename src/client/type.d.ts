import { SymbolKind } from "vscode";

export declare interface VSymbolInput {
	filepath: string;
	source: string;
}

export declare interface VTokenPosition {
	line_nr: number;
	pos: number;
	len: number;
}

export declare interface VSymbolFile {
	path: string;
	module_name: string;
	symbols: VSymbolInfo[];
}

export declare interface VSymbolInfo {
	name: string;
	pos: { line: number; column: number };
	real_pos: VTokenPosition;
	kind: SymbolKind;
}
