/**
 * Ensures @figma/plugin-typings is always the latest version.
 *
 * This script runs as part of postinstall and before dev/build.
 * It checks the npm registry for the latest version and updates if needed.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const PACKAGE_NAME = "@figma/plugin-typings";

function getInstalledVersion(): string | null {
	try {
		const pkgPath = join(
			process.cwd(),
			"node_modules",
			"@figma",
			"plugin-typings",
			"package.json",
		);
		const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
		return pkg.version;
	} catch {
		return null;
	}
}

function getLatestVersion(): string {
	const result = execSync(`npm view ${PACKAGE_NAME} version`, {
		encoding: "utf-8",
		timeout: 30000,
	}).trim();
	return result;
}

function updateTypings(): void {
	console.log(`Updating ${PACKAGE_NAME} to latest...`);
	execSync(`pnpm update ${PACKAGE_NAME} --latest`, {
		stdio: "inherit",
		timeout: 60000,
	});
}

function main(): void {
	const installed = getInstalledVersion();
	let latest: string;

	try {
		latest = getLatestVersion();
	} catch (error) {
		console.warn(
			`⚠️  Could not check latest ${PACKAGE_NAME} version (offline?). Skipping.`,
		);
		return;
	}

	if (installed === latest) {
		console.log(
			`✅ ${PACKAGE_NAME}@${installed} is the latest version.`,
		);
		return;
	}

	if (installed) {
		console.log(
			`⚠️  ${PACKAGE_NAME}@${installed} is outdated. Latest: ${latest}`,
		);
	} else {
		console.log(`⚠️  ${PACKAGE_NAME} is not installed. Latest: ${latest}`);
	}

	updateTypings();

	const updated = getInstalledVersion();
	if (updated === latest) {
		console.log(
			`✅ Successfully updated ${PACKAGE_NAME} to ${latest}.`,
		);
	} else {
		console.error(
			`❌ Failed to update ${PACKAGE_NAME}. Installed: ${updated}, Expected: ${latest}`,
		);
		process.exit(1);
	}
}

main();
