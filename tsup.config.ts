import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm', 'cjs'],
	// tsup's declaration bundler still sets baseUrl internally.
	dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
	clean: true,
	target: 'es2022',
	treeshake: true,
});
