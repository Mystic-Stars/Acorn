import { resolve } from 'node:path';
import { auditImages } from './references.mjs';

const result = await auditImages(resolve(process.cwd()));
if (result.issues.length) {
  console.error(result.issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Images OK: ${result.references} local references in ${result.files} content files.`);
}
