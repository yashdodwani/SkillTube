# QuicklearnAI

QuicklearnAI is a full-stack AI-powered learning platform that enables students and teachers to interact, solve doubts, generate quizzes, and learn from any content (web, PDF, video) in real time. It combines a React frontend, Node.js/Express backend, Python Flask microservices, and AI integrations.

## Features

- **Real-time Doubt Solving:** Students can post doubts and get matched with teachers for instant chat-based resolution.
- **Quiz Generation:** Create quizzes from any website, PDF, or video using AI.
- **Video Summaries & Chat:** Summarize YouTube videos and chat with the content.
- **AI-Powered Search:** Get instant answers and summaries from web content.
- **Teacher & Student Dashboards:** Role-based dashboards for managing sessions, quizzes, and statistics.
- **File Uploads:** Upload guidebooks or lecture PDFs for content extraction and learning.
- **User Authentication:** Secure login, registration, and JWT-based authorization.

## Technologies Used

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Socket.io, Redis
- **Microservices:** Python Flask
- **AI Integrations:** Google Generative AI, Langchain, Tesseract.js
- **Database:** MongoDB (via Mongoose)
- **Other:** Multer (file uploads), JWT (auth), Morgan (logging)

## Prerequisites

- Python 3.x
- Node.js (Latest LTS)
- npm

## Getting Started

### Python Environment Setup

```bash
python -m venv venv
# Activate (Windows)
.\venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate
pip install -r server/flaskserver/requirements.txt
```

### Node.js Server Setup

```bash
cd server/nodeserver
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## Project Structure

```
QuicklearnAI/
├── client/         # React frontend
├── server/
│   ├── flaskserver/    # Python microservices
│   └── nodeserver/     # Node.js backend
└── ...
```

## Development

- Flask server handles backend Python operations (AI, OCR, etc.)
- Node.js server manages API, sockets, and user management
- React client provides the user interface

## Troubleshooting

- Ensure Python and Node.js versions are compatible
- Activate the virtual environment before installing Python packages
- Check port availability (default: 3000, 3001, 5001, 5002)
- Review logs for errors (Morgan, console)

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the [LICENSE NAME] - see the LICENSE file for details.

---
