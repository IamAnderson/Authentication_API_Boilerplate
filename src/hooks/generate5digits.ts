import crypto from 'crypto';

export const generateRandom5DigitNumber = () => {
    const randomNumber = crypto.randomInt(0, 99999);
    return randomNumber.toString().padStart(5, '0');
};
