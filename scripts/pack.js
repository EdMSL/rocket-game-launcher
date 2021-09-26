const packager = require('electron-packager');
const fs = require('fs');
const path = require('path');

async function bundleElectronApp(asar) {
  const appPaths = await packager({
    dir: './app',
    arch: 'ia32',
    platform: 'win32',
    out: './app/release',
    appBundleId: 'Rocket',
    overwrite: true,
    prune: true,
    icon: 'src/public/icon.ico',
    ignore: new RegExp('(files|backup|build)'),
    asar: Boolean(asar),
    win32metadata: {
      CompanyName: 'OA Team',
      ProductName: 'Rocket Game Launcher',
      InternalName: 'rocket',
      FileDescription: 'Rocket Game Launcher',
      'requested-execution-level': 'requireAdministrator',
    },
  });

  console.log(`Electron app bundles  created:\n${appPaths.join('\n')}`);

  return appPaths;
}

bundleElectronApp(process.argv[2])
  .then((data) => {
    fs.mkdirSync(path.resolve(data[0], 'backup'));
    fs.mkdirSync(path.resolve(data[0], 'themes'));
    fs.copyFileSync(
      path.resolve('./app/files/default_config.json'),
      path.resolve(data[0], 'config.json'),
    );
    fs.copyFileSync(
      path.resolve('./app/files/default_settings.json'),
      path.resolve(data[0], 'settings.json'),
    );
    fs.copyFileSync(
      './app/files/custom_styles.css',
      path.resolve(data[0], 'themes', 'custom_styles.css'),
    );
    fs.copyFileSync(
      './src/images/background.png',
      path.resolve(data[0], 'themes', 'background.png'),
    );
  }).catch((error) => console.log(error.message));

