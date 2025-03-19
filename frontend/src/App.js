import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import AttendanceABI from './Attendance.json';

// Update this with your deployed contract address!
const CONTRACT_ADDRESS = "0xb7f8bc63bbcad18155201308c8f3540b07f84f5e";

const App = () => {
    const [contract, setContract] = useState(null);
    const [account, setAccount] = useState("");
    const [attendance, setAttendance] = useState(0);
    const [studentName, setStudentName] = useState("");
    const [studentAddress, setStudentAddress] = useState("");
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                if (window.ethereum) {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const signer = await provider.getSigner();
                    const contractInstance = new ethers.Contract(
                        CONTRACT_ADDRESS,
                        AttendanceABI.abi,
                        signer
                    );
                    
                    setContract(contractInstance);
                    const userAccount = await signer.getAddress();
                    setAccount(userAccount);

                    const initialAttendance = await contractInstance.getAttendance(userAccount);
                    setAttendance(Number(initialAttendance));

                    const studentCount = Number(await contractInstance.getStudentCount());
                    const fetchedStudents = [];
                    for (let i = 0; i < studentCount; i++) {
                        const addr = await contractInstance.studentAddresses(i);
                        const data = await contractInstance.students(addr);
                        fetchedStudents.push({
                            address: addr,
                            name: data.name,
                            count: Number(data.attendanceCount)
                        });
                    }
                    setStudents(fetchedStudents);
                } else {
                    console.error("Ethereum provider not found. Please install MetaMask.");
                }
            } catch (error) {
                console.error("Initialization error:", error);
            }
        };

        init();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', async (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    if (contract) {
                        const newAttendance = await contract.getAttendance(accounts[0]);
                        setAttendance(Number(newAttendance));
                    }
                } else {
                    setAccount("");
                    setAttendance(0);
                }
            });
        }
    }, [contract]);

    const markAttendance = async () => {
        if (!contract) return;
        try {
            console.log("Marking attendance for:", account);
            const tx = await contract.markAttendance(account);
            await tx.wait();
            alert("Attendance marked!");
            const newCount = await contract.getAttendance(account);
            setAttendance(Number(newCount));
            setStudents(prev =>
                prev.map(student =>
                    student.address === account
                        ? { ...student, count: Number(newCount) }
                        : student
                )
            );
        } catch (error) {
            console.error("Error marking attendance:", error);
            alert(error.message || "Failed to mark attendance!");
        }
    };

    const addStudent = async () => {
        if (!contract || !studentName || !studentAddress) {
            alert("Please enter both a student name and address!");
            return;
        }
        if (!ethers.isAddress(studentAddress)) {
            alert("Please enter a valid Ethereum address!");
            return;
        }
        try {
            console.log("Adding student:", studentAddress, "with name:", studentName);
            const tx = await contract.addStudent(studentAddress, studentName);
            await tx.wait();
            alert("Student Added!");
            const studentData = await contract.students(studentAddress);
            setStudents(prev => [
                ...prev.filter(student => student.address !== studentAddress),
                { address: studentAddress, name: studentName, count: Number(studentData.attendanceCount) }
            ]);
            setStudentName("");
            setStudentAddress("");
        } catch (error) {
            console.error("Error adding student:", error);
            alert(error.message || "Failed to add student!");
        }
    };

    const removeStudent = async (address) => {
        if (!contract) return;
        try {
            console.log("Removing student:", address);
            const tx = await contract.removeStudent(address);
            await tx.wait();
            alert("Student Removed!");
            setStudents(prev => prev.filter(student => student.address !== address));
            if (address === account) setAttendance(0);
        } catch (error) {
            console.error("Error removing student:", error);
            alert(error.message || "Failed to remove student!");
        }
    };

    const isRegistered = students.some(student => student.address.toLowerCase() === account.toLowerCase());

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Attendance DApp</h1>
                <p className="subtitle">Decentralized Student Attendance Tracker</p>
            </header>
            <section className="account-info">
                <p><span>Connected Account:</span> {account || "Not connected"}</p>
            </section>
            <section className="action-section">
                <div className="input-group">
                    <input
                        type="text"
                        value={studentAddress}
                        onChange={(e) => setStudentAddress(e.target.value)}
                        placeholder="Student Address"
                    />
                    <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Student Name"
                    />
                    <button onClick={addStudent} className="action-btn">Add Student</button>
                </div>
                <button
                    onClick={markAttendance}
                    disabled={!isRegistered}
                    className="mark-btn"
                >
                    Mark My Attendance
                </button>
            </section>
            <section className="attendance-display">
                <p><span>Your Attendance:</span> {attendance}</p>
            </section>
            <section className="student-list">
                <h2>Registered Students ({students.length})</h2>
                {students.length === 0 ? (
                    <p className="empty-message">No students added yet.</p>
                ) : (
                    <ul>
                        {students.map((student, index) => (
                            <li key={index} className="student-item">
                                <span className="student-details">
                                    {student.name} ({student.address.slice(0, 6)}...{student.address.slice(-4)})
                                    <span className="count-badge">{student.count}</span>
                                </span>
                                <button
                                    className="remove-btn"
                                    onClick={() => removeStudent(student.address)}
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Inline CSS */}
            <style>{`
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .app-container {
                    max-width: 900px;
                    margin: 40px auto;
                    padding: 30px;
                    background: linear-gradient(135deg, #ffffff, #f0f4f8);
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    animation: fadeIn 0.5s ease-in;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .app-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .app-header h1 {
                    font-size: 2.5rem;
                    color: #2c3e50;
                    letter-spacing: 1px;
                }

                .subtitle {
                    font-size: 1.1rem;
                    color: #7f8c8d;
                    margin-top: 5px;
                }

                .account-info {
                    background: #ecf0f1;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 25px;
                    transition: transform 0.2s;
                }

                .account-info:hover {
                    transform: scale(1.02);
                }

                .account-info p {
                    font-size: 1rem;
                    color: #34495e;
                    word-break: break-all;
                }

                .account-info span {
                    font-weight: 600;
                    color: #2980b9;
                }

                .action-section {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-group {
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                }

                input {
                    flex: 1;
                    padding: 12px 15px;
                    font-size: 1rem;
                    border: 2px solid #dcdcdc;
                    border-radius: 8px;
                    outline: none;
                    transition: border-color 0.3s, box-shadow 0.3s;
                    background: #fff;
                }

                input:focus {
                    border-color: #3498db;
                    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
                }

                input::placeholder {
                    color: #bdc3c7;
                }

                button {
                    padding: 12px 20px;
                    font-size: 1rem;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background-color 0.3s, transform 0.2s;
                }

                .action-btn {
                    background: #2ecc71;
                    color: white;
                }

                .action-btn:hover:not(:disabled) {
                    background: #27ae60;
                    transform: translateY(-2px);
                }

                .action-btn:active:not(:disabled) {
                    background: #219653;
                    transform: translateY(0);
                }

                .mark-btn {
                    background: #e67e22;
                    color: white;
                    padding: 15px;
                    font-size: 1.1rem;
                }

                .mark-btn:hover:not(:disabled) {
                    background: #d35400;
                    transform: translateY(-2px);
                }

                .mark-btn:active:not(:disabled) {
                    background: #bf4d00;
                    transform: translateY(0);
                }

                button:disabled {
                    background: #95a5a6;
                    cursor: not-allowed;
                    transform: none;
                }

                .attendance-display {
                    margin-top: 25px;
                    text-align: center;
                    padding: 15px;
                    background: #dff9fb;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }

                .attendance-display p {
                    font-size: 1.2rem;
                    color: #16a085;
                }

                .attendance-display span {
                    font-weight: 600;
                    color: #1abc9c;
                }

                .student-list {
                    margin-top: 30px;
                    padding: 20px;
                    background: #fef5e7;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }

                .student-list h2 {
                    font-size: 1.5rem;
                    color: #e67e22;
                    margin-bottom: 15px;
                }

                .student-list ul {
                    list-style: none;
                }

                .student-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 15px;
                    margin: 8px 0;
                    background: #fff;
                    border-radius: 6px;
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s;
                }

                .student-item:hover {
                    transform: translateX(5px);
                }

                .student-details {
                    color: #7f8c8d;
                    font-size: 1rem;
                }

                .count-badge {
                    display: inline-block;
                    margin-left: 10px;
                    padding: 4px 8px;
                    background: #e74c3c;
                    color: white;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .remove-btn {
                    background: #e74c3c;
                    color: white;
                    padding: 8px 12px;
                    font-size: 0.9rem;
                }

                .remove-btn:hover {
                    background: #c0392b;
                    transform: translateY(-2px);
                }

                .remove-btn:active {
                    background: #a93226;
                    transform: translateY(0);
                }

                .empty-message {
                    color: #95a5a6;
                    font-style: italic;
                    text-align: center;
                }

                /* Responsive Design */
                @media (max-width: 600px) {
                    .app-container {
                        margin: 20px;
                        padding: 20px;
                    }

                    .app-header h1 {
                        font-size: 2rem;
                    }

                    .input-group {
                        flex-direction: column;
                    }

                    button {
                        width: 100%;
                    }

                    .student-item {
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 10px;
                    }

                    .remove-btn {
                        margin-top: 10px;
                        width: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default App;
