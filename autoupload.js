const { SFTP_HOSTNAME, SFTP_USERNAME, SFTP_PASSWORD } = process.env;
if (!SFTP_HOSTNAME) {
    console.error('SFTP_HOSTNAME not in the environment variables');
    return 1;
}

if (!SFTP_USERNAME) {
    console.error('SFTP_USERNAME not in the environment variables');
    return 1;
}

if (!SFTP_PASSWORD) {
    console.error('SFTP_PASSWORD not in the environment variables');
    return 1;
}

let Client = require('ssh2-sftp-client');
let sftp = new Client();

sftp.connect({
  host: SFTP_HOSTNAME,
  username: SFTP_USERNAME,
  password: SFTP_PASSWORD,
}).then(() => {
    const includePaths = [
        /\.$/,
        /^version.js/,
        /^version.json/,
        /^index.html/,
        /^favicon.ico/,
        /^require.js/,
        /^dist\/*/,
        /^lib\/*/,
        /^audio\/*/,
        /^css\/*/,
        /^images\/*/,
        /^levels\/*/,
    ]

    const excludePaths = [
        /\.ts$/,
    ]

    const chokidar = require('chokidar');
    const watcher = chokidar.watch('.', {ignored: (path) => {
        return !includePaths.some(pattern => {
            return path.match(pattern);
        }) || excludePaths.some(pattern => {
            return path.match(pattern);
        });
    }, persistent: true});

    const upload = (path) => {
        path = path.replaceAll('\\', '/');
        console.log(`Uploading ${path} to /home/public/${path}`);
        return sftp.put(path, `/home/public/${path}`)
            .catch(err => console.log(err));
    };

    watcher
        .on('add', upload)
        .on('change', upload)
        .on('unlink', function(path) {console.log('File', path, 'has been removed');})
        .on('error', function(error) {console.error('Error happened', error);})
}).catch(err => {
  console.log(err, 'catch error');
});