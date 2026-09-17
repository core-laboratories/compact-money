/** Supported financial units, from base units through trillions. */
export type CompactUnit = '' | 'k' | 'M' | 'B' | 'T';

/** Input to compact(); currency is metadata and rounding defaults to false. */
export interface CompactOptions {
	readonly amount: number;
	readonly currency?: string;
	readonly allowRounding?: boolean;
	/** Maximum decimal places (0–100). Defaults to 0 without rounding, or financial precision with rounding. */
	readonly decimals?: number;
}

/** Structured numeric output; presentation belongs to the caller. */
export interface CompactResult {
	readonly amount: number;
	readonly unit: CompactUnit;
	readonly currency?: string;
}
