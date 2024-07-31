document.addEventListener('DOMContentLoaded', function() {
    const presetColors = [
        'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'aqua', 'tomato', 'springgreen', 'fuchsia'
    ];

    const createGameSection = document.getElementById('create-game-section');
    const createCodeSection = document.getElementById('create-code-section');
    const gameplaySection = document.getElementById('gameplay-section');
    const createGameForm = document.getElementById('create-game-form');

    let lastColoredDot = null; // Keep track of the last colored dot for undo functionality
    let currentResponseDotIndex = 0; // Track the current dot index in the response row
    let currentResponseRowIndex = 0; // Track the current row index in the response section
    const responseDotHistory = []; // Keep track of the response dots' history

    let currentGuessDotIndex = 0; // Track the current dot index in the guess row
    let currentGuessRowIndex = 0; // Track the current row index in the guess section
    const guessDotHistory = []; // Keep track of the guess dots' history

    // Ensure the create-game-section is visible on page load
    createGameSection.style.display = 'flex';

    createGameForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        const gameData = getFormData();
        console.log(gameData); // For debugging purposes

        initializeColorSelectionSection(gameData);
        createGameSection.style.display = 'none';
        createCodeSection.style.display = 'flex';
    });

    function getFormData() {
        return {
            p1name: document.getElementById('player-one-name').value,
            p2name: document.getElementById('player-two-name').value,
            numColors: parseInt(document.getElementById('number-of-colors').value),
            codeLength: parseInt(document.getElementById('secret-code-length').value),
        };
    }

    function initializeColorSelectionSection(gameData) {
        createColoredDots(gameData.numColors, 'color-dots-container');
        createColoredDots(gameData.numColors, 'player2-colored-dots-container');
        createGreyDots(gameData.codeLength);

        const codeArray = [];
        document.querySelectorAll('#color-dots-container .dot').forEach(dot => {
            dot.addEventListener('click', () => handleDotClick(dot, codeArray));
        });

        document.getElementById('back-button').addEventListener('click', () => undoLastDot(codeArray));
        document.getElementById('submit-new-code').addEventListener('click', () => submitSecretCode(gameData));
    }

    function createColoredDots(numColors, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear any existing dots

        for (let i = 0; i < numColors; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.color = presetColors[i % presetColors.length];
            dot.style.backgroundColor = presetColors[i % presetColors.length];
            container.appendChild(dot);
        }
    }

    function createGreyDots(codeLength) {
        const container = document.getElementById('code-color-slots');
        container.innerHTML = ''; // Clear any existing dots

        for (let i = 0; i < codeLength; i++) {
            const greyDot = document.createElement('span');
            greyDot.classList.add('dot', 'grey');
            greyDot.dataset.index = i;
            greyDot.style.backgroundColor = '#494949';
            container.appendChild(greyDot);
        }
    }

    function handleDotClick(dot, codeArray) {
        const nextGreyDot = document.querySelector('#code-color-slots .dot.grey');
        if (nextGreyDot) {
            nextGreyDot.style.backgroundColor = dot.dataset.color;
            nextGreyDot.classList.remove('grey');
            codeArray.push(nextGreyDot);
        }
    }

    function undoLastDot(codeArray) {
        if (codeArray.length > 0) {
            const lastColoredDot = codeArray.pop();
            lastColoredDot.style.backgroundColor = '#494949';
            lastColoredDot.classList.add('grey');
        }
    }

    function submitSecretCode(gameData) {
        const secretCode = Array.from(document.querySelectorAll('#code-color-slots .dot'))
            .map(dot => dot.style.backgroundColor);

        console.log('Secret Code:', secretCode); // For debugging purposes
        gameData.secretCode = secretCode;

        initializeGameplaySection(gameData);
        createCodeSection.style.display = 'none';
        gameplaySection.style.display = 'flex';
    }

    function initializeGameplaySection(gameData) {
        document.getElementById('code-master-title').innerText = gameData.p1name;
        document.getElementById('code-breaker-title').innerText = gameData.p2name;

        populateSecretCodeDots(gameData.secretCode);
        addToggleSecretCodeFunctionality();

        createGameBoardRows(gameData.numColors, gameData.codeLength);

        // Add event listeners for red and white dots
        document.getElementById('red-dot').addEventListener('click', () => handleResponseDotClick('red'));
        document.getElementById('white-dot').addEventListener('click', () => handleResponseDotClick('white'));
        document.getElementById('undo-red-white-dots').addEventListener('click', undoLastResponseDot);
        document.getElementById('submit-red-white-dots').addEventListener('click', submitResponseRow);

        // Add event listeners for codebreaker dots
        document.querySelectorAll('#player2-colored-dots-container .dot').forEach(dot => {
            dot.addEventListener('click', () => handleGuessDotClick(dot));
        });
        document.getElementById('undo-colored-dots').addEventListener('click', undoLastGuessDot);
        document.getElementById('submit-colored-dots').addEventListener('click', submitGuessRow);
    }

    function populateSecretCodeDots(secretCode) {
        const container = document.getElementById('game-board-secret-code-container');
        container.innerHTML = ''; // Clear any existing content

        secretCode.forEach(color => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.style.backgroundColor = '#000000'; // Set initial color to black
            dot.dataset.color = color; // Store the actual color in a data attribute
            container.appendChild(dot);
        });
    }

    function addToggleSecretCodeFunctionality() {
        const toggleButton = document.getElementById('toggle-secret-code-button');
        toggleButton.addEventListener('click', function() {
            const dots = document.querySelectorAll('#game-board-secret-code-container .dot');
            if (toggleButton.innerText === 'Show') {
                dots.forEach(dot => {
                    dot.style.backgroundColor = dot.dataset.color; // Set the color to the actual color
                });
                toggleButton.innerText = 'Hide';
            } else {
                dots.forEach(dot => {
                    dot.style.backgroundColor = '#000000'; // Set the color to black
                });
                toggleButton.innerText = 'Show';
            }
        });
    }

    function createGameBoardRows(numColors, codeLength) {
        const gameboard = document.getElementById('gameboard');
        gameboard.innerHTML = ''; // Clear any existing rows

        // Create table header
        const tableHeader = document.createElement('tr');
        tableHeader.id = 'table-header';
        const responseHeader = document.createElement('th');
        responseHeader.id = 'table-head-data-response';
        responseHeader.innerText = 'Codemaster Responses';
        tableHeader.appendChild(responseHeader);
        const guessHeader = document.createElement('th');
        guessHeader.innerText = 'Codebreaker Guesses';
        tableHeader.appendChild(guessHeader);
        gameboard.appendChild(tableHeader);

        // Create table rows
        for (let i = 0; i < 2 * numColors; i++) {
            const row = document.createElement('tr');

            const responseCell = createDotCell(codeLength, 'response');
            row.appendChild(responseCell);

            const guessCell = createDotCell(codeLength, 'guess');
            row.appendChild(guessCell);

            gameboard.appendChild(row);
        }
    }

    function createDotCell(numDots, type) {
        const cell = document.createElement('td');
        cell.classList.add('centered-dots', type);
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            cell.appendChild(dot);
        }
        return cell;
    }

    function handleResponseDotClick(color) {
        const currentResponseRow = document.querySelectorAll('#gameboard .response')[currentResponseRowIndex];
        const currentResponseDots = currentResponseRow.querySelectorAll('.dot');
        if (currentResponseDotIndex < currentResponseDots.length) {
            const currentDot = currentResponseDots[currentResponseDotIndex];
            if (currentDot) {
                currentDot.style.backgroundColor = color;
                lastColoredDot = currentDot;
                currentResponseDotIndex++;
                responseDotHistory.push(currentDot);
            }
        }
    }

    function undoLastResponseDot() {
        if (responseDotHistory.length > 0) {
            const lastDot = responseDotHistory.pop();
            lastDot.style.backgroundColor = '#494949';
            currentResponseDotIndex--;
        }
    }

    function submitResponseRow() {
        currentResponseDotIndex = 0;
        currentResponseRowIndex++;
        responseDotHistory.length = 0; // Clear the history after submission
    }

    function handleGuessDotClick(dot) {
        const currentGuessRow = document.querySelectorAll('#gameboard .guess')[currentGuessRowIndex];
        const currentGuessDots = currentGuessRow.querySelectorAll('.dot');
        if (currentGuessDotIndex < currentGuessDots.length) {
            const currentDot = currentGuessDots[currentGuessDotIndex];
            if (currentDot) {
                currentDot.style.backgroundColor = dot.dataset.color;
                lastColoredDot = currentDot;
                currentGuessDotIndex++;
                guessDotHistory.push(currentDot);
            }
        }
    }

    function undoLastGuessDot() {
        if (guessDotHistory.length > 0) {
            const lastDot = guessDotHistory.pop();
            lastDot.style.backgroundColor = '#494949';
            currentGuessDotIndex--;
        }
    }

    function submitGuessRow() {
        currentGuessDotIndex = 0;
        currentGuessRowIndex++;
        guessDotHistory.length = 0; // Clear the history after submission
    }
});
