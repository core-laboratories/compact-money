/** Internal half-to-even rounding with a small tolerance for binary midpoint noise. */
export function roundHalfEven(value: number, decimals = 0): number {
	const factor = 10 ** decimals;
	const scaled = Math.abs(value) * factor;
	// At this magnitude doubles have no fractional precision. Avoid overflow too.
	if (scaled >= 2 ** 52) return value;
	const lower = Math.floor(scaled);
	const fraction = scaled - lower;
	const tolerance = Math.min(1e-7, 2 * Number.EPSILON * scaled);
	const rounded =
		Math.abs(fraction - 0.5) <= tolerance
			? lower + (lower % 2)
			: lower + (fraction > 0.5 ? 1 : 0);
	const result = (Math.sign(value) * rounded) / factor;
	return result === 0 ? 0 : result;
}

export function financialRound(value: number): number {
	const magnitude = Math.abs(value);
	return roundHalfEven(value, magnitude < 10 ? 2 : magnitude < 100 ? 1 : 0);
}
