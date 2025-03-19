// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Attendance {
    address public admin;
    address[] public studentAddresses;

    struct Student {
        string name;
        address wallet;
        uint256 attendanceCount;
    }

    mapping(address => Student) public students;

    constructor() {
        admin = msg.sender;
    }

    function addStudent(address _student, string memory _name) public {
        require(msg.sender == admin, "Only admin can add students");
        require(students[_student].wallet == address(0), "Student already exists");
        students[_student] = Student(_name, _student, 0);
        studentAddresses.push(_student);
    }

    function removeStudent(address _student) public {
        require(msg.sender == admin, "Only admin can remove students");
        require(students[_student].wallet != address(0), "Student not found");

        // Delete from mapping
        delete students[_student];

        // Remove from array (swap and pop)
        for (uint256 i = 0; i < studentAddresses.length; i++) {
            if (studentAddresses[i] == _student) {
                studentAddresses[i] = studentAddresses[studentAddresses.length - 1];
                studentAddresses.pop();
                break;
            }
        }
    }

    function markAttendance(address _student) public {
        require(students[_student].wallet != address(0), "Student not found");
        students[_student].attendanceCount += 1;
    }

    function getAttendance(address _student) public view returns (uint256) {
        return students[_student].attendanceCount;
    }

    function getStudentCount() public view returns (uint256) {
        return studentAddresses.length;
    }
}
