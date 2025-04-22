document.addEventListener('DOMContentLoaded', () => {
    const tablesList = document.getElementById('tables-list');
    const reservationsList = document.getElementById('reservations-list');
    const reservationForm = document.getElementById('reservation-form');
    const reservationMessage = document.getElementById('reservation-message');
    const updateBtn = document.getElementById('update-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const reservationIdInput = document.getElementById('reservation-id');

    // Fetch and display tables
    function fetchTables() {
        fetch('http://localhost:3000/tables')
            .then(response => response.json())
            .then(tables => {
                tablesList.innerHTML = '';
                tables.forEach(table => {
                    const tableCard = document.createElement('div');
                    tableCard.className = `table-card ${table.available ? 'available' : 'unavailable'}`;
                    tableCard.innerHTML = `
                        <h3>Table ${table.id}</h3>
                        <p>Seats: ${table.seats}</p>
                        <p>Status: ${table.available ? 'Available' : 'Booked'}</p>
                    `;
                    tablesList.appendChild(tableCard);
                });
            });
    }

    // Fetch and display reservations
    function fetchReservations() {
        fetch('http://localhost:3000/reservations')
            .then(response => response.json())
            .then(reservations => {
                reservationsList.innerHTML = '';
                reservations.forEach(reservation => {
                    const reservationCard = document.createElement('div');
                    reservationCard.className = 'reservation-card';
                    reservationCard.innerHTML = `
                        <h3>Reservation #${reservation.id}</h3>
                        <p>Customer: ${reservation.customerName}</p>
                        <p>Table: ${reservation.tableId}</p>
                        <p>Guests: ${reservation.guestCount}</p>
                        <p>Time: ${new Date(reservation.time).toLocaleString()}</p>
                        <p>Status: ${reservation.status}</p>
                    `;
                    reservationsList.appendChild(reservationCard);
                });
            });
    }

    // Handle form submission
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const customerName = document.getElementById('customerName').value;
        const guestCount = parseInt(document.getElementById('guestCount').value);
        const time = document.getElementById('time').value;
        
        fetch('http://localhost:3000/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerName,
                guestCount,
                time
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                reservationMessage.className = 'error';
                reservationMessage.textContent = data.error;
            } else {
                reservationMessage.className = 'success';
                reservationMessage.textContent = data.success;
                reservationForm.reset();
                fetchTables();
                fetchReservations();
            }
        })
        .catch(error => {
            reservationMessage.className = 'error';
            reservationMessage.textContent = 'An error occurred. Please try again.';
        });
    });

    // Handle update reservation
    updateBtn.addEventListener('click', () => {
        const id = reservationIdInput.value;
        if (!id) {
            alert('Please enter a reservation ID');
            return;
        }
        
        const customerName = prompt('Enter new name:');
        const guestCount = prompt('Enter new guest count:');
        const time = prompt('Enter new time (YYYY-MM-DDTHH:MM):');
        
        if (!customerName || !guestCount || !time) {
            alert('All fields are required');
            return;
        }
        
        fetch(`http://localhost:3000/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerName,
                guestCount: parseInt(guestCount),
                time
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.success);
                fetchTables();
                fetchReservations();
            }
        })
        .catch(error => {
            alert('An error occurred. Please try again.');
        });
    });

    // Handle cancel reservation
    cancelBtn.addEventListener('click', () => {
        const id = reservationIdInput.value;
        if (!id) {
            alert('Please enter a reservation ID');
            return;
        }
        
        if (!confirm('Are you sure you want to cancel this reservation?')) {
            return;
        }
        
        fetch(`http://localhost:3000/cancel/${id}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(data.success);
                fetchTables();
                fetchReservations();
            }
        })
        .catch(error => {
            alert('An error occurred. Please try again.');
        });
    });

    // Initial load
    fetchTables();
    fetchReservations();
});