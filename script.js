document.addEventListener('DOMContentLoaded', () => {
    const optionButtons = document.querySelectorAll('.option-btn');
    const giftModal = document.getElementById('giftModal');
    const cashModal = document.getElementById('cashModal');

    // --- Helper function to open modal ---
    function openModal(modal, day) {
        // Prevent opening if the day has already been submitted
        const gridItem = document.querySelector(`.grid-item[data-day="${day}"]`);
        if (gridItem && gridItem.classList.contains('submitted-day')) {
            console.log(`Attempt to open modal for already submitted Day ${day}`);
            return;
        }

        // Set the day number in the modal title
        const dayDisplay = modal.querySelector(`#${modal.id}Day`);
        if (dayDisplay) {
            dayDisplay.textContent = `Day ${day}`;
        }

        // Set the day number in the hidden form input
        const dayInput = modal.querySelector(`#${modal.id.replace('Modal', '')}DayInput`);
        if (dayInput) {
            dayInput.value = day;
        }

        modal.style.display = 'block';
    }

    // --- Helper function to close modal ---
    function closeModal(modal) {
        modal.style.display = 'none';
        // Reset the form inside the modal
        modal.querySelector('form').reset();
    }

    // --- Event listener for grid buttons (Opens Modals) ---
    optionButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const gridItem = event.target.closest('.grid-item');
            const day = gridItem.dataset.day;
            const option = event.target.dataset.option;

            // Do not open modal if already submitted
            if (gridItem.classList.contains('submitted-day')) {
                return;
            }

            if (option === 'cash') {
                openModal(cashModal, day);
            } else if (option === 'gift') {
                openModal(giftModal, day);
            }
        });
    });

    // --- Close modal handlers (X button) ---
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            closeModal(event.target.closest('.modal'));
        });
    });

    // Close modal if user clicks outside of it
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target);
        }
    }

    // --- Form Submission Logic ---

    function handleSubmission(formId, modalId) {
        const form = document.getElementById(formId);
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            // 1. Capture the day, form data, and grid item
            const day = document.getElementById(`${formId.replace('Form', '')}DayInput`).value;
            const gridItem = document.querySelector(`.grid-item[data-day="${day}"]`);
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            if (gridItem) {
                // Get the winner's username for the email subject/body
                const winnerUsername = gridItem.querySelector('.username').textContent.replace('@', '');

                let subject;
                let body;

                // 2. Format data for email based on the form type
                if (formId === 'cashForm') {
                    subject = `Cash Preference Submission for Day ${day} (${winnerUsername})`;
                    body = `
Winner: @${winnerUsername}
Day: ${day}

Payment Method: ${data.method}
Handle/Username: ${data.handle}

Please ensure this information is correct before sending.
--- PLEASE DO NOT REPLY TO THIS EMAIL ---
                    `.trim();
                } else { // giftForm
                    subject = `Gift Idea Submission for Day ${day} (${winnerUsername})`;
                    body = `
Winner: @${winnerUsername}
Day: ${day}

Requested Gift Description:
${data.description}

Please ensure this information is correct before sending.
--- PLEASE DO NOT REPLY TO THIS EMAIL ---
                    `.trim();
                }

                // 3. Construct the mailto link
                const mailtoLink = `mailto:chrisenussbaum@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

                // 4. Update the visual state of the grid immediately
                const optionType = formId === 'cashForm' ? 'cash' : 'gift';
                const selectedButton = gridItem.querySelector(`.option-btn[data-option="${optionType}"]`);
                const otherButton = gridItem.querySelector(`.option-btn:not([data-option="${optionType}"])`);

                gridItem.classList.add('submitted-day');
                selectedButton.classList.add('submitted');
                selectedButton.textContent = `✅ SENT`; // Update text for clear confirmation
                otherButton.classList.add('faded');

                console.log(`Submission successful for Day ${day}. Opening email client...`);

                // 5. Close the modal
                closeModal(document.getElementById(modalId));

                // 6. Open the email client (triggers the 'sending' action)
                window.location.href = mailtoLink;
            }
        });
    }

    // Initialize submission handlers for both forms
    handleSubmission('cashForm', 'cashModal');
    handleSubmission('giftForm', 'giftModal');
});
