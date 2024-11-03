import { get, globalAgent } from 'node:https';
import { join } from 'node:path';
import { createWriteStream } from 'node:fs';

globalAgent.maxSockets = 5;

export function download({ url, dir, name }) {
  return new Promise((resolve, reject) => {
    const req = get(url, { timeout: 50000 }, (res) => {
      const filePath = join(dir, name);
      const writeToFile = createWriteStream(filePath);
      res.pipe(writeToFile);

      writeToFile.on('finish', resolve);

      writeToFile.on('error', reject);
    });

    req.on('error', reject);
  });
}
