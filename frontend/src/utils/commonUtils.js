import axios from 'axios';
import { parseISO, format } from 'date-fns';

export const calculateTime = (iso8601 = '') => {
    if (!iso8601) return null;
    const date = parseISO(iso8601);

    const day = format(date, 'dd');
    const month = format(date, 'MM');
    const year = format(date, 'yyyy');

    const hours = format(date, 'HH');
    const minutes = format(date, 'mm');

    return {
        day,
        month,
        year,
        hours,
        minutes,
    };
};

export const getCroppedImg = (imageSrc, crop) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = crop.width;
            canvas.height = crop.height;

            ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

            canvas.toBlob((blob) => {
                if (!blob) {
                    return reject('Canvas is empty');
                }
                const fileUrl = URL.createObjectURL(blob);
                resolve(fileUrl);
            }, 'image/jpeg');
        };
        image.onerror = reject;
    });
};

export const uploadToCloudinary = async (image) => {
    let formData = new FormData();

    formData.append('api_key', import.meta.env.VITE_CLOUDINARY_KEY);
    formData.append('file', image);
    formData.append('public_id', `file_${Date.now()}`);
    formData.append('timestamp', (Date.now() / 1000) | 0);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
        const res = await axios.post(import.meta.env.VITE_CLOUDINARY_URL, formData);
        return res.data?.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
    }
};
