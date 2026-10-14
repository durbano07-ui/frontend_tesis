// Comprime una imagen en el navegador (redimensiona + JPEG) hasta quedar bajo maxBytes.
const loadImage = (file) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('No se pudo leer la imagen'));
        };
        img.src = url;
    });

const canvasToBlob = (canvas, quality) =>
    new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));

export const compressImage = async (file, { maxDimension = 1024, maxBytes = 1024 * 1024 } = {}) => {
    const img = await loadImage(file);

    let dimension = maxDimension;
    let quality = 0.85;
    let blob = null;

    for (let attempt = 0; attempt < 8; attempt++) {
        const scale = Math.min(1, dimension / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d');
        // Fondo blanco para imágenes con transparencia (PNG) al pasar a JPEG
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        blob = await canvasToBlob(canvas, quality);
        if (blob && blob.size <= maxBytes) break;

        if (quality > 0.5) quality -= 0.15;
        else dimension = Math.round(dimension * 0.75);
    }

    if (!blob) throw new Error('No se pudo comprimir la imagen');

    const name = (file.name || 'foto').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
};
