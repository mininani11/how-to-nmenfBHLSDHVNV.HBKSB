// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Toncenter API base URL
const TONCENTER_API = "https://toncenter.com/api/v2/";

// Endpoint to verify payment
app.post('/verify-payment', async (req, res) => {
    const { userWallet, recipientWallet, amountTON } = req.body;

    try {
        // Fetch transactions from the user's wallet
        const response = await axios.get(`${TONCENTER_API}getTransactions`, {
            params: {
                address: userWallet,
                limit: 10,
                api_key: process.env.TON_API_KEY
            }
        });

        const transactions = response.data.result;

        // Check if any transaction matches the recipient address and amount
        const matchingTransaction = transactions.find(tx => {
            return tx.in_msg.destination === recipientWallet &&
                   tx.in_msg.value / 1e9 >= amountTON; // Convert from nanoTON to TON
        });

        if (matchingTransaction) {
            res.status(200).json({ success: true, message: "Payment confirmed!" });
        } else {
            res.status(400).json({ success: false, message: "Payment not found." });
        }

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ success: false, message: "Error verifying payment." });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
