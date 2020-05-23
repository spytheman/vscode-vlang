import * as path from "path";
import { workspace, ExtensionContext, window, StatusBarAlignment } from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from "vscode-languageclient";
import { vLanguageID } from "./utils";

const languageServerName = "V Language Server";
let client: LanguageClient;

export function activate(context: ExtensionContext) {
	let serverModule = context.asAbsolutePath(path.join("out", "server.js"));
	let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
	let prepareStatus = window.createStatusBarItem(StatusBarAlignment.Right);
	prepareStatus.text = `$(sync) Initialize ${languageServerName}...`;

	prepareStatus.show();

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc, options: { cwd: process.cwd() } },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: { execArgv: ["--nolazy", "--inspect=6011"], cwd: process.cwd() },
		},
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: "file", language: vLanguageID }],
		synchronize: { fileEvents: workspace.createFileSystemWatcher("**/*.v") },
	};

	client = new LanguageClient(languageServerName, serverOptions, clientOptions);

	client
		.onReady()
		.then(() => {
			prepareStatus.text = `$(check) ${languageServerName} is ready!`;
			client.registerProposedFeatures();
		})
		.catch(() => (prepareStatus.text = `$(close) ${languageServerName} is failed`))
		.finally(() => setTimeout(() => prepareStatus.dispose(), 5000));

	// client.sendRequest("initialize");
	// Start the client. This will also launch the server
	context.subscriptions.push(client.start());
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) return undefined;
	return client.stop();
}
