const fs = require('fs');
const path = require('path');

const sourceIcon = path.resolve(__dirname, 'public/icon-512.png');
const resDir = path.resolve(__dirname, 'android/app/src/main/res');

const densities = [
  'mipmap-hdpi',
  'mipmap-mdpi',
  'mipmap-xhdpi',
  'mipmap-xxhdpi',
  'mipmap-xxxhdpi',
];

if (!fs.existsSync(sourceIcon)) {
  console.error('Source icon not found:', sourceIcon);
  process.exit(1);
}

densities.forEach((density) => {
  const targetFolder = path.join(resDir, density);
  if (fs.existsSync(targetFolder)) {
    fs.copyFileSync(sourceIcon, path.join(targetFolder, 'ic_launcher.png'));
    fs.copyFileSync(sourceIcon, path.join(targetFolder, 'ic_launcher_round.png'));
    console.log(`Updated ${density} launcher icons`);
  }
});

console.log('All Android launcher icons updated successfully!');
