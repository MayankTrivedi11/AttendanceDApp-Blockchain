# Attendance DApp

A decentralized application (DApp) for tracking student attendance on the Ethereum blockchain. Built with Solidity for the smart contract, Hardhat for development, and React with vanilla CSS for the frontend, this project allows an admin to register students, students to mark their attendance, and provides a clean, modern UI to manage the process.


![image](https://github.com/user-attachments/assets/7618a09a-0878-4816-9568-aef52ce1a1c2)


## Features
- **Admin Functions**: Add and remove students using their Ethereum addresses and names.
- **Student Actions**: Registered students can mark their attendance using their connected wallet.
- **Dynamic UI**: Displays the connected account’s attendance, a list of all registered students with their attendance counts, and disables marking attendance for unregistered accounts.
- **Pretty Design**: A polished frontend with gradients, animations, and responsive layout using vanilla CSS.

## Prerequisites
To run this project locally, you’ll need:
- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MetaMask](https://metamask.io/) browser extension
- A terminal (e.g., Git Bash, Windows Terminal, or any Unix shell)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/devdan98/AttendanceDApp.git
cd attendance-dapp
```

### 2. Install Dependencies

Install both root (Hardhat) and frontend (React) dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Compile the Smart Contract

Compile the Solidity contract to generate artifacts:
```bash
npx hardhat compile
```
This creates the `artifacts/` directory with the contract’s ABI and bytecode.

### 4. Start the Hardhat Node

Run a local Ethereum blockchain:
```bash
npx hardhat node
```
This starts a local network at `http://localhost:8545` with 20 test accounts. Keep this terminal running.

> **Note**: The first account (e.g., `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`) is the admin by default.

### 5. Deploy the Contract

In a new terminal, deploy the contract to the local network:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
Copy the deployed contract address from the output (e.g., `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`).

Update the `CONTRACT_ADDRESS` constant in `frontend/src/App.js` with this address:
```javascript
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_ADDRESS_HERE";
```

### 6. Sync the ABI

Copy the compiled ABI to the frontend:
```bash
cp artifacts/contracts/Attendance.sol/Attendance.json frontend/src/Attendance.json
```
Alternatively, manually copy the `abi` array from `artifacts/contracts/Attendance.sol/Attendance.json` into `frontend/src/Attendance.json`.

### 7. Start the Frontend

In a new terminal, launch the React app:
```bash
cd frontend
npm start
```
This opens the app at `http://localhost:3000` in your browser.

### 8. Connect MetaMask

1. Open MetaMask in your browser.
2. Switch to the "Localhost 8545" network (add it if needed: RPC URL `http://localhost:8545`, Chain ID `1337`).
3. Import one of the Hardhat test accounts using its private key (visible in the `npx hardhat node` output).

## Usage

### Admin Actions (using the first Hardhat account):
1. Connect the admin account in MetaMask.
2. Enter a student’s Ethereum address (e.g., `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`) and name (e.g., "Alice").
3. Click "Add Student" to register them.
4. Remove students by clicking "Remove" next to their entry.

### Student Actions:
1. Switch to a registered student’s account in MetaMask (e.g., Alice’s account).
2. Click "Mark My Attendance" to increment your attendance count (disabled if unregistered).

### View Data:
- The connected account’s attendance is shown in the "Your Attendance" section.
- The student list displays all registered students with their names, truncated addresses, and attendance counts.

## Troubleshooting

- **Contract Not Deployed**: Ensure the `CONTRACT_ADDRESS` matches the deployed address.
- **MetaMask Errors**: Verify the network is "Localhost 8545" and the account has ETH (Hardhat accounts start with 10,000 ETH).
- **Frontend Not Loading**: Check that the Hardhat node is running and the ABI is synced.

## Development

- **Smart Contract**: Edit `contracts/Attendance.sol`, then recompile and redeploy.
- **Frontend**: Modify `frontend/src/App.js` for UI or logic changes; the app hot-reloads automatically.
- **Styling**: Customize the inline CSS in `App.js` to tweak the design.
