export default function generateAuthCode() {
    const authCode = [];

    for ( let x = 0; x < 6; x++ ) {
        const number = Math.floor(Math.random() * 10);
        
        authCode.push(number === 10 ? 9 : number);
    }

    return authCode.join(" ");
}