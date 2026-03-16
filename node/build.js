const child_process = require('child_process');
const semver = require('semver');

const environmentVariables = {...process.env};

if (semver.satisfies(process.version, '>=17')) {
    environmentVariables['NODE_OPTIONS'] = '--openssl-legacy-provider';
}

child_process.spawn(
    'webpack',
    [],
    {
        env: environmentVariables,
        stdio: 'inherit',
    }
);
