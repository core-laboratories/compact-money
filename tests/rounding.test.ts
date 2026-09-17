import assert from 'node:assert/strict';
import { it } from 'node:test';
import { financialRound, roundHalfEven } from '../src/rounding.js';

const cases = [
	[2.5, 0, 2],
	[3.5, 0, 4],
	[4.5, 0, 4],
	[5.5, 0, 6],
	[1.245, 2, 1.24],
	[1.255, 2, 1.26],
	[12.45, 1, 12.4],
	[12.55, 1, 12.6],
	[1.244999999, 2, 1.24],
	[1.245000001, 2, 1.25],
	[1.254999999, 2, 1.25],
	[1.255000001, 2, 1.26],
	[2.499999999, 0, 2],
	[2.500000001, 0, 3],
	[0.005, 2, 0],
	[0.015, 2, 0.02],
	[1.234, 2, 1.23],
	[1_000_000_000_000_000.25, 0, 1_000_000_000_000_000],
	[1_000_000_000_000_000.5, 0, 1_000_000_000_000_000],
	[1_000_000_000_000_001.5, 0, 1_000_000_000_000_002],
	[Number.MAX_VALUE, 0, Number.MAX_VALUE],
	[Number.MAX_VALUE, 2, Number.MAX_VALUE],
] as const;
for (const [value, decimals, expected] of cases) {
	it(`half-even ${value} at ${decimals} decimals -> ${expected}`, () => {
		assert.equal(roundHalfEven(value, decimals), expected);
		assert.equal(
			roundHalfEven(-value, decimals),
			expected === 0 ? 0 : -expected,
		);
	});
}
it('defaults to zero decimal places', () =>
	assert.equal(roundHalfEven(2.5), 2));
for (const [value, expected] of [
	[8.123, 8.12],
	[81.234, 81.2],
	[812.345, 812],
] as const) {
	it(`financial precision ${value} -> ${expected}`, () => {
		assert.equal(financialRound(value), expected);
	});
}
