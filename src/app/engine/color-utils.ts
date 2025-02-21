function hexToRgba(hex: string): [number, number, number, number] {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b, 255];
  }
  
export async function addTransparency(
    imageBitmap: ImageBitmap,
    fromColorHex: string,
    tolerance: number = 0
  ): Promise<ImageBitmap> {
    const fromColor = hexToRgba(fromColorHex);
  
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
  
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get 2D context');
  
    ctx.drawImage(imageBitmap, 0, 0);
  
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
  
    const isColorMatch = (i: number): boolean => {
      return (
        Math.abs(data[i] - fromColor[0]) <= tolerance &&
        Math.abs(data[i + 1] - fromColor[1]) <= tolerance &&
        Math.abs(data[i + 2] - fromColor[2]) <= tolerance &&
        Math.abs(data[i + 3] - fromColor[3]) <= tolerance
      );
    };
  
    for (let i = 0; i < data.length; i += 4) {
      if (isColorMatch(i)) {
        data[i + 3] = 0;
      }
    }
  
    ctx.putImageData(imageData, 0, 0);
  
    return await createImageBitmap(canvas);
  }
  