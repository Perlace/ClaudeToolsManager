Pour générer les icônes de build à partir du SVG:

Linux AppImage (.png):
  convert icon.svg -resize 512x512 icon.png
  (nécessite ImageMagick)

Windows (.ico):
  convert icon.svg -resize 256x256 icon.ico
  ou utiliser: https://www.icoconverter.com/

macOS (.icns):
  mkdir icon.iconset
  convert icon.svg -resize 16x16   icon.iconset/icon_16x16.png
  convert icon.svg -resize 32x32   icon.iconset/icon_16x16@2x.png
  convert icon.svg -resize 32x32   icon.iconset/icon_32x32.png
  convert icon.svg -resize 64x64   icon.iconset/icon_32x32@2x.png
  convert icon.svg -resize 128x128 icon.iconset/icon_128x128.png
  convert icon.svg -resize 256x256 icon.iconset/icon_128x128@2x.png
  convert icon.svg -resize 256x256 icon.iconset/icon_256x256.png
  convert icon.svg -resize 512x512 icon.iconset/icon_256x256@2x.png
  convert icon.svg -resize 512x512 icon.iconset/icon_512x512.png
  iconutil -c icns icon.iconset

Ou utilisez electron-icon-builder:
  npx electron-icon-builder --input=./resources/icon.svg --output=./resources
