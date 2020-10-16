const packageJSON = require('./package.json');

const iconBase = './build/assets/img/main';

module.exports = {
  packagerConfig: {
    appBundleId: packageJSON.name,
    appCategoryType: 'public.app-category.music',
    appCopyright: `Copyright © ${(new Date()).getFullYear()} ${packageJSON.author.name}, All rights reserved.`,
    appVersion: packageJSON.version,
    asar: true,
    buildVersion: packageJSON.version,
    name: packageJSON.productName,
    overwrite: true,
    prune: true,
    osxSign: { identity: 'Developer ID Application: Samuel Attard (S7WPQ45ZU2)' },
    ignore: (path) => {
      const tests = [
        // Ignore git directory
        () => /^\/\.git\/.*/g,
        // Ignore uwp directory
        () => /^\/\uwp\/.*/g,
        // Ignore electron-packager on Docker machines
        () => /^\/electron-packager\//g,
        // Ignore electron
        () => /^\/node_modules\/electron\//g,
        () => /^\/node_modules\/electron$/g,
        // Ignore debug files
        () => /^\/node_modules\/.*\.pdb/g,
        // Ignore native module obj files
        () => /^\/node_modules\/.*\.obj/g,
        // Ignore optional dev modules
        () => /^\/node_modules\/appdmg/g,
        () => /^\/node_modules\/electron-installer-debian/g,
        () => /^\/node_modules\/electron-installer-redhat/g,
        // Ignore symlinks in the bin directory
        () => /^\/node_modules\/.bin/g,
        // Ignore root dev FileDescription
        () => /^\/(vendor|dist|sig|docs|src|test|.cert.pfx|.editorconfig|.eslintignore|.eslintrc|.gitignore|.travis.yml|appveyor.yml|circle.yml|CONTRIBUTING.md|Gruntfile.js|gulpfile.js|ISSUE_TEMPLATE.md|LICENSE|README.md)(\/|$)/g, // eslint-disable-line
      ];
      for (let i = 0; i < tests.length; i++) {
        if (tests[i]().test(path)) {
          return true;
        }
      }
      return false;
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: packageJSON.author.name,
        exe: `${packageJSON.productName}.exe`,
        description: packageJSON.productName,
        title: packageJSON.productName,
        owners: packageJSON.author.name,
        name: 'GPMDP_3',
        noMsi: true,
        certificateFile: './.cert.pfx',
        certificatePassword: process.env.SIGN_CERT_PASS,
        iconUrl: 'https://www.samuelattard.com/img/gpmdp_setup.ico',
        setupIcon: 'build/assets/img/main.ico',
        loadingGif: 'build/assets/img/installing.gif',
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'GPMDP',
        icon: `${iconBase}.icns`,
        background: 'src/assets/img/dmg.png',
        window: {
          size: {
            width: 600,
            height: 400,
          },
        },
        contents: [
          { x: 490, y: 252, type: 'link', path: '/Applications', },
          { x: 106, y: 252, type: 'file', path: `dist/${packageJSON.productName}-darwin-x64/${packageJSON.productName}.app` },
        ],
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        bin: packageJSON.productName,
        depends: ['libappindicator1', 'avahi-daemon'],
        maintainer: `${packageJSON.author.name} <${packageJSON.author.email}>`,
        homepage: packageJSON.homepage,
        icon: 'build/assets/img/main.png',
        categories: ['AudioVideo', 'Audio'],
        section: 'sound',
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        bin: packageJSON.productName,
        depends: ['libappindicator1', 'avahi-daemon'],
        maintainer: `${packageJSON.author.name} <${packageJSON.author.email}>`,
        homepage: packageJSON.homepage,
        icon: 'build/assets/img/main.png',
        categories: ['AudioVideo', 'Audio'],
        section: 'sound',
      },
    },
  ],
};
