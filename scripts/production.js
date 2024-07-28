import terser from '@rollup/plugin-terser';
import versionInjector from 'rollup-plugin-version-injector';

const versionConfig = {
    injectInComments: {
        fileRegexp: /\.(js|html|css)$/,
        tag: 'htmi, version: {version} - {date}',
        dateFormat: 'mmmm d, yyyy HH:MM:ss'
    }
}

export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/htmi.es.js',
            format: 'es',
            name: 'htmi',
            plugins: [
                versionInjector(versionConfig),
                terser()
            ]
        },
        {
            file: 'dist/htmi.umd.js',
            format: 'umd',
            name: 'htmi',
            plugins: [
                versionInjector(versionConfig),
                terser()
            ]
        }
    ]
}