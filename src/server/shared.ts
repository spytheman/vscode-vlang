import { VSettings } from "./types";

export const defaultSettings: VSettings = {
	format: { args: "" },
	pathToExecutableFile: "v",
	linter: {
		enable: true,
		// -1 means infinity 😄
		maxNumberOfProblems: -1,
	},
};
