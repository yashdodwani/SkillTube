# Project Setup Guide

This guide will walk you through setting up both the Python and Node.js environments for this project.

## Prerequisites

- Python 3.x
- Node.js (Latest LTS version recommended)
- npm (Comes with Node.js)

## Getting Started

### Python Environment Setup

1. **Create a Virtual Environment**

   Navigate to your project directory and create a new virtual environment:

   ```bash
   python -m venv venv
   ```

2. **Activate the Virtual Environment**

   Choose the appropriate command for your operating system:

   **Windows:**
   ```bash
   .\venv\Scripts\activate
   ```

   **macOS/Linux:**
   ```bash
   source venv/bin/activate
   ```

   You should see `(venv)` appear at the beginning of your command prompt, indicating the virtual environment is active.

3. **Install Python Dependencies**

   With the virtual environment activated, install the required packages:

   ```bash
   pip install -r server/flaskserver/requirements.txt
   ```

### Node.js Server Setup

1. **Navigate to Node Server Directory**

   ```bash
   cd server/nodeserver
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

## Project Structure

```
project/
├── server/
│   ├── flaskserver/
│   │   └── requirements.txt
│   └── nodeserver/
│       ├── package.json
│       └── ...
└── ...
```

## Development

- The Flask server handles backend Python operations
- The Node.js server runs the frontend development environment

## Troubleshooting

If you encounter any issues:

1. Ensure your Python and Node.js versions are compatible with the project
2. Check that all paths are correct for your operating system
3. Verify that the virtual environment is activated before installing Python packages
4. Make sure all required ports are available and not in use by other applications

## Contributing

Please read our contributing guidelines before submitting pull requests to the project.

## License

This project is licensed under the [LICENSE NAME] - see the LICENSE file for details.