const child_process = require('child_process');

child_process.spawn(
    'webpack',
    [],
    {
        stdio: 'inherit',
    }
);
