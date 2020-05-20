declare interface VSymbolInput {
	filepath: string;
	source: string;
}

declare interface VTokenPosition {
	line_nr: number;
	pos: number;
	len: number;
}

declare interface VSymbolFile {
	path: string;
	module_name: string;
	symbols: VSymbolInfo[];
}

declare interface VSymbolInfo {
	name: string;
	pos: { line: number; column: number };
	real_pos: VTokenPosition;
	kind: string;
}
