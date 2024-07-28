export default {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/htmi.dev.es.js',
            format: 'es',
            name: 'htmi'
        },
        {
            file: 'dist/htmi.dev.umd.js',
            format: 'umd',
            name: 'htmi'
        }
    ]
}