const packager = require('electron-packager');

async function bundleElectronApp(asar) {
  const appPaths = await packager({
    dir: './app',
    arch: 'ia32',
    platform: 'win32',
    out: './app/release',
    appBundleId: 'Rubicon',
    overwrite: true,
    prune: true,
    icon: 'src/public/icon.ico',
    ignore: new RegExp('(files|backup)'),
    asar: Boolean(asar),
    win32metadata: {
      CompanyName: 'OA Team',
      ProductName: 'Rubicon Game Launcher',
      InternalName: 'rubicon',
      FileDescription: 'Launcher for TES4: Oblivion game and game builds with it',
      'requested-execution-level': 'requireAdministrator',
    },
  });

  console.log(`Electron app bundles created:\n${appPaths.join('\n')}`);
}

bundleElectronApp(process.argv[2]);
