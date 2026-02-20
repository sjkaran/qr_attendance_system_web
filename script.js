let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];

document.getElementById('generateBtn').addEventListener('click', ()=> {
    let name = document.getElementById('name').value.trim();
    let roll = document.getElementById('roll').value.trim();
    let qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = "";

    if (!name || !roll) {
        alert('Please Enter both name and roll number')
        return;
    }

    const qrData = `${roll}|${name}`
    new QRCode(qrContainer,{
        text: qrData,
        width: 180,
        height: 180,
    })

    if (!students.some((s)=> s.roll === roll)) {
        students.push({roll,name})
        localStorage.setItem('students', JSON.stringify(students));
    }

    const qrDisplayContainer = document.getElementById("qrDisplayContainer");
    const userInfo = document.getElementById("userInfo")
    userInfo.innerHTML = `<strong>Name:</strong> ${name} <br> <strong>Roll:</strong> ${roll}`;
    qrDisplayContainer.style.display = 'block';

    document.getElementById("name").value = '';
    document.getElementById("roll").value = '';
    displayAttendance()
})

function onScanSuccess(decodedText){
    const [roll, name] = decodedText.split('|')
    if (!roll || !name) {
        alert('Invalid QR Code!');
        return;
    }

    attendance.push({roll, name, status: 'Present'});
    localStorage.setItem('attendance', JSON.stringify(attendance));
    displayAttendance();
}

function onScanError(err){
    console.log(err)
}

const html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    {fps: 10, qrbox: 250},
    false
);

html5QrcodeScanner.render(onScanSuccess, onScanError)

function displayAttendance(){
    const tbody = document.querySelector("#attendanceTable tbody")
    tbody.innerHTML = ""

    const data = JSON.parse(localStorage.getItem("attendance")) || [];

    const countMap = {}
    data.forEach(item => {
        if (!countMap[item.roll]) {
            countMap[item.roll] = {name: item.name, count: 0, status: item.status}
        }
        countMap[item.roll].count++;
    });

    Object.entries(countMap).forEach(([roll, info])=>{
        let row = `
            <tr> 
                <td>${roll}</td>
                <td>${info.name}</td>
                <td style=\"color: green; font-weight: bold;\">${info.status}</td>
                <td style=\"color: blue;\">${info.count}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    })
}

displayAttendance();

document.getElementById('downloadQrBtn').addEventListener('click', ()=> {
    const qrDisplayContainer = document.getElementById('qrDisplayContainer');
    html2canvas(qrDisplayContainer).then(canvas => {
        const link = document.createElement('a');
        link.download = 'qr_code.png';
        link.href = canvas.toDataURL();
        link.click();
    })
})