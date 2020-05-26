import { ExtensionContext, commands, window, workspace, languages, TextEditor, TextDocument } from "vscode";
import * as vCommands from "./commands";
import { registerFormatter } from "./format";
import { attachOnCloseTerminalListener } from "./exec";
import { lint, collection } from "./linter";
import { clearTempFolder, getVConfig } from "./utils";
import VDocumentSymbolProvider from "./symbolProvider";

const vLanguageId = "v";

const cmds = {
	"v.run": vCommands.run,
	"v.ver": vCommands.ver,
	"v.help": vCommands.help,
	"v.prod": vCommands.prod,
	"v.test.file": vCommands.testFile,
	"v.playground": vCommands.playground,
	"v.test.package": vCommands.testPackage,
};

/**
 * This method is called when the extension is activated.
 * @param context The extension context
 */
export function activate(context: ExtensionContext) {
	for (const cmd in cmds) {
		const handler = cmds[cmd];
		const disposable = commands.registerCommand(cmd, handler);
		context.subscriptions.push(disposable);
	}

	context.subscriptions.push(registerFormatter(), attachOnCloseTerminalListener());

	if (getVConfig().get("enableLinter")) {
		context.subscriptions.push(
<<<<<<< HEAD
			vscode.window.onDidChangeVisibleTextEditors(didChangeVisibleTextEditors),
			vscode.workspace.onDidSaveTextDocument(didSaveTextDocument),
			vscode.workspace.onDidCloseTextDocument(didCloseTextDocument),
			vscode.languages.registerDocumentSymbolProvider(
				{ language: vLanguageId },
				new VDocumentSymbolProvider(context)
			)
=======
			window.onDidChangeVisibleTextEditors(didChangeVisibleTextEditors),
			workspace.onDidSaveTextDocument(didSaveTextDocument),
			workspace.onDidCloseTextDocument(didCloseTextDocument),
			languages.registerDocumentSymbolProvider({ language: vLanguageId }, new VDocumentSymbolProvider(context))
>>>>>>> dev
		);
		const activeTextEditor = window.activeTextEditor;
		// If there are V files open, do the lint immediately
<<<<<<< HEAD
		if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.languageId === vLanguageId) {
			lint(vscode.window.activeTextEditor.document);
=======
		if (activeTextEditor && activeTextEditor.document.languageId === vLanguageId) {
			lint(activeTextEditor.document);
>>>>>>> dev
		}
	}
}

/**
 *  Handles the `onDidChangeVisibleTextEditors` event
 */
function didChangeVisibleTextEditors(editors: Array<TextEditor>) {
	editors.forEach(({ document }) => {
		if (document.languageId === vLanguageId) {
			lint(document);
		}
	});
}

/**
 *  Handles the `onDidSaveTextDocument` event
 */
function didSaveTextDocument(document: TextDocument) {
	if (document.languageId === vLanguageId) {
		lint(document);
	}
}

/**
 *  Handles the `onDidCloseTextDocument` event
 */
function didCloseTextDocument(document: TextDocument) {
	if (document.languageId === vLanguageId) {
		if (!window.activeTextEditor) collection.clear();
		collection.delete(document.uri);
	}
}

/**
 * This method is called when the extension is deactivated.
 */
export function deactivate() {
	clearTempFolder();
}
