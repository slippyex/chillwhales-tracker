import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export interface IPackageJson {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

function findProjectRoot(currentDir: string = __dirname): string | null {
    const parentDir = path.resolve(currentDir, '..');
    if (currentDir === parentDir) {
        return null;
    }
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
        return currentDir;
    }
    return findProjectRoot(parentDir);
}

export function deleteFile(pathName: string, file: string) {
    const resource = path.join(findProjectRoot('src'), pathName, file);
    if (fs.existsSync(resource)) {
        fs.rmSync(resource);
    }
}
export function writeFileContent(pathName: string, file: string, content: string) {
    const resource = path.join(findProjectRoot('src'), pathName, file);
    fs.writeFileSync(resource, content);
}

export function readFileContent(pathName: string, file: string, skipWriting = false): string {
    const resource = path.join(findProjectRoot('src'), pathName, file);
    // Check if the file exists
    if (!fs.existsSync(resource)) {
        // If skipWriting is true, return '{}' without writing
        if (skipWriting) {
            return '{}';
        } else {
            // If skipWriting is false, write '{}' to the file
            fs.writeFileSync(resource, '{}');
        }
    }
    // If the file exists, read and return its content
    return fs.readFileSync(resource).toString();
}
export function padRight(str: string, length: number): string {
    return str + ' '.repeat(Math.max(length - str.length, 0));
}

export function openUrl(url: string, browser: string): void {
    if (!browser || !['firefox', 'chrome'].includes(browser)) {
        openUrlInDefaultBrowser(url);
    }

    // Command to open URL in Firefox
    let command: string;

    // Detect the platform
    const platform: NodeJS.Platform = process.platform;

    if (platform === 'win32') {
        // Windows
        command = `start ${browser} ${url}`;
    } else if (platform === 'darwin') {
        // macOS
        command = `${browser === 'firefox' ? `open -a Firefox ${url}` : `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome`}`;
    } else if (platform === 'linux') {
        // Linux
        command = `${browser === 'firefox' ? `firefox ${url}` : `google-chrome ${url}`}`;
    }
    exec(command, error => {
        if (error) {
            openUrlInDefaultBrowser(url);
            return;
        }
    });
}
function openUrlInDefaultBrowser(url: string): void {
    let command: string = url; // Fallback command
    // Detect the platform
    const platform: NodeJS.Platform = process.platform;

    if (platform === 'win32') {
        // Windows
        command = `start ${url}`;
    } else if (platform === 'darwin') {
        // macOS
        command = `open ${url}`;
    } else if (platform === 'linux') {
        // Linux
        command = `xdg-open ${url}`;
    } else {
        return;
    }
    exec(command, error => {
        if (error) {
            return;
        }
    });
}
