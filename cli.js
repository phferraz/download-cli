#!/usr/bin/env node
'use strict';

var download = require('./');
var nopt = require('nopt');
var path = require('path');
var pkg = require('./package.json');
var stdin = require('get-stdin');
var url = require('get-urls');

/**
 * Options
 */

var opts = nopt({
    extract: Boolean,
    help: Boolean,
    version: Boolean
}, {
    e: '--extract',
    h: '--help',
    v: '--version'
});

/**
 * Help screen
 */

function help() {
    console.log(pkg.description);
    console.log('');
    console.log('Usage');
    console.log('  $ download <url> [destination]');
    console.log('  $ cat <file> | download [destination]>');
    console.log('');
    console.log('Example');
    console.log('  $ download https://github.com/kevva/download/archive/master.zip --extract');
    console.log('  $ cat urls.txt | download files');
    console.log('');
    console.log('Options');
    console.log('  -e, --extract    Extract archive files on download');
}

/**
 * Show help
 */

if (opts.help) {
    help();
    return;
}

/**
 * Show package version
 */

if (opts.version) {
    console.log(pkg.version);
    return;
}

/**
 * Run
 */

function run(input) {
    var src = url(input.join(' '));
    var dest = input.filter(function (i) {
        return !i.match(/(^|\s)((https?:\/\/)?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/gi);
    })[0] || process.cwd();

    if (src.length === 0) {
        console.error('Specify a URL');
        return;
    }

    download(src, dest, { extract: opts.extract })
        .on('error', function (err) {
            throw err;
        })
        .on('close', function () {
            console.log('Successfully downloaded ' + src.length + ' files to ' + path.resolve(dest));
        });
}

/**
 * Apply arguments
 */

if (process.stdin.isTTY) {
    var input = opts.argv.remain;
    run(input);
} else {
    stdin(function (data) {
        var input = opts.argv.remain;
        [].push.apply(input, data.trim().split('\n'));
        run(input);
    });
}
