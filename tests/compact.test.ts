import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
	compact,
	compactAmount,
	type CompactOptions,
	type CompactResult,
} from '../src/index.js';

const cases = JSON.parse(
	readFileSync('tests/fixtures/compaction.json', 'utf8'),
) as {
	input: CompactOptions;
	expected: CompactResult;
}[];

describe('cross-language examples and thresholds', () => {
	for (const { input, expected } of cases) {
		it(`${JSON.stringify(input)} -> ${JSON.stringify(expected)}`, () => {
			assert.deepEqual(compact(Object.freeze(input)), expected);
		});
	}
});

it('rounding is opt-in for both entry points', () => {
	const options = { amount: 30487, currency: 'VND' };
	assert.equal(compact(options).amount, 30487);
	assert.equal(compactAmount(options).amount, 30487);
	assert.equal(compact({ ...options, allowRounding: true }).amount, 30.5);
});
it('exports a true alias', () => assert.equal(compactAmount, compact));
it('omits absent and explicitly undefined currency', () => {
	assert.deepEqual(compact({ amount: 80000 }), { amount: 80, unit: 'k' });
	assert.equal(
		Object.hasOwn(
			compact({
				amount: 80000,
				currency: undefined,
			} as unknown as CompactOptions),
			'currency',
		),
		false,
	);
});
for (const amount of [0, -0, -0.001, Number.MIN_VALUE, -Number.MIN_VALUE]) {
	it(`normalizes zero for ${amount}`, () => {
		const result = compact({ amount, allowRounding: true });
		assert.deepEqual(result, { amount: 0, unit: '' });
		assert.equal(Object.is(result.amount, -0), false);
	});
}
for (const amount of [0, -0, Number.MIN_VALUE, -Number.MIN_VALUE]) {
	it(`preserves tiny values without rounding: ${amount}`, () => {
		const result = compact({ amount, allowRounding: false });
		assert.equal(result.amount, amount === 0 ? 0 : amount);
		assert.equal(result.unit, '');
	});
}
for (const amount of [
	NaN,
	Infinity,
	-Infinity,
	'80',
	null,
	undefined,
	1n,
	{},
]) {
	it(`rejects invalid amount ${String(amount)}`, () => {
		assert.throws(() => compact({ amount } as CompactOptions), TypeError);
	});
}
for (const options of [null, undefined, [], 42, 'options']) {
	it(`rejects invalid options ${String(options)}`, () => {
		assert.throws(
			() => compact(options as unknown as CompactOptions),
			TypeError,
		);
	});
}
for (const currency of ['', '   ', '\t\n', null, 123, {}]) {
	it(`rejects invalid currency ${JSON.stringify(currency)}`, () => {
		assert.throws(
			() => compact({ amount: 1, currency } as CompactOptions),
			TypeError,
		);
	});
}
for (const allowRounding of [null, 0, 'false']) {
	it(`rejects invalid rounding flag ${String(allowRounding)}`, () => {
		assert.throws(
			() => compact({ amount: 1, allowRounding } as unknown as CompactOptions),
			TypeError,
		);
	});
}
for (const amount of [
	Number.MAX_VALUE,
	-Number.MAX_VALUE,
	Number.MAX_SAFE_INTEGER,
	-Number.MAX_SAFE_INTEGER,
]) {
	it(`supports large finite values ${amount}`, () => {
		const result = compact({ amount, allowRounding: true });
		assert.equal(Number.isFinite(result.amount), true);
		assert.equal(result.unit, 'T');
		if (Math.abs(amount) === Number.MAX_VALUE)
			assert.equal(result.amount, amount / 1e12);
	});
}

for (const decimals of [
	-1,
	101,
	1.5,
	NaN,
	Infinity,
	-Infinity,
	null,
	'2',
	true,
	{},
]) {
	it(`rejects invalid decimals ${String(decimals)}`, () => {
		assert.throws(
			() => compact({ amount: 8123456, decimals } as unknown as CompactOptions),
			TypeError,
		);
	});
}
