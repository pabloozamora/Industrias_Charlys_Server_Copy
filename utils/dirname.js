import { fileURLToPath } from 'url';
import path from 'path';

export default (metaUrl) => path.dirname(fileURLToPath(metaUrl));
