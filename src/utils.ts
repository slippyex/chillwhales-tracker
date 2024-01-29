import path from 'path';
import fs from 'fs';

export function writeFileContent(pathName: string, file: string, content: string) {
    const resource = path.join(__dirname, '..', pathName, file);
    fs.writeFileSync(resource, content);
}

export function readFileContent(pathName: string, file: string): string {
    const resource = path.join(__dirname, '..', pathName, file);
    if (!fs.existsSync(resource)) {
        fs.writeFileSync(resource, '{}');
    }
    return fs.readFileSync(resource).toString();
}

export function padRight(str: string, length: number): string {
    return str + ' '.repeat(Math.max(length - str.length, 0));
}
