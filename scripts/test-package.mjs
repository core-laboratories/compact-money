import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const temporary = mkdtempSync(join(tmpdir(), 'compact-money-'));
try {
	const [pack] = JSON.parse(
		execFileSync(
			'npm',
			['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
			{ cwd: root, encoding: 'utf8' },
		),
	);
	for (const file of pack.files) {
		assert.match(file.path, /^(dist\/|README\.md$|LICENSE$|package\.json$)/);
	}
	writeFileSync(
		join(temporary, 'package.json'),
		'{"private":true,"type":"module"}',
	);
	execFileSync(
		'npm',
		[
			'install',
			'--ignore-scripts',
			'--no-audit',
			'--no-fund',
			join(temporary, pack.filename),
		],
		{ cwd: temporary, stdio: 'pipe' },
	);
	const assertion = `if (compact({amount:30487,currency:'VND'}).amount !== 30487 || compact({amount:30487,allowRounding:true}).amount !== 30.5 || compact({amount:8123000}).unit !== 'k' || compact({amount:8123000,decimals:3}).amount !== 8.123 || compact !== compactAmount) throw new Error('Invalid package API');`;
	writeFileSync(
		join(temporary, 'esm.mjs'),
		`import {compact,compactAmount} from 'compact-money'; ${assertion}`,
	);
	writeFileSync(
		join(temporary, 'cjs.cjs'),
		`const {compact,compactAmount} = require('compact-money'); ${assertion}`,
	);
	for (const file of ['esm.mjs', 'cjs.cjs'])
		execFileSync(process.execPath, [file], { cwd: temporary });
	const types = `import {compact,compactAmount,type CompactOptions,type CompactResult,type CompactUnit} from 'compact-money';
const options: CompactOptions = {amount:30487, decimals:2};
const result: CompactResult = compact(options);
const unit: CompactUnit = result.unit;
compactAmount(options);
// @ts-expect-error Strings must not be accepted as amounts.
compact({amount:'30487'});
`;
	for (const file of ['consumer.mts', 'consumer.cts'])
		writeFileSync(join(temporary, file), types);
	execFileSync(
		process.execPath,
		[
			join(root, 'node_modules/typescript/bin/tsc'),
			'--noEmit',
			'--strict',
			'--module',
			'NodeNext',
			'--moduleResolution',
			'NodeNext',
			'--target',
			'ES2022',
			'consumer.mts',
			'consumer.cts',
		],
		{ cwd: temporary, stdio: 'inherit' },
	);
	const installed = JSON.parse(
		readFileSync(
			join(temporary, 'node_modules/compact-money/package.json'),
			'utf8',
		),
	);
	assert.equal(Object.keys(installed.dependencies ?? {}).length, 0);
	console.log(
		`Package verified: ${pack.files.length} files; ESM, CommonJS and both declaration entry points passed.`,
	);
} finally {
	rmSync(temporary, { recursive: true, force: true });
}
