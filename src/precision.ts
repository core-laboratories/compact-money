/** Decimal places in the input's shortest decimal representation; may be negative. */
export function decimalPlaces(value: number): number {
	const [coefficient, exponent = '0'] = value.toString().split('e');
	const point = coefficient!.indexOf('.');
	const fractionLength = point < 0 ? 0 : coefficient!.length - point - 1;
	const digits = coefficient!.replace('.', '');
	const trailingZeros = digits.length - digits.replace(/0+$/, '').length;
	return fractionLength - Number(exponent) - trailingZeros;
}
