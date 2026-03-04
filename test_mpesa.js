const axios = require('axios');

(async () => {
    try {
        const res = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: 'Basic eW91cl9rZXk6eW91cl9zZWNyZXQ=' }
        });
        console.log('status', res.status);
        console.log(res.data);
    } catch (e) {
        console.error('error', e.message);
    }
})();
