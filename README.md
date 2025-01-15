# Nyx

Nyx is a distributed file-sharing application designed to provide secure, fast, and decentralized file transfers. Inspired by the Greek goddess of the night, Nyx operates seamlessly, ensuring that your data flows effortlessly across a global network.

## Features
- **Decentralized Architecture:** Leverages peer-to-peer networking to ensure no single point of failure.
- **Secure Transfers:** Implements end-to-end encryption for all file exchanges.
- **Cross-Platform Support:** Compatible with Windows, macOS, and Linux.
- **Efficient Sharing:** Optimized algorithms for fast and reliable data transfer.
- **User-Friendly Interface:** Simple and intuitive design for all user levels.
- **Destination-Based Sharing:** Allows users to send files directly to a specific user by username, which are securely stored in a database for retrieval.
- **Custom Encryption & Scrambling:** Data encryption and scrambling implemented in C/C++ for enhanced performance and security.

## Installation

### Prerequisites
- **Node.js** (v16.0 or higher)
- **npm** (v7.0 or higher)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nyx.git
   ```
2. Navigate to the project directory:
   ```bash
   cd nyx
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the application:
   ```bash
   npm start
   ```

## Usage
1. Launch Nyx and create an account.
2. Share your unique user ID with peers to connect.
3. Drag and drop files into the app to start sharing.
4. Monitor transfer progress and manage connections via the dashboard.

## Architecture
Nyx uses a peer-to-peer (P2P) architecture to facilitate direct file transfers between users. The system incorporates:
- **WebRTC** for real-time communication.
- **DHT (Distributed Hash Table):** Enables efficient peer discovery.
- **AES-256 Encryption:** Ensures secure data exchanges.

## Contribution
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your message here"
   ```
4. Push the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License
Nyx is licensed under the [MIT License](LICENSE).

## Acknowledgments
- Special thanks to open-source libraries and contributors that made this project possible.

## Contact
For questions, feedback, or support, please contact us at [yeonholee50@gmail.com].