document.addEventListener('DOMContentLoaded', () => {
    const output = document.getElementById('output');
    const commandInput = document.getElementById('command-input');

    const bootSequence = [
        { text: 'CRITICAL_SUBSYSTEM_LINK ESTABLISHED...', delay: 100 },
        { text: 'MOUNTING /dev/consciousness... OK', delay: 200 },
        { text: 'INITIALIZING OFO-SHELL v2.3.7...', delay: 150 },
        { text: 'Welcome, operator. System ready.', delay: 100 },
        { text: "Type 'help' to interface.", delay: 50 }
    ];

    async function type(text, delay = 50) {
        return new Promise(resolve => {
            let i = 0;
            const line = document.createElement('div');
            output.appendChild(line);

            function typeChar() {
                if (i < text.length) {
                    line.textContent += text.charAt(i);
                    i++;
                    scrollToBottom();
                    setTimeout(typeChar, delay);
                } else {
                    resolve();
                }
            }
            typeChar();
        });
    }

    function print(text) {
        const line = document.createElement('div');
        line.innerHTML = text; 
        output.appendChild(line);
        scrollToBottom();
    }
    

    function scrollToBottom() {
        terminal.scrollTop = terminal.scrollHeight;
    }

    function executeCommand(command) {
        const parts = command.toLowerCase().split(' ');
        const cmd = parts[0];

        switch (cmd) {
            case 'help':
                print(`Available commands:
    <span style="color: #64ffda;">help</span>    - Show this help message.
    <span style="color: #64ffda;">clear</span>   - Clear the terminal screen.
    <span style="color: #64ffda;">whoami</span>  - Display user information.
    <span style="color: #64ffda;">date</span>    - Display the current system date.`);
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'whoami':
                print('You are the operator. I am the machine.');
                break;
            case 'date':
                print(new Date().toString());
                break;
            case '':
                break; 
            default:
                print(`bash: command not found: ${command}`);
                break;
        }
    }


    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = commandInput.value.trim();
            

            print(`<span id="prompt">operator@owenofarrell:~$</span> ${command}`);

            executeCommand(command);
            
            commandInput.value = '';
            scrollToBottom();
        }
    });

    document.body.addEventListener('click', () => {
        commandInput.focus();
    });

    async function boot() {
        commandInput.disabled = true; 
        for (const line of bootSequence) {
            await type(line.text, line.delay / 4); 
        }
        commandInput.disabled = false;
        commandInput.focus();
    }

    boot();
});