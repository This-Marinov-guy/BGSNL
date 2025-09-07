export function createRng(initialSeed) {
	let seed = initialSeed | 0;
	return function rng() {
		seed ^= seed << 13;
		seed ^= seed >> 17;
		seed ^= seed << 5;
		return Math.abs(seed) / 0xffffffff;
	};
}
