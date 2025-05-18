import axios from 'axios';

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { name: 'Spicyhunt Restaurant', email: 'shittuibrahim092k@gmail.com' },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Email sent:', response.data.messageId || response.data);
  } catch (error) {
    console.error('❌ Email send error:', error.response?.data || error.message);
  }
};

export default sendEmail;
