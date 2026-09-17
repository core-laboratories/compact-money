import type { CompactOptions, CompactResult } from './types.js';
import { divisors, units } from './units.js';
import { decimalPlaces } from './precision.js';
import { financialRound, roundHalfEven } from './rounding.js';

/**
 * Compact a finite amount using powers of 1,000, capped at T.
 * Without rounding, uses the largest exact unit within the decimal limit (default 0).
 * Enable half-to-even rounding with optional decimal places or financial precision.
 * Currency is preserved metadata.
 * @throws TypeError for invalid options, non-finite amounts, empty currency or invalid decimal limits.
 */
export function compact(options: CompactOptions): CompactResult {
	if (
		typeof options !== 'object' ||
		options === null ||
		Array.isArray(options)
	) {
		throw new TypeError('options must be an object');
	}
	const { amount, currency, allowRounding = false, decimals } = options;
	if (typeof amount !== 'number' || !Number.isFinite(amount)) {
		throw new TypeError('amount must be a finite number');
	}
	if (
		currency !== undefined &&
		(typeof currency !== 'string' || currency.trim().length === 0)
	) {
		throw new TypeError('currency must be a non-empty string');
	}
	if (typeof allowRounding !== 'boolean') {
		throw new TypeError('allowRounding must be a boolean');
	}
	if (
		decimals !== undefined &&
		(!Number.isInteger(decimals) || decimals < 0 || decimals > 100)
	) {
		throw new TypeError('decimals must be an integer between 0 and 100');
	}
	let index = 0;
	while (index < units.length - 1 && Math.abs(amount) >= divisors[index + 1]!)
		index++;
	if (!allowRounding) {
		const places = decimalPlaces(amount);
		while (index > 0 && places + index * 3 > (decimals ?? 0)) index--;
	}
	let normalized = amount / divisors[index]!;
	if (allowRounding) {
		normalized =
			decimals === undefined
				? financialRound(normalized)
				: roundHalfEven(normalized, decimals);
		while (Math.abs(normalized) >= 1_000 && index < units.length - 1) {
			index++;
			normalized =
				decimals === undefined
					? financialRound(normalized / 1_000)
					: roundHalfEven(normalized / 1_000, decimals);
		}
	}
	return {
		amount: normalized === 0 ? 0 : normalized,
		unit: units[index]!,
		...(currency === undefined ? {} : { currency }),
	};
}

/** Alias of compact; both names refer to the same function. */
export const compactAmount = compact;
