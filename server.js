const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: "Online",
        app: "Al-Humaidi Media for Profit",
        message: "Server is running 24/7 successfully!"
    });
});

app.post('/api/calculate-reward', (req, res) => {
    const { totalAmount } = req.body;

    if (!totalAmount || isNaN(totalAmount)) {
        return res.status(400).json({
            error: "Please provide a valid totalAmount"
        });
    }

    const ownerShare = totalAmount * 0.40;
    const userShare = totalAmount * 0.60;

    res.json({
        total: totalAmount,
        ownerShare: ownerShare,
        userShare: userShare
    });
});

app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
