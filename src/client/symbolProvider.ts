import {
	CancellationToken,
	DocumentSymbolProvider,
	Location,
	SymbolInformation,
	SymbolKind,
	TextDocument,
	Position,
} from "vscode";
import { getExtensionPath, getCwd } from "./utils";
import { join } from "path";
import { spawn } from "child_process";

const extensionPath = getExtensionPath();

class VDocumentSymbolProvider implements DocumentSymbolProvider {
	public provideDocumentSymbols(
		doc: TextDocument,
		token: CancellationToken
	): Thenable<SymbolInformation[]> {
		return new Promise((resolve, reject) => {
			if (token.isCancellationRequested) reject();

			const symbols: SymbolInformation[] = [];
			const vsymbolsExec = join(extensionPath, "./bin", "vsymbols");
			const cwd = getCwd(doc.uri);

			const request: VSymbolInput = {
				filepath: doc.fileName,
				source: doc.getText(),
			};

			const requestString = JSON.stringify(request);
			const child = spawn(vsymbolsExec, { cwd });
			child.stdin.write(requestString);

			child.on("error", (err) => reject(err));

			child.stdout.on("data", (data) => {
				const response: VSymbolFile = JSON.parse(data.toString());
				const vsymbols: VSymbolInfo[] = response.symbols;

				for (const symbol of vsymbols) {
					const range = new Position(symbol.pos.line - 1, symbol.real_pos.len + 3);
					const newSymbol: SymbolInformation = {
						name: symbol.name,
						containerName: response.module_name,
						kind: toSymbolKind(symbol.kind),
						location: new Location(doc.uri, range),
					};
					symbols.push(newSymbol);
				}
			});

			child.on("close", () => resolve(symbols));
			child.stdin.end();
		});
	}
}

function toSymbolKind(type: string): SymbolKind {
	switch (type) {
		case "method": {
			return SymbolKind.Method;
		}
		case "struct": {
			return SymbolKind.Struct;
		}
		case "function": {
			return SymbolKind.Function;
		}
		case "const": {
			return SymbolKind.Constant;
		}
		default: {
			return SymbolKind.Variable;
		}
	}
}

export default VDocumentSymbolProvider;
