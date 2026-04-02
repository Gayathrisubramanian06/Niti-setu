

async function test() {
    const res = await fetch('http://localhost:5000/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: "Maharashtra", district: "Pune", landholding: 2, crop: "Wheat", category: "General" })
    });
    const data = await res.json();
    console.log("Status:", data.status);
    console.log("Reason:", data.reason);
    const fs = require('fs');
    fs.writeFileSync('err.txt', data.errorDetails || '');
}

test();
